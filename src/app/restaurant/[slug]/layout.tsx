import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: restaurant } = await supabase.from('restaurants').select('name').eq('slug', slug).single();

    return {
        title: restaurant?.name || "Restaurant Not Found",
    };
}

// Helper to convert Hex to HSL for Tailwind (e.g. "255 10% 20%")
function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 0%"; // default black if invalid

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Return space separated values for Tailwind
    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export default async function RestaurantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: restaurant } = await supabase.from('restaurants').select('*').eq('slug', slug).single();

    if (!restaurant) return notFound();

    const primaryColor = restaurant.primary_color || '#000000';
    const secondaryColor = restaurant.secondary_color || '#ffffff';

    const primaryHsl = hexToHsl(primaryColor);
    const secondaryHsl = hexToHsl(secondaryColor);

    return (
        <div className="min-h-screen bg-[#050505] text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --primary: ${primaryHsl};
                    --secondary: ${secondaryHsl};
                    --ring: ${primaryHsl};
                    --background: 0 0% 2.5%;
                    --card: 0 0% 5%;
                    --border: 0 0% 12%;
                }
            `}} />
            {children}
        </div>
    );
}
