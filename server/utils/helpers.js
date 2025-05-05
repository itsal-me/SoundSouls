const generateRandomString = (length) => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const formatMusicData = (data) => {
    // Format data for AI analysis
    return {
        tracks: data.topTracks.map((track) => ({
            name: track.name,
            artists: track.artists.map((artist) => artist.name),
            album: track.album.name,
            duration: track.duration_ms,
            popularity: track.popularity,
        })),
        artists: data.topArtists.map((artist) => ({
            name: artist.name,
            genres: artist.genres,
            popularity: artist.popularity,
        })),
        genres: data.topGenres,
    };
};

module.exports = {
    generateRandomString,
    formatMusicData,
};
