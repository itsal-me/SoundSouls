import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Clock, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    // CardDescription,
    // CardHeader,
    // CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    //  TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

interface Artist {
    id: string;
    name: string;
    genres: string[];
    images: { url: string }[];
}

interface Track {
    id: string;
    name: string;
    album: {
        name: string;
        images: { url: string }[];
    };
    artists: { name: string }[];
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("medium_term");
    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topTracks, setTopTracks] = useState<Track[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);

                // Fetch user profile
                const profileResponse = await fetch(
                    `${import.meta.env.VITE_APP_API_URL}/api/profile`,
                    {
                        credentials: "include",
                    }
                );

                if (!profileResponse.ok) {
                    if (profileResponse.status === 401) {
                        toast(
                            "Please connect your Spotify account to view your profile."
                        );
                        navigate("/");
                        return;
                    }
                    throw new Error("Failed to fetch profile");
                }

                const profileData = await profileResponse.json();
                setUserProfile(profileData);

                // Fetch top artists
                const artistsResponse = await fetch(
                    `/api/profile/top-artists?time_range=${timeRange}`,
                    {
                        credentials: "include",
                    }
                );

                if (!artistsResponse.ok) {
                    throw new Error("Failed to fetch top artists");
                }

                const artistsData = await artistsResponse.json();
                setTopArtists(artistsData.items);

                // Fetch top tracks
                const tracksResponse = await fetch(
                    `/api/profile/top-tracks?time_range=${timeRange}`,
                    {
                        credentials: "include",
                    }
                );

                if (!tracksResponse.ok) {
                    throw new Error("Failed to fetch top tracks");
                }

                const tracksData = await tracksResponse.json();
                setTopTracks(tracksData.items);
            } catch (error) {
                console.error("Error fetching user data:", error);
                toast("Failed to load your profile data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [timeRange, navigate, toast]);

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
    };

    const handleAnalyze = () => {
        navigate("/analysis");
    };

    if (isLoading) {
        return (
            <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                    <p className="text-lg font-medium">
                        Loading your Spotify data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12">
            {/* User Profile Header */}
            {userProfile && (
                <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                    {userProfile.images && userProfile.images[0] ? (
                        <img
                            src={
                                userProfile.images[0].url || "/placeholder.svg"
                            }
                            alt={userProfile.display_name}
                            className="h-32 w-32 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                            <Music className="h-12 w-12 text-muted-foreground" />
                        </div>
                    )}

                    <div>
                        <h1 className="text-3xl font-bold">
                            {userProfile.display_name}
                        </h1>
                        <p className="text-muted-foreground">
                            {userProfile.followers?.total} followers •{" "}
                            {userProfile.country}
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                            <Button
                                onClick={handleAnalyze}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Analyze My Music Personality
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Range Selector */}
            <Tabs
                defaultValue={timeRange}
                onValueChange={handleTimeRangeChange}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Top Music</h2>
                    <TabsList>
                        <TabsTrigger value="short_term" className="text-sm">
                            <Clock className="mr-2 h-4 w-4" />
                            Last 4 Weeks
                        </TabsTrigger>
                        <TabsTrigger value="medium_term" className="text-sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Last 6 Months
                        </TabsTrigger>
                        <TabsTrigger value="long_term" className="text-sm">
                            <Music className="mr-2 h-4 w-4" />
                            All Time
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {/* Top Artists */}
            <div className="mb-12">
                <h3 className="mb-6 text-xl font-semibold">Top Artists</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {topArtists.slice(0, 10).map((artist) => (
                        <Card key={artist.id} className="overflow-hidden">
                            <div className="aspect-square overflow-hidden">
                                {artist.images && artist.images[0] ? (
                                    <img
                                        src={
                                            artist.images[0].url ||
                                            "/placeholder.svg"
                                        }
                                        alt={artist.name}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <Music className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <p className="truncate font-medium">
                                    {artist.name}
                                </p>
                                {artist.genres && artist.genres.length > 0 && (
                                    <p className="truncate text-sm text-muted-foreground">
                                        {artist.genres[0]}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Top Tracks */}
            <div>
                <h3 className="mb-6 text-xl font-semibold">Top Tracks</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {topTracks.slice(0, 10).map((track, index) => (
                        <Card key={track.id} className="overflow-hidden">
                            <div className="flex items-center gap-4 p-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                    {track.album.images &&
                                    track.album.images[0] ? (
                                        <img
                                            src={
                                                track.album.images[0].url ||
                                                "/placeholder.svg"
                                            }
                                            alt={track.album.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Music className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                        {track.name}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {track.artists
                                            .map((artist) => artist.name)
                                            .join(", ")}
                                    </p>
                                </div>
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                    <span className="text-sm font-medium">
                                        {index + 1}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
