import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
    Music2,
    Headphones,
    Sparkles,
    Share2,
    PlayCircle,
    Brain,
    // ChevronDown,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function AboutPage() {
    // const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleConnectSpotify = () => {
        setIsLoading(true);
        window.location.href = "/api/auth/login";
    };

    return (
        <div className="container px-4 py-12 md:py-24">
            {/* Hero Section */}
            <section className="mx-auto max-w-5xl text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                        About <span className="text-green-500">SoundSouls</span>
                    </h1>
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                        Discover the story behind the AI-powered music
                        personality profiler that's changing how we understand
                        our musical tastes.
                    </p>
                </div>
            </section>

            {/* What is SoundSouls Section */}
            <section className="mx-auto mt-16 max-w-5xl">
                <div className="grid gap-12 md:grid-cols-2 md:items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="mb-6 text-3xl font-bold tracking-tighter">
                            What is SoundSouls?
                        </h2>
                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                SoundSouls is an innovative web application that
                                analyzes your Spotify listening habits to create
                                a personalized music personality profile.
                            </p>
                            <p>
                                Using advanced AI technology, we go beyond
                                simple statistics to uncover the emotional and
                                psychological connections between your music
                                preferences and your personality.
                            </p>
                            <p>
                                Whether you're a dedicated audiophile or a
                                casual listener, SoundSouls provides fascinating
                                insights into how your musical choices reflect
                                who you are.
                            </p>
                        </div>
                        <Button
                            onClick={handleConnectSpotify}
                            className="mt-8 bg-green-500 hover:bg-green-600"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Connecting..."
                                : "Connect with Spotify"}
                        </Button>
                    </div>
                    <div className="order-1 md:order-2">
                        <div className="overflow-hidden rounded-lg bg-muted/50">
                            <div className="aspect-square bg-gradient-to-br from-green-500/20 to-green-500/5 p-8">
                                <div className="flex h-full items-center justify-center rounded-full bg-green-500/10">
                                    <Music2 className="h-24 w-24 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="mx-auto mt-24 max-w-5xl">
                <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter">
                    How SoundSouls Works
                </h2>

                <div className="grid gap-8 md:grid-cols-3">
                    {[
                        {
                            icon: (
                                <Headphones className="h-10 w-10 text-green-500" />
                            ),
                            title: "Connect Spotify",
                            description:
                                "Link your Spotify account to grant SoundSouls access to analyze your listening history, top tracks, artists, and genres.",
                        },
                        {
                            icon: (
                                <Brain className="h-10 w-10 text-green-500" />
                            ),
                            title: "AI Analysis",
                            description:
                                "Our advanced AI processes your music data to identify patterns, preferences, and emotional connections in your listening habits.",
                        },
                        {
                            icon: (
                                <Sparkles className="h-10 w-10 text-green-500" />
                            ),
                            title: "Discover Yourself",
                            description:
                                "Receive a personalized music personality profile, complete with your archetype, music horoscope, and shareable visual card.",
                        },
                    ].map((step, index) => (
                        <Card
                            key={index}
                            className="overflow-hidden border-none bg-muted/50"
                        >
                            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                                <div className="rounded-full bg-green-500/10 p-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {step.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="mx-auto mt-24 max-w-5xl">
                <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter">
                    Key Features
                </h2>

                <div className="grid gap-8 md:grid-cols-2">
                    {[
                        {
                            icon: <Music2 className="h-8 w-8 text-green-500" />,
                            title: "Music Personality Analysis",
                            description:
                                "Discover your unique music archetype and what your listening habits reveal about your personality.",
                        },
                        {
                            icon: <Share2 className="h-8 w-8 text-green-500" />,
                            title: "Shareable Visual Cards",
                            description:
                                "Generate stylish, personalized cards showcasing your music personality to share on social media.",
                        },
                        {
                            icon: (
                                <PlayCircle className="h-8 w-8 text-green-500" />
                            ),
                            title: "Custom Playlists",
                            description:
                                "Create AI-generated playlists tailored to your music personality and preferences.",
                        },
                        {
                            icon: (
                                <Sparkles className="h-8 w-8 text-green-500" />
                            ),
                            title: "Music Horoscope",
                            description:
                                "Receive personalized insights and predictions based on your musical taste and listening patterns.",
                        },
                    ].map((feature, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="rounded-full bg-green-500/10 p-3 h-14 w-14 flex items-center justify-center shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technology Section */}
            <section className="mx-auto mt-24 max-w-5xl">
                <div className="rounded-lg bg-muted/50 p-8">
                    <h2 className="mb-8 text-center text-3xl font-bold tracking-tighter">
                        Powered By
                    </h2>

                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                name: "Spotify API",
                                description:
                                    "Access to your listening history and music preferences",
                                logo: "/placeholder.svg?height=80&width=80",
                            },
                            {
                                name: "Deepseek v3",
                                description:
                                    "Advanced AI for personality analysis and insights",
                                logo: "/placeholder.svg?height=80&width=80",
                            },
                            {
                                name: "React & Node.js",
                                description:
                                    "Modern web technologies for a seamless experience",
                                logo: "/placeholder.svg?height=80&width=80",
                            },
                        ].map((tech, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-background p-4">
                                    <img
                                        src={tech.logo || "/placeholder.svg"}
                                        alt={tech.name}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <h3 className="text-lg font-bold">
                                    {tech.name}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {tech.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="mx-auto mt-24 max-w-3xl">
                <h2 className="mb-8 text-center text-3xl font-bold tracking-tighter">
                    Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="w-full">
                    {[
                        {
                            question: "Is SoundSouls free to use?",
                            answer: "Yes, SoundSouls is completely free to use. All you need is a Spotify account to connect and start discovering your music personality.",
                        },
                        {
                            question:
                                "How does SoundSouls access my Spotify data?",
                            answer: "SoundSouls uses Spotify's official API with your permission. We only access your listening history, top tracks, artists, and genres. We never see your password or personal account details.",
                        },
                        {
                            question:
                                "Can I revoke access to my Spotify account?",
                            answer: "Absolutely. You can revoke SoundSouls' access to your Spotify account at any time through your Spotify account settings.",
                        },
                        {
                            question: "How accurate is the AI analysis?",
                            answer: "Our AI analysis is based on established psychological research connecting music preferences to personality traits. While no analysis is perfect, most users find our insights surprisingly accurate and thought-provoking.",
                        },
                        {
                            question:
                                "Can I share my music personality with friends?",
                            answer: "Yes! SoundSouls generates shareable visual cards that you can download and share on social media or with friends directly.",
                        },
                    ].map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-medium">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* Contact Section */}
            <section className="mx-auto mt-24 max-w-3xl text-center">
                <div className="rounded-lg bg-muted/50 p-8">
                    <h2 className="mb-4 text-2xl font-bold tracking-tighter">
                        Get In Touch
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                        Have questions, feedback, or just want to say hello?
                        We'd love to hear from you!
                    </p>
                    <div className="flex justify-center">
                        <Button className="bg-green-500 hover:bg-green-600">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto mt-24 max-w-5xl rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 p-12 text-center">
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
