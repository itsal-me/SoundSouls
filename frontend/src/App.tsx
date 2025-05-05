import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

import Layout from "@/components/Layout";
import HomePage from "@/pages/Home";
import ProfilePage from "@/pages/Profile";
import AnalysisPage from "@/pages/Analysis";
import PlaylistPage from "@/pages/Playlist";
import NotFoundPage from "@/pages/NotFound";

function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
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
