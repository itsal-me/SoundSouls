const supabase = require("../config/supabase.config");

class User {
    static async findBySpotifyId(spotifyId) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("spotify_id", spotifyId)
            .single();

        if (error) throw error;
        return data;
    }

    static async upsert(userData) {
        const { data, error } = await supabase
            .from("users")
            .upsert(userData, { onConflict: "spotify_id" })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateTokens(
        spotifyId,
        { access_token, refresh_token, expires_in }
    ) {
        const { data, error } = await supabase
            .from("users")
            .update({
                access_token,
                refresh_token,
                token_expires_at: new Date(
                    Date.now() + expires_in * 1000
                ).toISOString(),
            })
            .eq("spotify_id", spotifyId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = User;
