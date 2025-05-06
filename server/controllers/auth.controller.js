const axios = require("axios");
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

    // Store state and security parameters in session
    req.session.state = state;
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

        // Add security headers to the redirect
        res.set({
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Frame-Options": "DENY",
        });
        res.redirect(authUrl.toString());
    });
};

exports.callback = async (req, res) => {
    const { code, state, error: spotifyError } = req.query;
    const storedState = req.session.state;
    const stateExpires = req.session.stateExpires;

    // Set security headers for all responses
    res.set({
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "DENY",
    });

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

    // Validate code parameter
    if (!code || typeof code !== "string") {
        const errorMsg = "Invalid authorization code";
        console.error(errorMsg);
        await logAuthAttempt(req, { error: errorMsg });
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=invalid_code`
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

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

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
                    token_expires_at: tokenExpiresAt.toISOString(),
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
                // status: "success",
            });

        if (auditError) throw auditError;

        // Log successful authentication
        await logAuthAttempt(req, {
            success: true,
            userId: user.id,
            spotifyId: id,
        });
        // Create new session with regeneration
        req.session.regenerate(async (err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res
                    .status(500)
                    .redirect(
                        `${process.env.FRONTEND_URL}/error?code=session_fail`
                    );
            }

            // Set new session data
            console.log(user);
            req.session.userId = user.id;
            console.log("User ID set in session:", user.id);
            req.session.spotifyId = id;
            console.log("Spotify ID set in session:", id);
            req.session.csrfToken = generateRandomString(32);
            req.session.sessionStart = new Date().toISOString();
            req.session.tokenExpiresAt = tokenExpiresAt.toISOString();

            // Explicitly save the new session
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("Session save error:", saveErr);
                    return res
                        .status(500)
                        .redirect(
                            `${process.env.FRONTEND_URL}/error?code=session_save`
                        );
                }

                // Set secure cookie headers for cross-origin
                res.setHeader("Set-Cookie", [
                    `connect.sid=${req.sessionID}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=86400`,
                ]);

                res.redirect(`${process.env.FRONTEND_URL}/profile`);
            });
        });
    } catch (error) {
        console.error("Authentication error:", error);
        await logAuthAttempt(req, {
            error: error.message,
            stack: error.stack,
        });
        return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=auth_failed`
        );
    }
};

// Helper function to log authentication attempts
async function logAuthAttempt(
    req,
    { error = null, userId = null, spotifyId = null }
) {
    try {
        await supabase.from("auth_attempts").insert({
            user_id: userId,
            spotify_id: spotifyId,
            ip_address: req.ip,
            user_agent: req.headers["user-agent"],
            error: error,

            attempted_at: new Date().toISOString(),
            session_id: req.sessionID,
        });
    } catch (logError) {
        console.error("Failed to log auth attempt:", logError);
    }
}

exports.refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    // Input validation
    if (!refresh_token || typeof refresh_token !== "string") {
        return res.status(400).json({ error: "Invalid refresh token" });
    }

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

        const {
            access_token,
            expires_in,
            refresh_token: new_refresh_token,
        } = response.data;
        const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

        // Update user token in database
        const updateData = {
            access_token: access_token,
            token_expires_at: tokenExpiresAt.toISOString(),
        };

        if (new_refresh_token) {
            updateData.refresh_token = new_refresh_token;
        }

        const { error } = await supabase
            .from("users")
            .update(updateData)
            .eq("refresh_token", refresh_token);

        if (error) throw error;

        // Update session expiration if exists
        if (req.session) {
            req.session.tokenExpiresAt = tokenExpiresAt.toISOString();
            req.session.touch(); // Extends session expiry
        }

        res.json({
            access_token,
            expires_in,
            token_expires_at: tokenExpiresAt.toISOString(),
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        const statusCode = error.response?.status || 500;
        const message =
            error.response?.data?.error || "Failed to refresh token";
        res.status(statusCode).json({
            error: message,
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

exports.logout = async (req, res) => {
    if (!req.session.userId) {
        return res.status(400).json({ error: "No active session" });
    }

    try {
        // Verify the session belongs to a valid user
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("id", req.session.userId)
            .single();

        if (userError || !user) {
            req.session.destroy();
            return res.status(401).json({ error: "Invalid session" });
        }

        // Update all active session audits (not just the latest)
        const { error: auditError } = await supabase
            .from("session_audit")
            .update({
                logout_at: new Date().toISOString(),
                session_duration: `${
                    (new Date() - new Date(req.session.sessionStart)) / 1000
                } seconds`,
            })
            .eq("user_id", req.session.userId)
            .is("logout_at", null);

        if (auditError) throw auditError;

        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error:", err);
                throw err;
            }

            // Clear the session cookie securely
            res.clearCookie("soundSouls.sid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                domain: process.env.COOKIE_DOMAIN,
            });

            res.json({ success: true });
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            error: "Failed to logout",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

exports.status = async (req, res) => {
    console.log(req.session);
    console.log("console of usedId in status", req.session.userId);
    if (!req.session.userId) {
        return res.json({ isLoggedIn: false });
    }

    try {
        // Verify session and token expiration
        const { data: user, error: userError } = await supabase
            .from("users")
            .select(
                "id, spotify_id, display_name, profile_image, token_expires_at"
            )
            .eq("id", req.session.userId)
            .single();

        // If user doesn't exist or token expired, destroy session
        if (
            userError ||
            !user ||
            new Date(user.token_expires_at) < new Date()
        ) {
            req.session.destroy();
            return res.json({ isLoggedIn: false });
        }

        res.json({
            isLoggedIn: true,
            csrfToken: req.session.csrfToken, // Include CSRF token for security
            user: {
                id: user.spotify_id,
                display_name: user.display_name,
                profile_image: user.profile_image,
            },
            token_expires_at: user.token_expires_at, // Frontend can use this for auto-refresh
        });
    } catch (error) {
        console.error("Session status error:", error);
        req.session.destroy();
        res.json({ isLoggedIn: false });
    }
};
