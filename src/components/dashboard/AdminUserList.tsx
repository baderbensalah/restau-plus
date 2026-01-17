"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Store, Mail, ListFilter } from "lucide-react";
import { AdminActions } from "./AdminActions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface AdminUserListProps {
    initialProfiles: any[];
}

export function AdminUserList({ initialProfiles }: AdminUserListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');

    const filteredProfiles = initialProfiles.filter(profile => {
        // 1. Text Search
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            profile.full_name?.toLowerCase().includes(searchLower) ||
            profile.email?.toLowerCase().includes(searchLower) ||
            profile.restaurant?.name?.toLowerCase().includes(searchLower);

        // 2. Status Filter
        const matchesStatus = statusFilter === 'all' || profile.status === statusFilter || (statusFilter === 'active' && profile.status === 'approved');

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Recent Users
                        <Badge className="bg-white/10 text-zinc-300 hover:bg-white/20">{filteredProfiles.length}</Badge>
                    </h2>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users, emails, stores..."
                            className="bg-zinc-900 border-zinc-800 pl-9 focus:border-purple-500/50"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                <ListFilter className="w-4 h-4 mr-2" />
                                Filter: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white">
                            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === 'all'}
                                onCheckedChange={() => setStatusFilter('all')}
                            >
                                All Users
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === 'active'}
                                onCheckedChange={() => setStatusFilter('active')}
                                className="text-emerald-400 focus:text-emerald-400"
                            >
                                Active
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === 'pending'}
                                onCheckedChange={() => setStatusFilter('pending')}
                                className="text-orange-400 focus:text-orange-400"
                            >
                                Pending
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={statusFilter === 'rejected'}
                                onCheckedChange={() => setStatusFilter('rejected')}
                                className="text-red-400 focus:text-red-400"
                            >
                                Revoked
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* List */}
            <div className="bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-white/5 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <div className="col-span-5 md:col-span-4">User Details</div>
                    <div className="hidden md:block col-span-3">Role & Status</div>
                    <div className="hidden md:block col-span-3">Restaurant</div>
                    <div className="col-span-7 md:col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredProfiles.map((profile: any) => {
                        const restaurant = Array.isArray(profile.restaurant) ? profile.restaurant[0] : profile.restaurant;

                        const profileForActions = {
                            ...profile,
                            restaurant_id: restaurant?.id,
                            restaurant_name: restaurant?.name,
                            restaurant_slug: restaurant?.slug,
                            restaurant_is_active: restaurant?.is_active
                        };

                        return (
                            <div key={profile.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center font-bold text-zinc-400 group-hover:text-white group-hover:border-purple-500/50 transition-all shadow-lg shadow-black/50">
                                        {profile.full_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-white truncate">{profile.full_name || 'No Name'}</p>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                                            <Mail className="w-3 h-3" />
                                            {profile.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block col-span-3">
                                    <div className="flex flex-col items-start gap-1">
                                        <Badge variant="outline" className={`text-xs border-white/10 bg-black/50 ${profile.role === 'admin' ? 'text-purple-400 border-purple-500/30' : 'text-zinc-300'}`}>
                                            {profile.role.toUpperCase()}
                                        </Badge>
                                        {profile.status === 'pending' && <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Pending Approval</span>}
                                        {profile.status === 'active' && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>}
                                        {profile.status === 'rejected' && <span className="text-[10px] text-red-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Revoked</span>}
                                    </div>
                                </div>

                                <div className="hidden md:block col-span-3">
                                    {restaurant ? (
                                        <div className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                                            <Store className={`w-4 h-4 ${restaurant.is_active === false ? 'text-red-500' : 'text-zinc-500'}`} />
                                            <span className={`text-sm ${restaurant.is_active === false ? 'text-red-400 line-through' : ''}`}>
                                                {restaurant.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-700 text-sm italic">No Restaurant</span>
                                    )}
                                </div>

                                <div className="col-span-7 md:col-span-2 flex justify-end">
                                    <AdminActions profile={profileForActions} />
                                </div>
                            </div>
                        );
                    })}

                    {filteredProfiles.length === 0 && (
                        <div className="p-8 text-center text-zinc-500 py-12">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No users found matching your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
