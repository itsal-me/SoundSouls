module.exports = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    scopes: [
        "user-read-private",
        "user-read-email",
        "user-top-read",
        "playlist-modify-public",
        "playlist-modify-private",
    ],
    authUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    apiBaseUrl: "https://api.spotify.com/v1",
};
