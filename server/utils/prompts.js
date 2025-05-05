// Profile analysis prompt
const profilePrompt = (musicData) => `
Analyze the following music taste data and generate a detailed personality summary. 
Focus on the emotional, psychological, and behavioral traits that this music preference might suggest.
Be creative but grounded in the data. Write in second person ("You are...").

Music Data:
- Top Tracks: ${musicData.topTracks
    .slice(0, 5)
    .map((t) => t.name)
    .join(", ")}...
- Top Artists: ${musicData.topArtists
    .slice(0, 5)
    .map((a) => a.name)
    .join(", ")}...
- Top Genres: ${musicData.topGenres.join(", ")}

Consider:
1. Energy level and tempo preferences
2. Emotional tone (nostalgic, melancholic, joyful, etc.)
3. Diversity/variety in taste
4. Popularity/mainstream vs niche preferences
5. Any interesting patterns or contrasts

Write a 150-200 word analysis in a friendly, engaging tone. Avoid generic statements.
`;

// Archetype prompt
const archetypePrompt = (musicData) => `
Based on this music taste data, assign one of the following archetypes (or create a new fitting one):

1. The Nostalgic Dreamer
2. The Eclectic Explorer
3. The Mainstream Maverick
4. The Moody Poet
5. The Energy Seeker
6. The Chill Vibes Connoisseur
7. The Underground Devotee
8. The Genre Purist
9. The Emotional Wanderer
10. The Party Starter

Music Data:
- Top Genres: ${musicData.topGenres.join(", ")}
- Top Artists: ${musicData.topArtists
    .slice(0, 5)
    .map((a) => `${a.name} (${a.genres.slice(0, 2).join(", ")})`)
    .join(", ")}
- Top Tracks: ${musicData.topTracks
    .slice(0, 5)
    .map((t) => t.name)
    .join(", ")}

Respond ONLY with the archetype name and a very brief (10-15 word) description.
Example: "The Eclectic Explorer - You love discovering diverse sounds across genres."
`;

// Emoji prompt
const emojiPrompt = (musicData) => `
Summarize this music taste in exactly 3 emojis. Choose emojis that represent:
1. The dominant mood/emotion
2. The energy level
3. The overall vibe

Music Data:
- Top Genres: ${musicData.topGenres.join(", ")}
- Top Artists: ${musicData.topArtists
    .slice(0, 3)
    .map((a) => a.name)
    .join(", ")}
- Top Tracks: ${musicData.topTracks
    .slice(0, 3)
    .map((t) => t.name)
    .join(", ")}

Respond ONLY with the 3 emojis, no other text or explanation.
`;

// Playlist prompt
const playlistPrompt = (tracks, theme) => `
Create a themed playlist concept based on the user's music taste and the requested theme.
Select 15-20 tracks from their top tracks that fit the theme, and suggest some additional tracks if needed.

User's Top Tracks:
${tracks
    .slice(0, 10)
    .map((t) => `- ${t.name} by ${t.artists.map((a) => a.name).join(", ")}`)
    .join("\n")}

Requested Theme: ${theme}

Respond with:
1. A creative playlist name
2. A 1-2 sentence description
3. A list of 15-20 track URIs (spotify:track:...) that fit the theme, prioritizing the user's top tracks
4. A brief explanation of how these tracks fit the theme

Format your response clearly with these sections.
`;

module.exports = {
    profilePrompt,
    archetypePrompt,
    emojiPrompt,
    playlistPrompt,
};
