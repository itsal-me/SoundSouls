import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Music,
    PlayCircle,
    Plus,
    Loader2,
    // Check,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Track {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        name: string;
        images: { url: string }[];
    };
    uri: string;
}

interface Playlist {
    id: string;
    name: string;
    description: string;
    tracks: Track[];
    externalUrl?: string;
}

export default function PlaylistPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistDescription, setPlaylistDescription] = useState("");
    const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(
        null
    );
    const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        const fetchSavedPlaylists = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(
                    `${process.env.VITE_APP_API_URL}/api/playlists`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        toast(
                            "Please connect your Spotify account to view your playlists."
                        );
                        navigate("/");
                        return;
                    }

                    throw new Error("Failed to fetch playlists");
                }

                const data = await response.json();
                setSavedPlaylists(data);
            } catch (error) {
                console.error("Error fetching playlists:", error);
                toast("Failed to load your playlists. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedPlaylists();
    }, [navigate, toast]);

    const generatePlaylist = async () => {
        if (!playlistName.trim()) {
            toast("Please enter a playlist name.");
            return;
        }

        try {
            setIsGenerating(true);

            const response = await fetch(
                `${process.env.VITE_APP_API_URL}/api/playlists/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: playlistName,
                        description: playlistDescription,
                    }),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate playlist");
            }

            const data = await response.json();
            setGeneratedPlaylist(data);

            toast("Your custom playlist is ready to save!");
        } catch (error) {
            console.error("Error generating playlist:", error);
            toast("Failed to generate your playlist. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const savePlaylist = async () => {
        if (!generatedPlaylist) return;

        try {
            setIsSaving(true);

            const response = await fetch(
                `${process.env.VITE_APP_API_URL}/api/playlists/save`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: generatedPlaylist.name,
                        description: generatedPlaylist.description,
                        tracks: generatedPlaylist.tracks.map(
                            (track) => track.uri
                        ),
                    }),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to save playlist");
            }

            const data = await response.json();

            // Add the saved playlist to the list
            setSavedPlaylists((prev) => [data, ...prev]);

            // Update the generated playlist with the external URL
            setGeneratedPlaylist({
                ...generatedPlaylist,
                id: data.id,
                externalUrl: data.externalUrl,
            });

            toast("Your playlist has been saved to your Spotify account!");
        } catch (error) {
            console.error("Error saving playlist:", error);
            toast("Failed to save your playlist. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                    <p className="text-lg font-medium">
                        Loading your playlists...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Custom <span className="text-green-500">Playlists</span>
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Create AI-generated playlists based on your music taste
                </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
                {/* Playlist Generator */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Playlist</CardTitle>
                            <CardDescription>
                                Our AI will generate a custom playlist based on
                                your music taste and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="playlist-name">
                                    Playlist Name
                                </Label>
                                <Input
                                    id="playlist-name"
                                    placeholder="e.g., Chill Summer Vibes"
                                    value={playlistName}
                                    onChange={(e) =>
                                        setPlaylistName(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="playlist-description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="playlist-description"
                                    placeholder="e.g., Perfect for relaxing on a summer evening"
                                    value={playlistDescription}
                                    onChange={(e) =>
                                        setPlaylistDescription(e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={generatePlaylist}
                                className="w-full bg-green-500 hover:bg-green-600"
                                disabled={isGenerating || !playlistName.trim()}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Music className="mr-2 h-4 w-4" />
                                        Generate Playlist
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Generated Playlist */}
                    {generatedPlaylist && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>{generatedPlaylist.name}</CardTitle>
                                <CardDescription>
                                    {generatedPlaylist.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {generatedPlaylist.tracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md">
                                                {track.album.images &&
                                                track.album.images[0] ? (
                                                    <img
                                                        src={
                                                            track.album
                                                                .images[0]
                                                                .url ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={track.album.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <Music className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {track.name}
                                                </p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {track.artists
                                                        .map(
                                                            (artist) =>
                                                                artist.name
                                                        )
                                                        .join(", ")}
                                                </p>
                                            </div>
                                            <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                {generatedPlaylist.externalUrl ? (
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() =>
                                            window.open(
                                                generatedPlaylist.externalUrl,
                                                "_blank"
                                            )
                                        }
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open in Spotify
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={savePlaylist}
                                        className="flex-1 bg-green-500 hover:bg-green-600"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Save to Spotify
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Saved Playlists */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">
                        Your Saved Playlists
                    </h2>

                    {savedPlaylists.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Music className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-center text-muted-foreground">
                                    You haven't saved any playlists yet.
                                    Generate and save a playlist to see it here.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {savedPlaylists.map((playlist) => (
                                <Card key={playlist.id}>
                                    <CardHeader>
                                        <CardTitle>{playlist.name}</CardTitle>
                                        <CardDescription>
                                            {playlist.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {playlist.tracks.length} tracks
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() =>
                                                window.open(
                                                    playlist.externalUrl,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open in Spotify
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
