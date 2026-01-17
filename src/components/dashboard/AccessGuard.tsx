"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Lock, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function AccessGuard({ children }: { children: React.ReactNode }) {
    const { user, signOut, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function checkAccess() {
            if (authLoading) return; // Wait for auth to initialize

            if (!user) {
                router.push('/login');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select(`
                        status, 
                        role,
                        restaurant:restaurants(is_active)
                    `)
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                // Admins are always approved
                if (data.role === 'admin' || user.email === 'admin@restauplus.com' || user.email === 'admin212123@restauplus.com') {
                    setStatus('approved');
                } else {
                    // Check logic:
                    // 1. Profile must be 'active'
                    // 2. Restaurant (if exists) must be 'is_active'
                    const profileStatus = data.status || 'pending';
                    const restaurant = Array.isArray(data.restaurant) ? data.restaurant[0] : data.restaurant;
                    const restaurantActive = restaurant ? restaurant.is_active : true; // Default to true if no restaurant yet (new signup)

                    if (profileStatus === 'active' && restaurantActive) {
                        setStatus('approved');
                    } else if (profileStatus === 'rejected' || !restaurantActive) {
                        setStatus('rejected');
                    } else {
                        setStatus('pending');
                    }
                }
            } catch (err) {
                console.error("Error checking access:", err);
                setStatus('pending');
            } finally {
                setLoading(false);
            }
        }

        checkAccess();
    }, [user, supabase, authLoading]);

    // Loading state - keep simple spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Verifying Access...</p>
                </div>
            </div>
        );
    }

    // Access Logic
    const isLocked = status !== 'approved';

    return (
        <div className="relative w-full h-full min-h-[80vh]">
            {/* 1. Dashboard Content (Blurred if locked) */}
            <div
                className={`transition-all duration-500 h-full ${isLocked ? 'blur-[4px] opacity-75 pointer-events-none select-none' : ''}`}
                aria-hidden={isLocked}
            >
                {children}
            </div>

            {/* 2. Premium/Activation Modal Overlay */}
            <AnimatePresence>
                {isLocked && (
                    <div className="absolute inset-0 z-[50] flex items-center justify-center p-4 overflow-hidden">
                        {/* Backdrop is handled by the visual blur of the content above, but we add a slight darkening */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-transparent/0 backdrop-blur-[2px]"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-6 text-center"
                        >
                            {/* Simple Professional Icon */}
                            <div className="mx-auto w-12 h-12 mb-4 bg-zinc-900 rounded-full flex items-center justify-center">
                                <Lock className="w-5 h-5 text-zinc-400" />
                            </div>

                            {/* Text Content */}
                            <div className="space-y-2 mb-6">
                                <h2 className="text-xl font-semibold text-white tracking-tight">
                                    {status === 'rejected' ? 'Access Suspended' : 'Activation Required'}
                                </h2>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {status === 'rejected'
                                        ? "This account has been temporarily suspended. Please contact your account manager."
                                        : "Your dashboard is currently in preview mode. Full access requires account activation."
                                    }
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-medium transition-colors h-10 rounded-md"
                                    onClick={() => window.location.href = 'mailto:support@restauplus.com?subject=Activation Request'}
                                >
                                    Contact Support
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-10 rounded-md"
                                    onClick={signOut}
                                >
                                    Switch Account
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
