"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, Mail, Calendar, Hash, Store, MapPin, Globe } from "lucide-react";

interface ViewDetailsModalProps {
    user: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewDetailsModal({ user, open, onOpenChange }: ViewDetailsModalProps) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Info className="w-5 h-5 text-blue-500" />
                        User & Restaurant Details
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Complete system record for this account.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* User Metadata */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2">
                                User Profile
                            </h3>

                            <div className="space-y-3">
                                <DetailItem icon={Hash} label="User ID" value={user.id} mono />
                                <DetailItem icon={Mail} label="Email" value={user.email} />
                                <DetailItem icon={Calendar} label="Joined" value={new Date(user.created_at).toLocaleString()} />

                                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
                                    <span className="text-xs text-zinc-400">Current Status</span>
                                    <Badge className={`${user.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                            user.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {user.status?.toUpperCase() || 'UNKNOWN'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
                                    <span className="text-xs text-zinc-400">System Role</span>
                                    <Badge variant="outline" className="text-zinc-300 border-zinc-700">
                                        {user.role?.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Restaurant Metadata */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-800 pb-2">
                                Restaurant Data
                            </h3>

                            {user.restaurant_id ? (
                                <div className="space-y-3">
                                    <DetailItem icon={Store} label="Restaurant Name" value={user.restaurant_name} />
                                    <DetailItem icon={Globe} label="Slug / URL" value={user.restaurant_slug} />
                                    <DetailItem icon={Hash} label="Restaurant ID" value={user.restaurant_id} mono />

                                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/50 border border-zinc-800">
                                        <span className="text-xs text-zinc-400">Store Status</span>
                                        <Badge className={`${user.restaurant_is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {user.restaurant_is_active ? 'OPERATIONAL' : 'SUSPENDED'}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                                    <Store className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-500">No restaurant linked</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function DetailItem({ icon: Icon, label, value, mono }: any) {
    return (
        <div className="flex items-start gap-3 p-2 hover:bg-white/5 rounded transition-colors group">
            <div className="mt-0.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-zinc-600 mb-0.5">{label}</p>
                <p className={`text-sm text-zinc-200 truncate ${mono ? 'font-mono text-xs' : ''}`} title={value}>
                    {value || '—'}
                </p>
            </div>
        </div>
    );
}
