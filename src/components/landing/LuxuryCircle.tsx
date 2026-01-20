"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const brands = [
    { name: "Kempinski", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Kempinski_Logo.svg/2560px-Kempinski_Logo.svg.png" },
    { name: "Four Seasons", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Four_Seasons_Hotels_and_Resorts_Logo.svg/1200px-Four_Seasons_Hotels_and_Resorts_Logo.svg.png" },
    { name: "Ritz Carlton", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Ritz-Carlton_logo.svg/2560px-The_Ritz-Carlton_logo.svg.png" },
    { name: "Nobu", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Nobu_logo.svg" },
];

export function LuxuryCircle() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black opacity-40" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-xs font-semibold tracking-widest text-primary uppercase">Trusted by the Best</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">The Luxury Circle</h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Join an exclusive network of world-renowned establishments defining the future of hospitality.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {brands.map((brand, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative h-40 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden flex items-center justify-center p-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Logo Placeholder (using text if image fails or for simplicity in this mock) */}
                            <div className="relative z-10 text-white opacity-60 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 grayscale group-hover:grayscale-0">
                                {/* Use text for consistency if external images are blocked or shaky, but trying generic luxury font */}
                                <span className="font-serif text-2xl tracking-widest">{brand.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Golden Line */}
                <div className="mt-24 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
        </section>
    );
}
