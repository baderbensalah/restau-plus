
"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Minus, Plus, Search, MapPin, Phone, Instagram, Facebook, Globe, Star, ArrowRight, Sparkles, X, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
    menuItems: initialMenuItems,
    categories: initialCategories
}: {
    restaurant: any,
    menuItems: MenuItem[],
    categories: any[]
}) {
    const supabase = createClient();
    const [currentRestaurant, setCurrentRestaurant] = useState(restaurant);
    const [menuItems, setMenuItems] = useState(initialMenuItems);
    const [categories, setCategories] = useState(initialCategories);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [orderNotes, setOrderNotes] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // --- PARALLAX & SCROLL EFFECTS ---
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
    const heroY = useTransform(scrollY, [0, 400], [0, 100]);

    // --- REAL-TIME UPDATES & CSS VARS ---
    function hexToHsl(hex: string): string {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return "0 0% 0%";
        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
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
        return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
    }

    useEffect(() => {
        // Apply colors immediately
        const primaryHsl = hexToHsl(currentRestaurant.primary_color || '#000000');
        const secondaryHsl = hexToHsl(currentRestaurant.secondary_color || '#ffffff');

        document.documentElement.style.setProperty('--primary', primaryHsl);
        document.documentElement.style.setProperty('--secondary', secondaryHsl);
        document.documentElement.style.setProperty('--ring', primaryHsl);
    }, [currentRestaurant.primary_color, currentRestaurant.secondary_color]);

    useEffect(() => {
        const channel = supabase
            .channel('restaurant-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'restaurants',
                    filter: `id=eq.${restaurant.id}`
                },
                (payload) => {
                    setCurrentRestaurant(payload.new);
                    toast.success("Design & Content Updated", {
                        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
                        className: "bg-zinc-900 border-zinc-800 text-white"
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [restaurant.id, supabase]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll, { passive: true });
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

    // Better Quick-Add logic
    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        toast.success(
            <div className="flex items-center gap-2">
                <span className="font-bold">{item.name}</span> added
            </div>,
            {
                position: "bottom-center",
                className: "glass-card border-primary/20 text-foreground font-medium",
                duration: 1500
            }
        );
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
        if (!customerName.trim()) {
            toast.error("Please enter your name.");
            return;
        }

        setLoading(true);
        try {
            const { data: order, error: orderError } = await supabase.from('orders').insert({
                restaurant_id: currentRestaurant.id,
                status: 'pending',
                total_amount: cartTotal,
                customer_name: customerName,
                table_number: tableNumber,
                notes: orderNotes,
            }).select().single();

            if (orderError) throw orderError;

            const itemsToInsert = cart.map(item => ({
                restaurant_id: currentRestaurant.id,
                order_id: order.id,
                menu_item_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;

            setCart([]);
            setIsCartOpen(false);
            setCustomerName("");
            setTableNumber("");
            setOrderNotes("");

            toast.success("Order Placed Successfully!");
        } catch (error: any) {
            console.error("Order process failed:", error);
            toast.error("Could not place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] selection:bg-primary/30 text-foreground overflow-x-hidden font-sans">

            {/* --- 1. HERO SECTION --- */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0 z-0">
                    {currentRestaurant.banner_url ? (
                        <div className="relative w-full h-full">
                            <img src={currentRestaurant.banner_url} className="w-full h-full object-cover" alt="Banner" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-black/30" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
                    )}
                </motion.div>

                <div className="container relative z-10 px-6 mx-auto text-center flex flex-col items-center pt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="h-32 w-32 rounded-[2.5rem] p-1.5 glass-card shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                            {currentRestaurant.logo_url ? (
                                <img src={currentRestaurant.logo_url} className="w-full h-full object-cover rounded-[2.2rem]" alt="Logo" />
                            ) : (
                                <div className="text-4xl font-black text-primary">
                                    {currentRestaurant.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6 max-w-2xl"
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg">
                            {currentRestaurant.name}
                        </h1>

                        {/* Quick Info Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {currentRestaurant.address && (
                                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-zinc-300">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span>{currentRestaurant.address}</span>
                                </div>
                            )}
                            {currentRestaurant.phone && (
                                <a href={`tel:${currentRestaurant.phone}`} className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium text-zinc-300 hover:bg-primary/20 hover:border-primary/30 transition-colors">
                                    <Phone className="w-3.5 h-3.5 text-primary" />
                                    <span>{currentRestaurant.phone}</span>
                                </a>
                            )}
                        </div>

                        <p className="text-lg text-zinc-400 font-medium opacity-80 line-clamp-2 max-w-lg mx-auto leading-relaxed">
                            {currentRestaurant.description || "Experience the art of fine dining, redefined."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* --- 2. FLOATING NAVIGATION --- */}
            <div className={cn(
                "sticky top-4 z-40 transition-all duration-300 mx-4 md:mx-auto max-w-5xl rounded-2xl",
                scrolled ? "bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl" : "bg-transparent"
            )}>
                <div className="px-2 py-2 flex flex-col md:flex-row gap-4 items-center justify-between">

                    {/* SCROLLABLE CATEGORIES */}
                    <div className="w-full md:w-auto overflow-hidden">
                        <div className="overflow-x-auto no-scrollbar py-2 px-2 -mx-2 flex gap-3 md:justify-center">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap",
                                    activeCategory === 'all'
                                        ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] ring-1 ring-primary/50"
                                        : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                All Items
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap",
                                        activeCategory === cat.id
                                            ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] ring-1 ring-primary/50"
                                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find a dish..."
                            className="pl-10 h-10 bg-white/5 border-none text-white rounded-xl focus:ring-1 focus:ring-primary placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            </div>

            {/* --- 3. MENU GRID --- */}
            <main className="container mx-auto px-4 py-12 min-h-[50vh]">
                <AnimatePresence mode="wait">
                    {filteredItems.length > 0 ? (
                        <motion.div
                            key={activeCategory + searchQuery}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="group bg-zinc-900/40 border border-white/5 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] flex flex-col h-full active:scale-[0.99]">
                                        <div className="relative h-64 overflow-hidden">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Sparkles className="text-zinc-700 w-12 h-12" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            <div className="absolute bottom-5 left-6 right-6 flex justify-between items-end">
                                                <h3 className="text-2xl font-black text-white line-clamp-1 drop-shadow-md">{item.name}</h3>
                                                <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 text-lg px-3 py-1 font-bold">
                                                    ${item.price}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1 gap-4">
                                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 flex-1 font-medium">
                                                {item.description || "A delicious choice prepared with fresh ingredients."}
                                            </p>
                                            <Button
                                                onClick={() => addToCart(item)}
                                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all text-base"
                                            >
                                                Add to Order
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 text-zinc-500">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-xl font-medium">No items found.</p>
                            <Button variant="link" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="text-primary mt-2">Clear Filters</Button>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* --- 4. CART --- */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className="fixed bottom-6 left-4 right-4 z-50 md:max-w-md md:mx-auto"
                    >
                        <div
                            onClick={() => setIsCartOpen(true)}
                            className="bg-primary text-white p-4 pl-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(var(--primary),0.5)] flex items-center justify-between cursor-pointer active:scale-95 transition-transform ring-1 ring-white/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2.5 rounded-xl"><ShoppingCart className="w-6 h-6 fill-current" /></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold opacity-90 uppercase tracking-widest">{cartCount} items</span>
                                    <span className="text-2xl font-black leading-none">${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold pr-2">
                                Checkout <ArrowRight className="w-5 h-5 animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetContent className="bg-[#09090b] border-l border-white/10 text-white sm:max-w-md w-full p-0 flex flex-col h-full">
                    <div className="px-6 py-6 border-b border-white/10 bg-zinc-900/50">
                        <SheetTitle className="text-3xl font-black text-white">Your Order</SheetTitle>
                        <SheetDescription className="text-zinc-500 font-medium">Review delicious items</SheetDescription>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                                <ShoppingCart className="w-16 h-16 opacity-50" />
                                <p>Your cart is empty.</p>
                            </div>
                        ) : cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-lg leading-tight">{item.name}</span>
                                        <span className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-0 bg-black/50 rounded-lg p-0.5 border border-white/10">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                                            <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-zinc-900/80 border-t border-white/10 space-y-5 backdrop-blur-xl">
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs font-bold uppercase text-zinc-500 ml-1">Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="bg-black/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary/50 text-base"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold uppercase text-zinc-500 ml-1">Table</Label>
                                    <Input
                                        placeholder="#"
                                        value={tableNumber}
                                        onChange={e => setTableNumber(e.target.value)}
                                        className="bg-black/50 border-white/10 h-12 rounded-xl focus:ring-primary focus:border-primary/50 text-base text-center"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold uppercase text-zinc-500 ml-1">Note (Optional)</Label>
                                <Input
                                    placeholder="Extra sauce, no onions..."
                                    value={orderNotes}
                                    onChange={e => setOrderNotes(e.target.value)}
                                    className="bg-black/50 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary/50 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={placeOrder}
                            disabled={loading || cart.length === 0}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-black rounded-xl shadow-lg shadow-primary/20 flex items-center justify-between px-6"
                        >
                            <span>Send Order</span>
                            {loading ? <Sparkles className="animate-spin" /> : <span>${cartTotal.toFixed(2)}</span>}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* --- 5. LEGENDARY FOOTER --- */}
            <footer className="relative bg-[#080808] border-t border-white/5 pt-20 pb-12 mt-20">
                <div className="container mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
                        {/* Brand Column */}
                        <div className="md:col-span-5 space-y-6 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/10 text-primary font-black text-xl shadow-lg">
                                    {currentRestaurant.name.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">{currentRestaurant.name}</h3>
                            </div>
                            <p className="text-zinc-500 text-base leading-relaxed max-w-sm mx-auto md:mx-0 font-medium">
                                {currentRestaurant.description || "Crafting unforgettable dining experiences with the finest ingredients and passion for culinary excellence."}
                            </p>

                            {/* Socials */}
                            <div className="flex gap-3 justify-center md:justify-start pt-2">
                                {[
                                    { Icon: Instagram, url: currentRestaurant.instagram_url },
                                    { Icon: Facebook, url: currentRestaurant.facebook_url },
                                    { Icon: Globe, url: currentRestaurant.website_url }
                                ].map((social, i) => social.url && (
                                    <a
                                        key={i}
                                        href={social.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-white text-zinc-400 flex items-center justify-center transition-all duration-300 border border-white/5 hover:scale-110"
                                    >
                                        <social.Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Spacer */}
                        <div className="hidden md:block md:col-span-2"></div>

                        {/* Contact Column */}
                        <div className="md:col-span-5 space-y-8">
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center md:text-left">Visit Us</h4>
                                {currentRestaurant.address ? (
                                    <div className="flex group items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                                        <div className="bg-black/50 p-3 rounded-full text-primary shrink-0">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg leading-tight mb-1">Our Location</p>
                                            <p className="text-zinc-400 font-medium">{currentRestaurant.address}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-zinc-600 text-center md:text-left italic">Address not available</div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center md:text-left">Get in Touch</h4>
                                {currentRestaurant.phone ? (
                                    <a href={`tel:${currentRestaurant.phone}`} className="flex group items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer">
                                        <div className="bg-black/50 p-3 rounded-full text-primary shrink-0">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg leading-tight mb-1">Call Us</p>
                                            <p className="text-zinc-400 font-medium group-hover:text-primary transition-colors">{currentRestaurant.phone}</p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="text-zinc-600 text-center md:text-left italic">Phone not available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    {/* Bottom Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-zinc-600 text-sm font-medium">
                            &copy; {new Date().getFullYear()} {currentRestaurant.name}. All rights reserved.
                        </p>

                        <a href="https://restau-plus.com" target="_blank" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-white/10 hover:border-primary/50 transition-all">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider group-hover:text-zinc-300">Powered by</span>
                            <span className="text-white font-black tracking-tight flex items-center gap-1 group-hover:text-primary transition-colors">
                                Restau<span className="text-primary">+</span>
                            </span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
