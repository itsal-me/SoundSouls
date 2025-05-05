require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const playlistRoutes = require("./routes/playlist.routes");

const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const helmet = require("helmet");

// Create PostgreSQL connection pool using Supabase credentials
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
});

const app = express();

// Middleware
app.use(
    cors({
        origin: [process.env.FRONTEND_URL], // Update with your frontend URL
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
// Security middleware
app.use(helmet());
app.set("trust proxy", 1); // For secure cookies in production

// Session configuration
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
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            domain: process.env.COOKIE_DOMAIN || undefined,
        },
        name: "soundSouls.sid",
        rolling: true, // Reset maxAge on every request
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
