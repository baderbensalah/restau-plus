"use client";
import React, { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat } from 'lucide-react';

export const Navbar = () => {
    const { scrollYProgress } = useScroll();
    const [visible, setVisible] = useState(true);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            const direction = current! - scrollYProgress.getPrevious()!;

            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed top-4 md:top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-4 md:pl-8 py-2 items-center justify-center space-x-2 md:space-x-4",
                    "border-white/10 bg-black/50 backdrop-blur-md supports-[backdrop-filter]:bg-black/20"
                )}
            >
                <Link href="/" className="flex items-center gap-2 mr-2 md:mr-4">
                    <span className="font-extrabold text-xl md:text-2xl tracking-tighter text-white">
                        RESTAU<span className="text-teal-500">PLUS</span>
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#demo" className="hover:text-white transition-colors">Demo</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-white/10">
                    <Link href="/dashboard/owner">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-neutral-300 hover:text-white hover:bg-white/10 rounded-full">
                            Login
                        </Button>
                    </Link>
                    <Link href="/menu/burger-co">
                        <Button size="sm" className="rounded-full bg-white text-black hover:bg-gray-200 h-8 px-4 text-xs md:text-sm">
                            Scan Demo
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
