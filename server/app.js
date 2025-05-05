require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const playlistRoutes = require("./routes/playlist.routes");

const app = express();

// Middleware
app.use(
    cors({
        origin: ["http://localhost:5173"], // Update with your frontend URL
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
    })
);

// Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/playlist", playlistRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
