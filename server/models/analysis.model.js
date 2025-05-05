const supabase = require("../config/supabase.config");

class Analysis {
    static async findByUserId(userId, timeRange = "medium_term") {
        const { data, error } = await supabase
            .from("analyses")
            .select("*")
            .eq("user_id", userId)
            .eq("time_range", timeRange)
            .single();

        if (error) throw error;
        return data;
    }

    static async upsert(analysisData) {
        const { data, error } = await supabase
            .from("analyses")
            .upsert(analysisData, {
                onConflict: "user_id,time_range",
                ignoreDuplicates: false,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getRecentAnalyses(userId, limit = 3) {
        const { data, error } = await supabase
            .from("analyses")
            .select("*")
            .eq("user_id", userId)
            .order("last_updated", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
}

module.exports = Analysis;
