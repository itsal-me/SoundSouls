const axios = require("axios");
// const qs = require("querystring");
const spotifyConfig = require("../config/spotify.config");
const supabase = require("../config/supabase.config");
const crypto = require("crypto");

// Generate secure random string
const generateRandomString = (length) => {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
};

exports.login = (req, res) => {
    const state = generateRandomString(16);
    console.log("Generated state:", state);
    req.session.csrfToken = generateRandomString(32);
    // Store state in session
    req.session.state = state;

    // Set state expiration (5 minutes)
    req.session.stateExpires = new Date(Date.now() + 300000);

    req.session.loginAttemptAt = new Date().toISOString();

    req.session.save((err) => {
        if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        const authUrl = new URL(spotifyConfig.authUrl);
        const params = {
            response_type: "code",
            client_id: spotifyConfig.clientId,
            scope: spotifyConfig.scopes.join(" "),
            redirect_uri: spotifyConfig.redirectUri,
            state: state,
            show_dialog: true,
        };

        authUrl.search = new URLSearchParams(params).toString();
        console.log("Redirecting to:", authUrl.toString());
        res.redirect(authUrl.toString());
    });
};

exports.callback = async (req, res) => {
    const { code, state, error: spotifyError } = req.query;
    const storedState = req.session.state;
    const stateExpires = req.session.stateExpires;

    // Handle potential errors from Spotify
    if (spotifyError) {
        await logAuthAttempt(req, { error: spotifyError });
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
                spotifyError
            )}`
        );
    }

    // Validate state parameter

    if (!state || !storedState || state !== storedState) {
        const errorMsg = "State mismatch - Possible CSRF attack";
        console.error(errorMsg, { received: state, expected: storedState });
        await logAuthAttempt(req, { error: errorMsg });
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=state_mismatch`
        );
    }

    // Check state expiration (5 minute window)
    if (Date.now() > stateExpires) {
        const errorMsg = "State expired - Authentication took too long";
        console.error(errorMsg);
        await logAuthAttempt(req, { error: errorMsg });
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=state_expired`
        );
    }

    try {
        // Get access token
        const params = new URLSearchParams();
        params.append("code", code);
        params.append("redirect_uri", spotifyConfig.redirectUri);
        params.append("grant_type", "authorization_code");

        const tokenResponse = await axios.post(
            spotifyConfig.tokenUrl,
            params.toString(), // converts to x-www-form-urlencoded string
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
                        ).toString("base64"),
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Get user profile
        const userResponse = await axios.get(`${spotifyConfig.apiBaseUrl}/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { id, display_name, email, images } = userResponse.data;

        // Save user session to database
        const { data: user, error: userError } = await supabase
            .from("users")
            .upsert(
                {
                    spotify_id: id,
                    display_name: display_name,
                    email: email,
                    profile_image: images?.[0]?.url,
                    access_token: access_token,
                    refresh_token: refresh_token,
                    token_expires_at: new Date(
                        Date.now() + expires_in * 1000
                    ).toISOString(),
                },
                { onConflict: "spotify_id" }
            )
            .select()
            .single();

        if (userError) throw userError;

        // Create session audit log
        const { error: auditError } = await supabase
            .from("session_audit")
            .insert({
                user_id: user.id,
                ip_address: req.ip,
                user_agent: req.headers["user-agent"],
                login_at: new Date().toISOString(),
            });

        if (auditError) throw auditError;

        // Set session data
        req.session.regenerate((err) => {
            if (err) throw err;

            req.session.userId = user.id;
            req.session.spotifyId = id;
            req.session.accessToken = access_token;
            req.session.csrfToken = generateRandomString(32);
            req.session.sessionStart = new Date().toISOString();

            res.redirect(
                `${process.env.FRONTEND_URL}/callback?access_token=${access_token}&refresh_token=${refresh_token}`
            );
        });
    } catch (error) {
        console.error("Authentication error:", error);
    } finally {
        // Clear the state regardless of outcome
        req.session.state = null;
        req.session.stateExpires = null;
    }
};

//helper function to log authentication attempts
async function logAuthAttempt(req, { error = null }) {
    try {
        await supabase.from("auth_attempts").insert({
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
            error: error,
            attempted_at: new Date().toISOString(),
        });
    } catch (logError) {
        console.error("Failed to log auth attempt:", logError);
    }
}

exports.refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    try {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", refresh_token);

        const response = await axios.post(
            spotifyConfig.tokenUrl,
            params.toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
                        ).toString("base64"),
                },
            }
        );

        const { access_token, expires_in } = response.data;

        // Update user token in database
        const { error } = await supabase
            .from("users")
            .update({
                access_token: access_token,
                token_expires_at: new Date(
                    Date.now() + expires_in * 1000
                ).toISOString(),
            })
            .eq("refresh_token", refresh_token);

        if (error) throw error;

        // Update session if exists
        if (req.session) {
            req.session.accessToken = access_token;
            req.session.touch();
        }

        res.json({ access_token });
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(500).json({ error: "Failed to refresh token" });
    }
};

exports.logout = async (req, res) => {
    if (!req.session.userId) {
        return res.status(400).json({ error: "No active session" });
    }

    try {
        // Update session audit log
        await supabase
            .from("session_audit")
            .update({
                logout_at: new Date().toISOString(),
                session_duration: `${
                    (new Date() - new Date(req.session.sessionStart)) / 1000
                } seconds`,
            })
            .eq("user_id", req.session.userId)
            .is("logout_at", null)
            .order("login_at", { ascending: false })
            .limit(1);

        // Destroy session
        req.session.destroy((err) => {
            if (err) throw err;

            res.clearCookie("soundSouls.sid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                domain: process.env.COOKIE_DOMAIN || undefined,
            });

            res.json({ success: true });
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Failed to logout" });
    }
};

exports.status = async (req, res) => {
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false });
    }

    try {
        // Verify session in database
        const { data: user } = await supabase
            .from("users")
            .select("id, spotify_id, display_name, profile_image")
            .eq("id", req.session.userId)
            .single();

        if (!user) {
            req.session.destroy();
            return res.json({ isLoggedIn: false });
        }

        res.json({
            isLoggedIn: true,
            user: {
                id: user.spotify_id,
                display_name: user.display_name,
                profile_image: user.profile_image,
            },
        });
    } catch (error) {
        console.error("Session status error:", error);
        res.json({ isLoggedIn: false });
    }
};
