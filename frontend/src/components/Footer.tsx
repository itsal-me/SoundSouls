import { Link } from "react-router-dom";
import { Music2, Github, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container py-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <Music2 className="h-5 w-5 text-green-500" />
                            <span className="text-lg font-bold">
                                SoundSouls
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Discover your music personality with AI-powered
                            analysis of your Spotify listening habits.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Links</h3>
                        <Link
                            to="/"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Home
                        </Link>
                        <Link
                            to="/profile"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Profile
                        </Link>
                        <Link
                            to="/analysis"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Analysis
                        </Link>
                        <Link
                            to="/playlist"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Playlist
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium">Connect</h3>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} SoundSouls. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
