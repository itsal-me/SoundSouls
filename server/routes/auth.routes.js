const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");
const { User } = require("../models/user.model.js");

router.get("/login", authController.login);

router.get("/callback", authController.callback);

router.post("/refresh", authController.refreshToken);

router.post("/logout", authController.logout);

router.get("/me", async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const user = await User.findBySpotifyId(req.session.spotifyId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user.spotify_id,
            display_name: user.display_name,
            email: user.email,
            profile_image: user.profile_image,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

router.get("/status", authController.status);

module.exports = router;
