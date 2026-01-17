
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white space-y-6 text-center px-4">
            <div className="p-4 rounded-full bg-red-500/10 mb-4">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="max-w-[500px] text-zinc-400">
                    We encountered an unexpected error. Our team has been notified.
                </p>
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-white text-black hover:bg-gray-200 font-bold"
                >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                >
                    Go Home
                </Button>
            </div>

            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 p-4 bg-red-950/30 border border-red-900/50 rounded-lg max-w-2xl overflow-auto text-left">
                    <p className="font-mono text-xs text-red-200">{error.message}</p>
                </div>
            )}
        </div>
    );
}
