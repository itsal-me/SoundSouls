const axios = require("axios");

const analyzeMusicTaste = async (prompt) => {
    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: process.env.OPENROUTER_DEEPSEEK_MODEL,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 1000,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": `${process.env.FRONTEND_URL}`, // Update with your URL
                    "X-Title": "SoundSouls",
                },
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error in AI analysis:", error);
        throw new Error("AI analysis failed");
    }
};

module.exports = { analyzeMusicTaste };
