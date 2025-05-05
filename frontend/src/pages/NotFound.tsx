import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music2 } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="rounded-full bg-green-500/10 p-6">
                    <Music2 className="h-12 w-12 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold">Page Not Found</h1>
                <p className="max-w-md text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-green-500 hover:bg-green-600"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
}
