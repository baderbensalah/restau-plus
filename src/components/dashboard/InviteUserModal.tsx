"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";

export function InviteUserModal() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'invite' | 'success'>('invite');
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mock invitation logic for now
        // In a real app, this would call a server action to send an email
        const mockLink = `https://restauplus.com/join?token=${Math.random().toString(36).substring(7)}`;
        setInviteLink(mockLink);
        setStep('success');
        toast.success("Invitation generated!");
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-zinc-200 border-0 font-bold shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        Invite New User
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Send an invitation to join the platform.
                    </DialogDescription>
                </DialogHeader>

                {step === 'invite' ? (
                    <form onSubmit={handleInvite} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                            <Input id="email" type="email" placeholder="colleague@example.com" required className="bg-zinc-900 border-zinc-800 focus:border-blue-500/50" />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full">
                                Generate Invite Link
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 break-all text-xs font-mono text-zinc-400">
                            {inviteLink}
                        </div>
                        <Button onClick={copyToClipboard} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "Copied!" : "Copy Link"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
