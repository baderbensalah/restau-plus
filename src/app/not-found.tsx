
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white space-y-6 text-center px-4">
            <div className="space-y-2">
                <h1 className="text-7xl font-black text-primary tracking-tighter">404</h1>
                <h2 className="text-2xl font-bold text-gray-400">Page Not Found</h2>
            </div>
            <p className="max-w-[500px] text-gray-500">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline" className="border-gray-700 hover:bg-white/10 text-white">
                    <Link href="/">Back Home</Link>
                </Button>
            </div>
        </div>
    )
}
