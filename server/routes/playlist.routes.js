const express = require("express");
const router = express.Router();
const axios = require("axios");
const spotifyConfig = require("../config/spotify.config");
const { analyzeMusicTaste } = require("../services/ai.service");
const { playlistPrompt } = require("../utils/prompts");

// Get user's saved playlists
router.get("/", async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const response = await axios.get(
            `${spotifyConfig.apiBaseUrl}/me/playlists?limit=50`,
            { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
        );

        // Format response to match frontend expectations
        const playlists = response.data.items.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
            description: playlist.description,
            externalUrl: playlist.external_urls.spotify,
            imageUrl: playlist.images?.[0]?.url,
            tracks: {
                total: playlist.tracks.total,
            },
        }));

        res.json(playlists);
    } catch (error) {
        console.error("Error fetching playlists:", error);
        res.status(500).json({ error: "Failed to fetch playlists" });
    }
});

// Generate new playlist concept
router.post("/generate", async (req, res) => {
    if (!req.session.accessToken || !req.session.spotifyId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description } = req.body;

    try {
        // Get user's top tracks
        const tracksResponse = await axios.get(
            `${spotifyConfig.apiBaseUrl}/me/top/tracks?time_range=medium_term&limit=50`,
            { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
        );

        const topTracks = tracksResponse.data.items.map((track) => ({
            id: track.id,
            name: track.name,
            artists: track.artists.map((artist) => ({ name: artist.name })),
            album: {
                name: track.album.name,
                images: track.album.images,
            },
            uri: track.uri,
        }));

        // Get AI-generated playlist concept
        const playlistConcept = await analyzeMusicTaste(
            playlistPrompt(topTracks, name)
        );

        // Extract track URIs from the concept
        const trackUris =
            playlistConcept.match(/spotify:track:[a-zA-Z0-9]+/g) || [];

        // Filter top tracks to only include those in the AI selection
        const selectedTracks = topTracks.filter((track) =>
            trackUris.includes(track.uri)
        );

        // Return the generated playlist (not saved yet)
        res.json({
            id: null, // No ID until saved
            name: `SoundSouls: ${name}`,
            description:
                description ||
                `AI-generated playlist based on your music taste`,
            tracks: selectedTracks,
            externalUrl: null, // Will be set after saving
        });
    } catch (error) {
        console.error("Error generating playlist:", error);
        res.status(500).json({ error: "Failed to generate playlist" });
    }
});

// Save generated playlist to Spotify
router.post("/save", async (req, res) => {
    if (!req.session.accessToken || !req.session.spotifyId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, description, tracks } = req.body;

    try {
        // Create playlist on Spotify
        const playlistResponse = await axios.post(
            `${spotifyConfig.apiBaseUrl}/users/${req.session.spotifyId}/playlists`,
            {
                name,
                description,
                public: true,
            },
            { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
        );

        const playlistId = playlistResponse.data.id;

        // Add tracks to playlist
        await axios.post(
            `${spotifyConfig.apiBaseUrl}/playlists/${playlistId}/tracks`,
            { uris: tracks.slice(0, 100) }, // Spotify limit is 100 tracks per request
            { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
        );

        // Get the full playlist details with external URL
        const fullPlaylistResponse = await axios.get(
            `${spotifyConfig.apiBaseUrl}/playlists/${playlistId}`,
            { headers: { Authorization: `Bearer ${req.session.accessToken}` } }
        );

        // Format response to match frontend expectations
        res.json({
            id: playlistId,
            name: fullPlaylistResponse.data.name,
            description: fullPlaylistResponse.data.description,
            externalUrl: fullPlaylistResponse.data.external_urls.spotify,
            tracks: {
                items: fullPlaylistResponse.data.tracks.items.map((item) => ({
                    id: item.track.id,
                    name: item.track.name,
                    artists: item.track.artists.map((artist) => ({
                        name: artist.name,
                    })),
                    album: {
                        name: item.track.album.name,
                        images: item.track.album.images,
                    },
                    uri: item.track.uri,
                })),
                total: fullPlaylistResponse.data.tracks.total,
            },
        });
    } catch (error) {
        console.error("Error saving playlist:", error);
        res.status(500).json({ error: "Failed to save playlist" });
    }
});

module.exports = router;
