const axios = require("axios");
const qs = require("querystring");
const spotifyConfig = require("../config/spotify.config");
const supabase = require("../config/supabase.config");
const { generateRandomString } = require("../utils/helpers");

// Initiate Spotify login
const login = (req, res) => {
    const state = generateRandomString(16);
    req.session.state = state;

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
    res.redirect(authUrl.toString());
};

// Handle Spotify callback
const callback = async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.session.state;

    if (state === null || state !== storedState) {
        return res.status(400).json({ error: "State mismatch" });
    }

    req.session.state = null;

    try {
        // Get access token
        const tokenResponse = await axios.post(
            spotifyConfig.tokenUrl,
            qs.stringify({
                code,
                redirect_uri: spotifyConfig.redirectUri,
                grant_type: "authorization_code",
            }),
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

        // Get user profile from Spotify
        const userResponse = await axios.get(`${spotifyConfig.apiBaseUrl}/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { id, display_name, email, images } = userResponse.data;

        // Save or update user in Supabase
        const { data: user, error } = await supabase
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

        if (error) throw error;

        // Set session
        req.session.userId = user.id;
        req.session.spotifyId = id;
        req.session.accessToken = access_token;

        // Redirect to frontend with tokens
        res.redirect(
            `http://localhost:5173/callback?access_token=${access_token}&refresh_token=${refresh_token}`
        );
    } catch (error) {
        console.error("Error in callback:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    const { refresh_token } = req.body;

    try {
        const response = await axios.post(
            spotifyConfig.tokenUrl,
            qs.stringify({
                grant_type: "refresh_token",
                refresh_token: refresh_token,
            }),
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

        // Update user in Supabase
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

        res.json({ access_token });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ error: "Failed to refresh token" });
    }
};

// Logout
const logout = (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    res.json({ success: true });
};

module.exports = { login, callback, refreshToken, logout };
