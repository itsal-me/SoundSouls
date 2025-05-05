import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const checkLoginStatus = async () => {
            try {
                const response = await fetch("/api/auth/status", {
                    credentials: "include",
                });
                const data = await response.json();
                setIsLoggedIn(data.isLoggedIn);
            } catch (error) {
                console.error("Error checking login status:", error);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    useEffect(() => {
        if (isDesktop) {
            setIsMenuOpen(false);
        }
    }, [isDesktop]);

    const handleLogin = () => {
        window.location.href = "/api/auth/login";
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setIsLoggedIn(false);
            window.location.href = "/";
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Profile", path: "/profile", requiresAuth: true },
        { name: "Analysis", path: "/analysis", requiresAuth: true },
        { name: "Playlist", path: "/playlist", requiresAuth: true },
    ];

    const filteredLinks = navLinks.filter(
        (link) => !link.requiresAuth || isLoggedIn
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <Music2 className="h-6 w-6 text-green-500" />
                    <span className="text-xl font-bold">SoundSouls</span>
                </Link>

                <nav className="hidden md:flex md:gap-6">
                    {filteredLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                location.pathname === link.path
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:block">
                    {isLoggedIn ? (
                        <Button variant="outline" onClick={handleLogout}>
                            Logout
                        </Button>
                    ) : (
                        <Button
                            onClick={handleLogin}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Connect Spotify
                        </Button>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </div>

            {isMenuOpen && (
                <div className="container pb-4 md:hidden">
                    <nav className="flex flex-col gap-4">
                        {filteredLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === link.path
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {isLoggedIn ? (
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        ) : (
                            <Button
                                onClick={handleLogin}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Connect Spotify
                            </Button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
