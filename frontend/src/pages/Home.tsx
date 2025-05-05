import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Music2,
    // Headphones,
    Share2,
    PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleConnectSpotify = () => {
        setIsLoading(true);
        window.location.href = `${process.env.VITE_APP_API_URL}/api/auth/login`;
    };

    return (
        <div className="container px-4 py-12 md:py-24">
            {/* Hero Section */}
            <section className="mx-auto max-w-5xl text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                        Discover Your{" "}
                        <span className="text-green-500">Music Soul</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                        Uncover your unique music personality with our
                        AI-powered analysis of your Spotify listening habits.
                    </p>
                    <div className="flex justify-center gap-4 pt-4">
                        <Button
                            onClick={handleConnectSpotify}
                            className="bg-green-500 hover:bg-green-600"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Connecting..."
                                : "Connect with Spotify"}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/about")}
                        >
                            Learn More
                        </Button>
                    </div>
                </div>

                <div className="mt-16 rounded-lg bg-muted p-8">
                    <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-lg bg-background/50">
                        <img
                            src="/placeholder.svg?height=720&width=1280"
                            alt="SoundSouls Demo"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="mx-auto mt-24 max-w-5xl">
                <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
                    Discover Your Music Personality
                </h2>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 p-6">
                            <div className="rounded-full bg-green-500/10 p-3">
                                <Music2 className="h-6 w-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">AI Analysis</h3>
                            <p className="text-center text-muted-foreground">
                                Get a personalized analysis of your music taste
                                and discover your unique music archetype.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 p-6">
                            <div className="rounded-full bg-green-500/10 p-3">
                                <Share2 className="h-6 w-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Shareable Profile
                            </h3>
                            <p className="text-center text-muted-foreground">
                                Generate a stylish, shareable card with your
                                music personality to share with friends.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 p-6">
                            <div className="rounded-full bg-green-500/10 p-3">
                                <PlayCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold">
                                Custom Playlists
                            </h3>
                            <p className="text-center text-muted-foreground">
                                Create AI-generated playlists based on your
                                music personality and preferences.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="mx-auto mt-24 max-w-5xl">
                <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
                    What Music Lovers Say
                </h2>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            quote: "SoundSouls nailed my music personality! The AI analysis was surprisingly accurate.",
                            name: "Alex Johnson",
                            title: "Music Enthusiast",
                        },
                        {
                            quote: "I love sharing my music profile with friends. It's a great conversation starter!",
                            name: "Sarah Williams",
                            title: "Playlist Creator",
                        },
                        {
                            quote: "The custom playlists are amazing. Found so many new artists I now love.",
                            name: "Michael Chen",
                            title: "Spotify Power User",
                        },
                    ].map((testimonial, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <p className="italic text-muted-foreground">
                                        "{testimonial.quote}"
                                    </p>
                                    <div>
                                        <p className="font-medium">
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {testimonial.title}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto mt-24 max-w-5xl rounded-lg bg-muted p-8 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Ready to Discover Your Music Soul?
                </h2>
                <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground">
                    Connect your Spotify account and get your personalized music
                    personality profile in minutes.
                </p>
                <Button
                    onClick={handleConnectSpotify}
                    className="mt-8 bg-green-500 hover:bg-green-600"
                    size="lg"
                    disabled={isLoading}
                >
                    {isLoading ? "Connecting..." : "Connect with Spotify"}
                </Button>
            </section>
        </div>
    );
}
