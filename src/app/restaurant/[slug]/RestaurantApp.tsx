
"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Minus, Plus, Search, ChevronRight, MapPin, Phone, Instagram, Facebook, Globe, Star, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type MenuItem = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category_id?: string;
};

type CartItem = MenuItem & { quantity: number; notes?: string };

export function RestaurantApp({
    restaurant,
    menuItems,
    categories
}: {
    restaurant: any,
    menuItems: MenuItem[],
    categories: any[]
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [orderNotes, setOrderNotes] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const filteredItems = useMemo(() => {
        let items = menuItems;
        if (activeCategory !== "all") {
            items = items.filter(item => item.category_id === activeCategory);
        }
        if (searchQuery) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return items;
    }, [activeCategory, searchQuery, menuItems]);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(`Added ${item.name} to order`, {
            position: "bottom-center",
            className: "glass-card border-primary/20 text-foreground"
        });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) return { ...i, quantity: Math.max(0, i.quantity + delta) };
            return i;
        }).filter(i => i.quantity > 0));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

    const placeOrder = async () => {
        if (!customerName) {
            toast.error("Please enter your name.");
            return;
        }

        setLoading(true);
        try {
            const { data: order, error: orderError } = await supabase.from('orders').insert({
                restaurant_id: restaurant.id,
                status: 'pending',
                total_amount: cartTotal,
                customer_name: customerName,
                table_number: tableNumber,
                notes: orderNotes,
            }).select().single();

            if (orderError) throw orderError;

            const itemsToInsert = cart.map(item => ({
                restaurant_id: restaurant.id,
                order_id: order.id,
                menu_item_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;

            setCart([]);
            setIsCartOpen(false);
            toast.success("Order received! We're preparing your meal.", {
                className: "bg-emerald-500 text-white font-bold"
            });
        } catch (error: any) {
            console.error("Order process failed:", error);
            const errorMessage = error.message || error.details || "Check your internet connection or try again later.";
            toast.error("Failed to place order: " + errorMessage, {
                duration: 5000,
                className: "glass-card border-destructive/50"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 custom-scrollbar selection:bg-primary/30">

            {/* --- 1. PREMIUM HERO SECTION --- */}
            <section className="relative h-[45vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
                {/* Background Banner with Depth */}
                <div className="absolute inset-0 z-0">
                    {restaurant.banner_url ? (
                        <div className="relative w-full h-full">
                            <motion.img
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 0.6 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                src={restaurant.banner_url}
                                className="w-full h-full object-cover"
                                alt="Restaurant Banner"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#050505]" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    {/* Animated Particles/Overlay */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                </div>

                {/* Content Overlay */}
                <div className="container relative z-10 px-6 mx-auto text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 relative"
                    >
                        <div className="h-28 w-28 md:h-36 md:w-36 rounded-[2rem] p-1.5 glass-card glow-box animate-float shadow-primary/20 flex items-center justify-center overflow-hidden">
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} className="w-full h-full object-contain rounded-[1.8rem]" alt="Logo" />
                            ) : (
                                <div className="text-4xl font-black text-primary drop-shadow-lg">
                                    {restaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-[#050505]">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                            {restaurant.name}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium lowercase italic opacity-80">
                            {restaurant.description || "Indulge in a premium culinary journey."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- 2. FLOATING CATEGORY NAV --- */}
            <div className={cn(
                "sticky top-0 z-50 transition-all duration-500 py-4",
                scrolled ? "bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl" : "bg-transparent"
            )}>
                <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 w-full md:w-auto">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-glass",
                                activeCategory === 'all'
                                    ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] border-primary scale-105"
                                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            )}
                        >
                            Exquisite Menu
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-glass",
                                    activeCategory === cat.id
                                        ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] border-primary scale-105"
                                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                )}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find your flavor..."
                            className="pl-10 h-10 bg-white/5 border-white/10 text-white rounded-full focus:ring-primary focus:border-primary placeholder:text-gray-600"
                        />
                    </div>
                </div>
            </div>

            {/* --- 3. THE MENU GRID (X100 PRO) --- */}
            <main className="container mx-auto px-4 py-12">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeCategory + searchQuery}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden bg-card/20 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                                    {/* Item Image with Animated Overlay */}
                                    <div className="relative h-64 overflow-hidden">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                                                <Search className="w-12 h-12 text-gray-700 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />

                                        {/* Floating Badge */}
                                        <div className="absolute top-5 right-5">
                                            <Badge className="bg-white/10 backdrop-blur-xl text-white border-white/20 text-lg font-black px-4 py-1.5 rounded-full shadow-2xl">
                                                ${item.price}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-8 flex flex-col flex-1">
                                        <div className="flex-1 space-y-3">
                                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors duration-300">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-500 leading-relaxed text-sm font-medium">
                                                {item.description || "A masterfully crafted signature dish prepared with the finest ingredients available."}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                            <Button
                                                onClick={() => addToCart(item)}
                                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 animate-shine group/btn overflow-hidden"
                                            >
                                                <span className="relative z-10">Experience Flavor</span>
                                                <Plus className="ml-2 w-5 h-5 relative z-10 group-hover/btn:rotate-90 transition-transform duration-300" />
                                            </Button>
                                        </div>
                                    </CardContent>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredItems.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 space-y-6"
                    >
                        <div className="inline-block p-6 rounded-full bg-white/5 border-glass">
                            <Search className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-400">No treasures found matching your search.</h2>
                        <Button variant="link" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="text-primary font-bold">Show everything</Button>
                    </motion.div>
                )}
            </main>

            {/* --- Floating Interaction Bar --- */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-[60]"
                    >
                        <div className="glass-card rounded-full p-2 pl-8 flex items-center justify-between border-primary/20 shadow-[0_-10px_40px_rgba(var(--primary),0.15)] glow-box">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">Ready to order</span>
                                <span className="text-2xl font-black text-white">${cartTotal.toFixed(2)}</span>
                            </div>

                            <Button
                                onClick={() => setIsCartOpen(true)}
                                size="lg"
                                className="rounded-full h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg transition-transform hover:scale-105"
                            >
                                <ShoppingCart className="w-5 h-5 mr-3" />
                                Order Now
                                <div className="ml-3 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">{cartCount}</div>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Cart View (Immersive Pane) --- */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetContent side="right" className="bg-[#050505] border-l border-white/10 text-white flex flex-col p-0 sm:max-w-md overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                        <SheetTitle className="text-3xl font-black text-white italic tracking-tighter">Your Selection</SheetTitle>
                        <SheetDescription className="text-gray-500 font-bold mt-1">Review your order before we begin preparation.</SheetDescription>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                        {cart.map(item => (
                            <motion.div key={item.id} layout className="flex gap-6 items-center">
                                <div className="h-20 w-20 rounded-2xl bg-white/5 border-glass overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Search className="w-6 h-6 text-gray-700" /></div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-lg leading-tight">{item.name}</h4>
                                        <span className="font-black text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center bg-white/5 rounded-full px-2 py-1 border-glass">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors"><Minus className="w-3 h-3" /></button>
                                            <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.02] border-t border-white/5 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-gray-500 uppercase">Guest Name</Label>
                                <Input placeholder="Mr. Gatsby" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-white/5 border-glass h-12 rounded-xl focus:ring-primary" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black text-gray-500 uppercase">Table No.</Label>
                                <Input placeholder="No. 01" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="bg-white/5 border-glass h-12 rounded-xl focus:ring-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black text-gray-500 uppercase">Special Instructions / Notes</Label>
                            <Input
                                placeholder="Extra spicy, no onions, or surprise us!"
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="bg-white/5 border-glass h-12 rounded-xl focus:ring-primary"
                            />
                        </div>

                        <div className="pt-4 space-y-4">
                            <div className="flex justify-between text-xl font-black italic">
                                <span>Grand Total</span>
                                <span className="text-glow-primary text-2xl">${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button onClick={placeOrder} disabled={loading} className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-[0_10px_30px_rgba(var(--primary),0.3)] group overflow-hidden">
                                {loading ? "Communicating with Kitchen..." : "Confirm & Order"}
                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* --- THE SIGNATURE FOOTER --- */}
            <footer className="bg-white/[0.01] border-t border-white/5 py-32">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-left">
                    <div className="space-y-6">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black">R+</div>
                            <h3 className="text-3xl font-black italic tracking-tighter text-white">{restaurant.name}</h3>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                            {restaurant.description || "A legacy of flavor, crafted with passion and served with excellence. Join us for a culinary experience like no other."}
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4">Location</h4>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-lg font-bold text-gray-300">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{restaurant.address || "Main Street, Gourmet City"}</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4">Reservations</h4>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-lg font-bold text-gray-300">
                                <Phone className="w-5 h-5 text-primary" />
                                <span>{restaurant.phone || "+1 (555) 000-LOGO"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-between">
                        <div className="flex gap-4">
                            {[
                                { icon: Instagram, url: restaurant.instagram_url },
                                { icon: Facebook, url: restaurant.facebook_url },
                                { icon: Globe, url: restaurant.website_url }
                            ].map((social, i) => (
                                social.url && (
                                    <a key={i} href={social.url} target="_blank" className="w-14 h-14 rounded-2xl bg-white/5 border-glass flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all duration-300">
                                        <social.icon className="w-6 h-6 text-white" />
                                    </a>
                                )
                            ))}
                        </div>
                        <div className="mt-12 md:mt-0 text-white/20 font-black italic text-4xl">
                            RESTAU+
                        </div>
                    </div>
                </div>
                <div className="mt-32 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.5em]">
                    &copy; 2026 {restaurant.name} • DIGITAL DINING REDEFINED
                </div>
            </footer>
        </div>
    );
}
