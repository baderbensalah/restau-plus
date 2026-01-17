
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-zinc-500 font-medium text-sm animate-pulse">Loading experience...</p>
            </div>
        </div>
    );
}
