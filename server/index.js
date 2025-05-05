require("dotenv").config();
const express = require("express");
const listEndpoints = require("express-list-endpoints");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Pool } = require("pg");
const pgSession = require("connect-pg-simple")(session);

// Import routes
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const analysisRoute = require("./routes/analysis.routes");
const playlistRoutes = require("./routes/playlist.routes");

// Database configuration
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
});

// Initialize Express
const app = express();

// ======================
// Middleware Setup
// ======================
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.set("trust proxy", 1);

// CORS Configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

// Session Configuration
app.use(
    session({
        store: new pgSession({
            pool: pool,
            tableName: "user_sessions",
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
        name: "soundSouls.sid",
    })
);

// Logging
app.use(morgan("dev"));

// ======================
// Route Registration
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/analysis", analysisRoute);
app.use("/api/playlist", playlistRoutes);

// ======================
// Server Start
// ======================
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
