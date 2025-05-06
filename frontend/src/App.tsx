import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import axios from "axios";

import Layout from "@/components/Layout";
import HomePage from "@/pages/Home";
import ProfilePage from "@/pages/Profile";
import AnalysisPage from "@/pages/Analysis";
import PlaylistPage from "@/pages/Playlist";
import NotFoundPage from "@/pages/NotFound";
import AboutPage from "./pages/About";

// Add CSRF interceptor
axios.interceptors.request.use((config) => {
    // Safely check method (handles undefined/null)
    const method = config.method?.toLowerCase?.();

    if (method && ["post", "put", "patch", "delete"].includes(method)) {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
        }
    }
    return config;
});

// Example getCSRFToken() implementation:
function getCSRFToken() {
    // Option 1: From meta tag (if your backend injects it)
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute("content");

    // Option 2: From session/local storage (if you store it after login)
    return localStorage.getItem("csrfToken");

    // Option 3: From a cookie (if using httpOnly: false)
    // return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
}

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="analysis" element={<AnalysisPage />} />
                        <Route path="playlist" element={<PlaylistPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Router>
            <Toaster />
        </ThemeProvider>
    );
}

export default App;
