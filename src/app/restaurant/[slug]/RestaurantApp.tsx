"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Search, MapPin, Clock, ArrowRight, Sparkles, X, ChevronRight, Star, Info, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
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
    const [activeCategory, setActiveCategory] = useState<string>("");

    // --- DATA PREP ---
    // --- DATA PREP ---
    // 1. Group items
    type MenuItemGroup = {
        id: string;
        name: string;
        items: MenuItem[];
        sort_order?: number;
    }

    const menuItemsByCategory: MenuItemGroup[] = [...initialCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        items: initialMenuItems.filter(item => item.category_id === cat.id)
    })).filter((group: MenuItemGroup) => group.items.length > 0)];

    // 2. Handle Uncategorized
    const uncategorizedItems = initialMenuItems.filter(item => !item.category_id || !initialCategories.find(c => c.id === item.category_id));
    if (uncategorizedItems.length > 0) {
        menuItemsByCategory.unshift({
            id: 'general',
            name: 'Featured', // Renamed for better UX
            sort_order: -1,
            items: uncategorizedItems
        });
    }

    // Initialize active category
    useEffect(() => {
        if (!activeCategory && menuItemsByCategory.length > 0) {
            setActiveCategory(menuItemsByCategory[0].id);
        }
    }, [menuItemsByCategory]);

    // --- CURRENCY ---
    const currencyCode = currentRestaurant.currency || 'USD';
    const currencySymbol = currencyCode === 'QAR' ? 'QR' : currencyCode === 'MAD' ? 'DH' : '$';

    // --- STATE ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null); // For detail view?? Maybe later.
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Checkout
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [orderNotes, setOrderNotes] = useState("");

    // Refs
    const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
    const navRef = useRef<HTMLDivElement>(null);

    // --- ANIMATIONS ---
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 500], [0, 200]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);
    const navOpacity = useTransform(scrollY, [150, 250], [0, 1]);

    // Spring physics for smooth feeling
    const springConfig = { stiffness: 100, damping: 30, mass: 1 };

    // --- THEME ENGINE ---
    // --- THEME ENGINE ---
    // Helper: Convert Hex to HSL objects for easier manipulation
    function hexToRgb(hex: string) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function getLuminance(r: number, g: number, b: number) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastColor(hex: string) {
        const rgb = hexToRgb(hex);
        const lum = getLuminance(rgb.r, rgb.g, rgb.b);
        // If dark, return white HSL. If light, return black HSL.
        // Format: "H S% L%"
        return lum > 0.5 ? "0 0% 0%" : "0 0% 100%";
    }

    function hexToHslStr(hex: string): string {
        const rgb = hexToRgb(hex);
        const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
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
        // Return mostly space-separated numbers without 'hsl()' wrapping for Tailwind/Shadcn opacity modifiers to work
        return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
    }

    useEffect(() => {
        const primaryHex = currentRestaurant.primary_color || '#ea580c';
        const secondaryHex = currentRestaurant.secondary_color || '#ffffff'; // Default secondary to white/light for contrast

        // --- "PERFECT" BACKGROUND STRATEGY ---
        // Switching to Force WHITE/LIGHT Theme as requested.
        const perfectBgHex = '#ffffff'; // Pure White
        const perfectFgHex = '#09090b'; // Deep Black/Zinc-950 for text

        const primaryHsl = hexToHslStr(primaryHex);
        const secondaryHsl = hexToHslStr(secondaryHex);
        const backgroundHsl = hexToHslStr(perfectBgHex);
        const foregroundHsl = hexToHslStr(perfectFgHex);

        // Calculate contrast foregrounds for buttons
        const primaryFgHsl = getContrastColor(primaryHex);

        const root = document.documentElement;

        // Apply Core Brand Colors
        root.style.setProperty('--primary', primaryHsl);
        root.style.setProperty('--primary-foreground', primaryFgHsl);

        root.style.setProperty('--secondary', secondaryHsl);
        root.style.setProperty('--secondary-foreground', '0 0% 100%'); // White text on secondary

        root.style.setProperty('--background', backgroundHsl);
        root.style.setProperty('--foreground', foregroundHsl);

        // ENFORCE LIGHT THEME CARD SYSTEM
        root.style.setProperty('--card', '0 0% 100%'); // White cards
        root.style.setProperty('--card-foreground', '240 10% 3.9%'); // Dark text
        root.style.setProperty('--muted', '240 4.8% 95.9%'); // Light grey
        root.style.setProperty('--muted-foreground', '240 3.8% 46.1%');
        root.style.setProperty('--border', '240 5.9% 90%'); // Subtle light border

    }, [currentRestaurant]);

    // --- SCROLL SPY LOGIC ---
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const offset = 200; // Look ahead
            let current = activeCategory;
            for (const group of menuItemsByCategory) {
                const el = categoryRefs.current[group.id];
                if (el && el.getBoundingClientRect().top <= offset) {
                    current = group.id;
                }
            }
            setActiveCategory(current);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [menuItemsByCategory, activeCategory]);

    const scrollToCategory = (id: string) => {
        setActiveCategory(id);
        const el = categoryRefs.current[id];
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    // --- CART ACTIONS ---
    const addToCart = (item: MenuItem, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
            return [...prev, { ...item, quantity }];
        });
        toast.custom((t) => (
            <div className="bg-zinc-900 text-white border border-zinc-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[300px]">
                <div className="bg-primary text-black rounded-full p-1"><Sparkles className="w-4 h-4 fill-current" /></div>
                <div className="flex-1">
                    <p className="font-bold text-sm">Added to Order</p>
                    <p className="text-zinc-400 text-xs">{item.name}</p>
                </div>
            </div>
        ), { duration: 1500 });
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
    };

    const placeOrder = async () => {
        if (!customerName.trim()) { toast("👋 Please tell us your name!"); return; }
        setLoading(true);
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        try {
            const { data: order, error } = await supabase.from('orders').insert({
                restaurant_id: currentRestaurant.id, status: 'pending', total_amount: total,
                customer_name: customerName, table_number: tableNumber, notes: orderNotes,
            }).select().single();
            if (error) throw error;
            await supabase.from('order_items').insert(cart.map(item => ({
                restaurant_id: currentRestaurant.id, order_id: order.id, menu_item_id: item.id,
                quantity: item.quantity, price_at_time: item.price
            })));
            setCart([]); setIsCartOpen(false); setCustomerName(""); setTableNumber(""); setOrderNotes("");
            toast.success("Order received! The kitchen is already moving.");
        } catch (e) { toast.error("Something went wrong. Please try again."); } finally { setLoading(false); }
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

    return (
        <div className="min-h-screen bg-white text-zinc-950 font-sans selection:bg-primary/30 pb-40">
            {/* --- IMMERSIVE HERO --- */}
            <div className="relative h-[55vh] w-full overflow-hidden">
                <motion.div style={{ y: heroY, scale: heroScale, opacity: heroOpacity }} className="absolute inset-0">
                    {currentRestaurant.banner_url ? (
                        <img src={currentRestaurant.banner_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-b from-zinc-100 to-zinc-200" />
                    )}
                    {/* Cinematic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-24 h-24 rounded-[2rem] bg-card border-[3px] border-background shadow-2xl overflow-hidden mb-6 relative group"
                    >
                        {/* Glow effect behind logo */}
                        <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all duration-500" />
                        {currentRestaurant.logo_url ? (
                            <img src={currentRestaurant.logo_url} className="w-full h-full object-cover relative z-10" alt="Logo" />
                        ) : (
                            <div className="w-full h-full bg-primary flex items-center justify-center text-3xl font-black text-primary-foreground relative z-10">
                                {currentRestaurant.name.charAt(0)}
                            </div>
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tighter mb-2 drop-shadow-lg"
                    >
                        {currentRestaurant.name}
                    </motion.h1>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-2 text-xs md:text-sm font-medium text-white/80"
                    >
                        {currentRestaurant.address && (
                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/5 hover:bg-black/60 transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span>{currentRestaurant.address.split(',')[0]}</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* --- GLASS NAVIGATION --- */}
            <div ref={navRef} className="sticky top-0 z-40 py-4 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm">
                <motion.div
                    className="mx-4 p-1.5 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl overflow-x-auto no-scrollbar flex items-center gap-1 max-w-lg md:mx-auto ring-1 ring-white/5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    {menuItemsByCategory.map(group => (
                        <button
                            key={group.id}
                            onClick={() => scrollToCategory(group.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shrink-0 relative overflow-hidden",
                                activeCategory === group.id
                                    ? "text-black shadow-lg"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            {activeCategory === group.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 mix-blend-multiply">{group.name}</span>
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* --- MENU FEED --- */}
            <main className="container max-w-lg mx-auto px-3 sm:px-4 space-y-12 pb-32">
                {menuItemsByCategory.map((group, groupIndex) => (
                    <section
                        key={group.id}
                        ref={el => { categoryRefs.current[group.id] = el }}
                        className="scroll-mt-32"
                    >
                        {/* Section Header */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-4 pl-1"
                        >
                            <div className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-xl md:text-2xl font-black tracking-tight">{group.name}</h2>
                        </motion.div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-6">
                            {group.items.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedItem(item)}
                                    className="group flex flex-col bg-white border border-border/40 hover:border-primary/50 rounded-[1.25rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
                                >
                                    {/* Image Wrapper */}
                                    <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Sparkles className="w-8 h-8 opacity-20" /></div>
                                        )}

                                        {/* Dynamic Badges */}
                                        {i % 3 === 0 && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-secondary text-secondary-foreground border-none shadow-lg animate-pulse-slow">
                                                    Popular
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Price Tag Overlay - Bottom Left */}
                                        <div className="absolute bottom-2 left-2 right-auto z-10">
                                            <div className="bg-background/80 backdrop-blur-md text-foreground px-2.5 py-1 rounded-full font-bold text-xs border border-border/10 shadow-lg">
                                                {currencySymbol}{item.price}
                                            </div>
                                        </div>

                                        {/* Quick Add Overlay - Bottom Right (Desktop Hover) */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                            className="absolute bottom-2 right-2 z-10 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                                        >
                                            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                                                <Plus className="w-5 h-5 stroke-[3px]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-4 flex flex-col flex-1 gap-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.name}</h3>
                                        </div>

                                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mb-auto">
                                            {item.description}
                                        </p>

                                        {/* Mobile Add Button (Always Visible & Prominent) */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                            className="mt-3 pt-3 border-t border-border/10 flex items-center justify-between sm:hidden cursor-pointer active:scale-95 transition-transform"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Add to Order</span>
                                            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg shadow-primary/20">
                                                <Plus className="w-4 h-4 stroke-[3px]" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ))}

                {menuItemsByCategory.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4"><Search className="w-8 h-8" /></div>
                        <p className="font-medium">No items found.</p>
                    </div>
                )}
            </main>

            {/* --- CART FLOATING BAR --- */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
                    >
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="pointer-events-auto w-full max-w-sm bg-foreground text-background p-2 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 flex items-center gap-2 group active:scale-95 transition-all ring-1 ring-white/5"
                        >
                            <div className="bg-primary text-primary-foreground font-black w-12 h-12 rounded-full flex items-center justify-center text-lg relative overflow-hidden shadow-inner">
                                <motion.span key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }}>{cartCount}</motion.span>
                            </div>

                            <div className="flex-1 text-left pl-1">
                                <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest mb-0.5">Total</p>
                                <p className="text-lg font-black leading-none font-mono tracking-tight">{currencySymbol}{cartTotal.toFixed(2)}</p>
                            </div>

                            <div className="bg-background text-foreground px-5 py-2.5 rounded-[2rem] text-sm font-bold flex items-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <span>Checkout</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CART SHEET --- */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetContent side="bottom" className="h-[92vh] rounded-t-[2.5rem] p-0 border-t-0 bg-background/95 backdrop-blur-xl outline-none">
                    <div className="h-full flex flex-col relative">
                        {/* Drag Handle */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted/50 rounded-full z-20" />

                        {/* Header */}
                        <div className="p-8 pb-4">
                            <SheetTitle className="text-4xl font-black tracking-tighter mb-2">My Order</SheetTitle>
                            <p className="text-muted-foreground font-medium">Almost ready to eat!</p>
                        </div>

                        {/* Items List */}
                        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
                                    <ShoppingBag className="w-16 h-16 mb-4" />
                                    <p className="font-bold text-lg">Your cart is empty</p>
                                </div>
                            ) : cart.map(item => (
                                <motion.div layout key={item.id} className="flex gap-4 items-center bg-card/30 p-2 rounded-2xl border border-transparent">
                                    <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden shrink-0 relative">
                                        {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-start mb-1 h-7">
                                            <h4 className="font-bold truncate pr-2">{item.name}</h4>
                                            <span className="font-bold font-mono">{currencySymbol}{(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-2 py-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-lg">-</button>
                                                <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-muted rounded text-lg">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer / Checkout */}
                        <div className="p-6 pt-2 bg-gradient-to-t from-background via-background to-transparent space-y-4">
                            <Input
                                placeholder="Your Name (Required)"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="h-14 rounded-2xl bg-card border-border/50 text-lg px-6"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <Input placeholder="Table No." value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="h-14 rounded-2xl bg-card border-border/50 px-6" />
                                <Input placeholder="Notes" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="h-14 rounded-2xl bg-card border-border/50 px-6" />
                            </div>

                            <Button
                                onClick={placeOrder}
                                disabled={loading || cart.length === 0}
                                className="w-full h-16 rounded-[1.5rem] text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {loading ? <Sparkles className="animate-spin w-6 h-6" /> : (
                                    <div className="flex items-center gap-3">
                                        <span>Confirm Order</span>
                                        <div className="w-1 h-1 bg-current rounded-full opacity-50" />
                                        <span className="font-mono">{currencySymbol}{cartTotal.toFixed(2)}</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Footer */}
            <footer className="container max-w-lg mx-auto px-6 py-12 text-center opacity-40">
                <div className="w-8 h-8 rounded-full bg-border mx-auto mb-4 flex items-center justify-center text-xs font-bold">R+</div>
                <p className="text-xs uppercase tracking-widest">Powered by Restau+</p>
            </footer>

            {/* --- PRODUCT DETAIL SHEET --- */}
            <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-[2.5rem] p-0 border-t-0 bg-transparent shadow-none outline-none overflow-hidden">
                    {selectedItem && (
                        <div className="h-full flex flex-col relative bg-white rounded-t-[2.5rem] overflow-hidden shadow-2xl">

                            {/* Hero Image Area */}
                            <div className="relative h-[40vh] w-full shrink-0">
                                {selectedItem.image_url ? (
                                    <img src={selectedItem.image_url} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center"><Sparkles className="w-12 h-12 text-zinc-300" /></div>
                                )}
                                {/* Close Button - Floating properly */}
                                <div className="absolute top-4 right-4 z-50">
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="h-10 w-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-black shadow-lg hover:bg-white transition-colors active:scale-95"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content - White Card Style Overlapping Image */}
                            <div className="flex-1 overflow-y-auto relative z-10 bg-white -mt-10 pt-10 rounded-t-[2.5rem] px-8 pb-32">
                                {/* Drag Handle Indicator */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-200 rounded-full" />

                                <div className="flex flex-col gap-2 mb-6 mt-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <SheetTitle className="text-3xl font-black leading-tight tracking-tight text-zinc-950">{selectedItem.name}</SheetTitle>
                                        <div className="text-xl font-bold font-mono text-primary shrink-0 whitespace-nowrap">
                                            {currencySymbol}{selectedItem.price}
                                        </div>
                                    </div>

                                    {/* Categories/Tags (Optional Polish) */}
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">
                                            Delicious
                                        </span>
                                    </div>
                                </div>

                                <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-medium">
                                    {selectedItem.description}
                                </p>

                                {/* Preferences / Extras Section */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2 mb-4">Preferences</h4>

                                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:bg-zinc-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Info className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 text-sm">Special Instructions</span>
                                                <span className="text-xs text-zinc-400">Allergies, extra sauce, etc.</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-zinc-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Action Footer - Pure White with Subtle Shadow */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                                <Button
                                    onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}
                                    className="w-full h-16 rounded-[1.5rem] text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-between px-8"
                                >
                                    <span>Add to Order</span>
                                    <div className="flex items-center gap-2 opacity-90">
                                        <span className="w-1 h-1 bg-current rounded-full" />
                                        <span className="font-mono">{currencySymbol}{selectedItem.price}</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
