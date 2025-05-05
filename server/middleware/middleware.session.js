const rateLimit = require("express-rate-limit");

// Session validation middleware
exports.verifySession = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized - Please log in" });
    }

    try {
        // Verify session exists in database
        const { data: session } = await supabase
            .from("user_sessions")
            .select("sess")
            .eq("sid", req.sessionID)
            .gt("expire", new Date().toISOString())
            .single();

        if (!session) {
            req.session.destroy();
            return res.status(401).json({ error: "Session expired" });
        }

        // Verify CSRF token for state-changing requests
        if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            const clientToken = req.headers["x-csrf-token"] || req.body._csrf;
            if (clientToken !== req.session.csrfToken) {
                return res.status(403).json({ error: "Invalid CSRF token" });
            }
        }

        // Rotate CSRF token periodically
        if (
            !req.session.csrfRotatedAt ||
            new Date(req.session.csrfRotatedAt) <
                new Date(Date.now() - 15 * 60 * 1000)
        ) {
            req.session.csrfToken = generateRandomString(32);
            req.session.csrfRotatedAt = new Date().toISOString();
        }

        next();
    } catch (error) {
        console.error("Session verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Rate limiting for auth endpoints
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    handler: (req, res) => {
        res.status(429).json({
            error: "Too many requests, please try again later",
        });
    },
    skip: (req) => {
        // Skip rate limiting for successful authenticated requests
        return !!req.session.userId;
    },
});

// Concurrent session limiter
exports.sessionLimiter = async (req, res, next) => {
    if (!req.session.userId) return next();

    try {
        const { count } = await supabase
            .from("session_audit")
            .select("*", { count: "exact" })
            .eq("user_id", req.session.userId)
            .is("logout_at", null);

        if (count >= 3) {
            // Max 3 concurrent sessions
            return res.status(403).json({
                error: "Maximum concurrent sessions reached",
            });
        }
        next();
    } catch (error) {
        console.error("Session limit check error:", error);
        next();
    }
};
