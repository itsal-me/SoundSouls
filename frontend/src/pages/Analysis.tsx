import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Download, Share2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AnalysisResult {
    personality: string;
    archetype: string;
    description: string;
    emojis: string[];
    horoscope: string;
    genres: string[];
    imageUrl?: string;
}

export default function AnalysisPage() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
        null
    );
    const [activeTab, setActiveTab] = useState("personality");

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(
                    `${process.env.VITE_APP_API_URL}/api/analysis`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        toast(
                            "Please connect your Spotify account to view your analysis."
                        );
                        navigate("/");
                        return;
                    }

                    if (response.status === 404) {
                        // No analysis yet, that's okay
                        setAnalysisResult(null);
                        return;
                    }

                    throw new Error("Failed to fetch analysis");
                }

                const data = await response.json();
                setAnalysisResult(data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
                toast("Failed to load your analysis. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [navigate, toast]);

    const generateAnalysis = async () => {
        try {
            setIsGenerating(true);

            const response = await fetch(
                `${process.env.VITE_APP_API_URL}/api/analysis/generate`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate analysis");
            }

            const data = await response.json();
            setAnalysisResult(data);

            toast("Your music personality analysis is ready!");
        } catch (error) {
            console.error("Error generating analysis:", error);
            toast("Failed to generate your analysis. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateShareableImage = async () => {
        try {
            setIsGenerating(true);

            const response = await fetch(
                `${process.env.VITE_APP_API_URL}/api/analysis/image`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate shareable image");
            }

            const data = await response.json();

            // Update the analysis result with the image URL
            setAnalysisResult((prev) =>
                prev ? { ...prev, imageUrl: data.imageUrl } : null
            );

            toast("Your shareable image is ready!");
        } catch (error) {
            console.error("Error generating image:", error);
            toast("Failed to generate your shareable image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = () => {
        if (!analysisResult?.imageUrl) return;

        const link = document.createElement("a");
        link.href = analysisResult.imageUrl;
        link.download = "soundsouls-profile.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareAnalysis = () => {
        if (!analysisResult) return;

        if (navigator.share) {
            navigator.share({
                title: "My SoundSouls Music Personality",
                text: `I'm a ${analysisResult.archetype}! Check out my music personality on SoundSouls.`,
                url: window.location.href,
            });
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast("Share link copied to clipboard!");
        }
    };

    if (isLoading) {
        return (
            <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-green-500" />
                    <p className="text-lg font-medium">
                        Loading your analysis...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Your Music{" "}
                    <span className="text-green-500">Personality</span>
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Discover what your music taste says about you
                </p>
            </div>

            {!analysisResult ? (
                <div className="mx-auto max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generate Your Analysis</CardTitle>
                            <CardDescription>
                                We'll analyze your Spotify listening habits to
                                create a personalized music personality profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4 text-sm text-muted-foreground">
                                This will use AI to analyze your top tracks,
                                artists, and genres to generate insights about
                                your music personality.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={generateAnalysis}
                                className="w-full bg-green-500 hover:bg-green-600"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Music className="mr-2 h-4 w-4" />
                                        Analyze My Music
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <div className="mx-auto max-w-4xl">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="mb-8"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personality">
                                Personality
                            </TabsTrigger>
                            <TabsTrigger value="horoscope">
                                Music Horoscope
                            </TabsTrigger>
                            <TabsTrigger value="share">Share</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personality" className="mt-6">
                            <Card>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">
                                        You are a{" "}
                                        <span className="text-green-500">
                                            {analysisResult.archetype}
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-lg">
                                        {analysisResult.emojis.join(" ")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="mb-2 font-semibold">
                                                Your Music Personality
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {analysisResult.personality}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">
                                                What This Means
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {analysisResult.description}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 font-semibold">
                                                Your Top Genres
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.genres.map(
                                                    (genre, index) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500"
                                                        >
                                                            {genre}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setActiveTab("horoscope")
                                        }
                                    >
                                        View Horoscope
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("share")}
                                    >
                                        Share Results
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="horoscope" className="mt-6">
                            <Card>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">
                                        Your Music Horoscope
                                    </CardTitle>
                                    <CardDescription className="text-lg">
                                        What the stars say about your musical
                                        journey
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        {analysisResult.horoscope}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setActiveTab("personality")
                                        }
                                    >
                                        Back to Personality
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab("share")}
                                    >
                                        Share Results
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="share" className="mt-6">
                            <Card>
                                <CardHeader className="text-center">
                                    <CardTitle className="text-2xl">
                                        Share Your Music Soul
                                    </CardTitle>
                                    <CardDescription className="text-lg">
                                        Let the world know about your unique
                                        music personality
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    {analysisResult.imageUrl ? (
                                        <div className="mb-6 overflow-hidden rounded-lg">
                                            <img
                                                src={
                                                    analysisResult.imageUrl ||
                                                    "/placeholder.svg"
                                                }
                                                alt="Your Music Personality"
                                                className="max-h-[500px] w-auto"
                                            />
                                        </div>
                                    ) : (
                                        <div className="mb-6 flex aspect-[4/3] w-full max-w-md items-center justify-center rounded-lg bg-muted">
                                            <Button
                                                onClick={generateShareableImage}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Generating Image...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Generate Shareable Image
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    <div className="flex w-full gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={downloadImage}
                                            disabled={!analysisResult.imageUrl}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                            onClick={shareAnalysis}
                                        >
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-8 text-center">
                        <Button
                            variant="outline"
                            onClick={generateAnalysis}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerate Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
