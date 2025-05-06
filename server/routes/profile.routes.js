const express = require("express");
const axios = require("axios");
const router = express.Router();
const profileController = require("../controllers/profile.controller.js");
const { apiBaseUrl } = require("../config/spotify.config.js");

const { verifySession } = require("../middleware/middleware.session");

router.get("/", verifySession, async (req, res) => {
    try {
        const profile = await axios.get(`${apiBaseUrl}/me`, {
            headers: { Authorization: `Bearer ${req.session.accessToken}` },
        });
        res.json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Get user's top artists
router.get("/top-artists", verifySession, async (req, res) => {
    try {
        const { time_range = "medium_term" } = req.query;
        const { access_token } = req.session.accessToken;

        const response = await axios.get(`${apiBaseUrl}/me/top/artists`, {
            headers: { Authorization: `Bearer ${access_token}` },
            params: {
                time_range,
                limit: 50,
            },
        });

        res.json({
            items: response.data.items.map((artist) => ({
                id: artist.id,
                name: artist.name,
                genres: artist.genres,
                images: artist.images,
                popularity: artist.popularity,
                uri: artist.uri,
            })),
        });
    } catch (error) {
        console.error(
            "Top artists error:",
            error.response?.data || error.message
        );
        res.status(error.response?.status || 500).json({
            error: "Failed to fetch top artists",
            details: error.response?.data || error.message,
        });
    }
});

// Get user's top tracks
router.get("/top-tracks", verifySession, async (req, res) => {
    try {
        const { time_range = "medium_term" } = req.query;
        const { access_token } = req.session.accessToken;

        const response = await axios.get(`${apiBaseUrl}/me/top/tracks`, {
            headers: { Authorization: `Bearer ${access_token}` },
            params: {
                time_range,
                limit: 50,
            },
        });

        res.json({
            items: response.data.items.map((track) => ({
                id: track.id,
                name: track.name,
                artists: track.artists.map((a) => ({ id: a.id, name: a.name })),
                album: {
                    id: track.album.id,
                    name: track.album.name,
                    images: track.album.images,
                },
                duration_ms: track.duration_ms,
                popularity: track.popularity,
                uri: track.uri,
            })),
        });
    } catch (error) {
        console.error(
            "Top tracks error:",
            error.response?.data || error.message
        );
        res.status(error.response?.status || 500).json({
            error: "Failed to fetch top tracks",
            details: error.response?.data || error.message,
        });
    }
});

router.get("/analysis", verifySession, profileController.getProfile);

module.exports = router;
