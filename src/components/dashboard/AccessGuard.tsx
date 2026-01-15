"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Lock, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export function AccessGuard({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function checkAccess() {
            if (!user) {
                router.push('/login');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("status, role")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;

                // Admins are always approved
                if (data.role === 'admin' || user.email === 'admin@restauplus.com') {
                    setStatus('approved');
                } else {
                    setStatus(data.status || 'pending');
                }
            } catch (err) {
                console.error("Error checking access:", err);
                setStatus('pending');
            } finally {
                setLoading(false);
            }
        }

        checkAccess();
    }, [user, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Checking access permissions...</p>
                </div>
            </div>
        );
    }

    if (status === 'pending' || status === 'rejected') {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-card border border-white/10 rounded-2xl p-8 text-center space-y-8 shadow-2xl shadow-primary/10"
                >
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight text-white">
                            Account <span className="text-primary">{status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                        </h2>
                        <p className="text-muted-foreground">
                            {status === 'rejected'
                                ? 'Your account access has been rejected by the administrator. Please contact support if you believe this is an error.'
                                : 'Welcome to Restau Plus! Your account is currently awaiting administrator approval. You will gain full access once your request is reviewed.'}
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Button
                            className="bg-primary hover:bg-primary/90 text-white h-12 rounded-xl group"
                            asChild
                        >
                            <a href="mailto:support@restauplus.com?subject=Account Access Request">
                                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Contact Support
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 hover:bg-white/5 h-12 rounded-xl text-muted-foreground"
                            onClick={signOut}
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                            Restau Plus Enterprise
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <>{children}</>;
}
