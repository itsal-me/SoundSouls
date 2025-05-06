const express = require("express");
const router = express.Router();
const axios = require("axios");
const spotifyConfig = require("../config/spotify.config");
const Analysis = require("../models/analysis.model");
const { analyzeMusicTaste } = require("../services/ai.service");
const { generateProfileImage } = require("../services/image.service");
const {
    profilePrompt,
    archetypePrompt,
    emojiPrompt,
} = require("../utils/prompts");

const { verifySession } = require("../middleware/middleware.session");

// Get existing analysis
router.get("/", verifySession, async (req, res) => {
    try {
        const analysis = await Analysis.findByUserId(req.session.userId);
        if (!analysis) {
            return res.status(404).json({ error: "No analysis found" });
        }

        res.json({
            personality: analysis.personality_summary,
            archetype: analysis.music_archetype,
            description: analysis.music_archetype, // Using archetype as description
            emojis: analysis.music_emojis.split(" "), // Split emojis into array
            horoscope: generateHoroscope(analysis.music_archetype), // Add helper function
            genres: analysis.top_genres,
            imageUrl: analysis.profile_image_url,
        });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        res.status(500).json({ error: "Failed to fetch analysis" });
    }
});

// Generate new analysis
router.post("/generate", verifySession, async (req, res) => {
    try {
        const { time_range = "medium_term" } = req.query;

        // Fetch fresh data from Spotify
        const [tracksResponse, artistsResponse] = await Promise.all([
            axios.get(
                `${spotifyConfig.apiBaseUrl}/me/top/tracks?time_range=${time_range}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                }
            ),
            axios.get(
                `${spotifyConfig.apiBaseUrl}/me/top/artists?time_range=${time_range}&limit=50`,
                {
                    headers: {
                        Authorization: `Bearer ${req.session.accessToken}`,
                    },
                }
            ),
        ]);

        const topTracks = tracksResponse.data.items;
        const topArtists = artistsResponse.data.items;

        // Process genres
        const genres = {};
        topArtists.forEach((artist) => {
            artist.genres.forEach((genre) => {
                genres[genre] = (genres[genre] || 0) + 1;
            });
        });

        const sortedGenres = Object.entries(genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre]) => genre);

        // AI Analysis
        const [personality, archetype, emojis] = await Promise.all([
            analyzeMusicTaste(
                profilePrompt({
                    topTracks: topTracks.slice(0, 10),
                    topArtists: topArtists.slice(0, 10),
                    topGenres: sortedGenres,
                })
            ),
            analyzeMusicTaste(
                archetypePrompt({
                    topTracks: topTracks.slice(0, 10),
                    topArtists: topArtists.slice(0, 10),
                    topGenres: sortedGenres,
                })
            ),
            analyzeMusicTaste(
                emojiPrompt({
                    topTracks: topTracks.slice(0, 10),
                    topArtists: topArtists.slice(0, 10),
                    topGenres: sortedGenres,
                })
            ),
        ]);

        // Generate profile image
        const profileImageUrl = await generateProfileImage({
            username: req.session.displayName,
            topGenres: sortedGenres,
            topArtists: topArtists.slice(0, 3).map((a) => a.name),
            archetype,
            emojis,
            personality: personality.substring(0, 200) + "...",
        });

        // Save to database
        const analysisData = {
            user_id: req.session.userId,
            time_range,
            top_tracks: topTracks,
            top_artists: topArtists,
            top_genres: sortedGenres,
            personality_summary: personality,
            music_archetype: archetype,
            music_emojis: emojis,
            profile_image_url: profileImageUrl,
        };

        await Analysis.upsert(analysisData);

        // Return in expected frontend format
        res.json({
            personality,
            archetype,
            description: archetype,
            emojis: emojis.split(" "),
            horoscope: generateHoroscope(archetype),
            genres: sortedGenres,
            imageUrl: profileImageUrl,
        });
    } catch (error) {
        console.error("Error generating analysis:", error);
        res.status(500).json({ error: "Failed to generate analysis" });
    }
});

// Generate shareable image
router.post("/image", verifySession, async (req, res) => {
    try {
        const analysis = await Analysis.findByUserId(req.session.userId);
        if (!analysis) {
            return res.status(404).json({ error: "No analysis found" });
        }

        // Generate new image if none exists or force refresh
        const imageUrl = await generateProfileImage({
            username: req.session.displayName,
            topGenres: analysis.top_genres,
            topArtists: analysis.top_artists.slice(0, 3).map((a) => a.name),
            archetype: analysis.music_archetype,
            emojis: analysis.music_emojis,
            personality: analysis.personality_summary.substring(0, 200) + "...",
        });

        // Update analysis with new image URL
        await Analysis.upsert({
            ...analysis,
            profile_image_url: imageUrl,
        });

        res.json({ imageUrl });
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

// Helper function for horoscope generation
function generateHoroscope(archetype) {
    const horoscopes = {
        "The Nostalgic Dreamer":
            "Your musical journey is about to take a beautiful turn back in time.",
        "The Eclectic Explorer":
            "New sounds are coming your way - stay open to unexpected discoveries.",
        // Add more archetype-specific horoscopes
    };
    return (
        horoscopes[archetype] ||
        "Your music stars are aligning for an amazing listening experience."
    );
}

module.exports = router;
