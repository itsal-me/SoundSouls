const axios = require("axios");
const spotifyConfig = require("../config/spotify.config");
const supabase = require("../config/supabase.config");
const { analyzeMusicTaste } = require("../services/ai.service");
const { generateProfileImage } = require("../services/image.service");
const {
    profilePrompt,
    archetypePrompt,
    emojiPrompt,
} = require("../utils/prompts");

// Get user profile with analysis
const getProfile = async (req, res) => {
    const { time_range = "medium_term" } = req.query;
    const accessToken = req.session.accessToken;

    try {
        // Get top tracks and artists from Spotify
        const [tracksResponse, artistsResponse] = await Promise.all([
            axios.get(
                `${spotifyConfig.apiBaseUrl}/me/top/tracks?time_range=${time_range}&limit=50`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            ),
            axios.get(
                `${spotifyConfig.apiBaseUrl}/me/top/artists?time_range=${time_range}&limit=50`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            ),
        ]);

        const topTracks = tracksResponse.data.items;
        const topArtists = artistsResponse.data.items;

        // Extract genres from top artists
        const genres = {};
        topArtists.forEach((artist) => {
            artist.genres.forEach((genre) => {
                genres[genre] = (genres[genre] || 0) + 1;
            });
        });

        // Sort genres by frequency
        const sortedGenres = Object.entries(genres)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre]) => genre);

        // Format data for AI analysis
        const musicData = {
            topTracks: topTracks.map((track) => ({
                name: track.name,
                artists: track.artists.map((artist) => artist.name),
                album: track.album.name,
                duration_ms: track.duration_ms,
                popularity: track.popularity,
            })),
            topArtists: topArtists.map((artist) => ({
                name: artist.name,
                genres: artist.genres,
                popularity: artist.popularity,
            })),
            topGenres: sortedGenres,
        };

        // Perform AI analysis
        const [personality, archetype, emojis] = await Promise.all([
            analyzeMusicTaste(profilePrompt(musicData)),
            analyzeMusicTaste(archetypePrompt(musicData)),
            analyzeMusicTaste(emojiPrompt(musicData)),
        ]);

        // Get user info from Supabase
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("spotify_id", req.session.spotifyId)
            .single();

        if (userError) throw userError;

        // Save analysis to Supabase
        const { error: analysisError } = await supabase.from("analyses").upsert(
            {
                user_id: user.id,
                time_range,
                top_tracks: topTracks,
                top_artists: topArtists,
                top_genres: sortedGenres,
                personality_summary: personality,
                music_archetype: archetype,
                music_emojis: emojis,
                last_updated: new Date().toISOString(),
            },
            { onConflict: "user_id,time_range" }
        );

        if (analysisError) throw analysisError;

        // Generate profile image
        const profileImageUrl = await generateProfileImage({
            username: user.display_name,
            topGenres: sortedGenres,
            topArtists: topArtists.slice(0, 3).map((a) => a.name),
            archetype,
            emojis,
            personality: personality.substring(0, 200) + "...", // Truncate for image
        });

        // Return complete profile
        res.json({
            user: {
                id: user.spotify_id,
                name: user.display_name,
                image: user.profile_image,
            },
            musicData: {
                tracks: topTracks.slice(0, 10),
                artists: topArtists.slice(0, 10),
                genres: sortedGenres,
            },
            analysis: {
                personality,
                archetype,
                emojis,
            },
            profileImageUrl,
            timeRange: time_range,
        });
    } catch (error) {
        console.error("Error getting profile:", error);
        res.status(500).json({ error: "Failed to get profile" });
    }
};

module.exports = { getProfile };
