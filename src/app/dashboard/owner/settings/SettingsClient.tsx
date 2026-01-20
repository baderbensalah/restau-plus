"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Upload, ExternalLink, Save, Store, Palette, Phone, Globe, Image as ImageIcon, Instagram, Facebook, Link as LinkIcon, TrendingUp, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Pro Uploader Component (x100 Premium) ---

function ProImageUploader({
    label,
    description,
    currentUrl,
    onFileSelect,
    isBanner = false,
    uploading = false
}: {
    label: string;
    description: string;
    currentUrl: string;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isBanner?: boolean;
    uploading?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div
            className={cn(
                "relative group overflow-hidden rounded-2xl transition-all duration-500",
                "bg-zinc-950/80 border border-zinc-900 border-2", // Base
                "hover:border-teal-500/50 hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.15)]", // Hover Glow
                isBanner ? "w-full h-64" : "h-52 w-52 shrink-0"
            )}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Dashed Gradient Border Effect on Hover */}
            <div className={cn(
                "absolute inset-0 rounded-2xl border-2 border-dashed border-teal-500/30 opacity-0 transition-opacity duration-500 pointer-events-none",
                isHovering ? "opacity-100" : ""
            )} />

            <div
                className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center z-10 p-6 text-center"
                onClick={() => inputRef.current?.click()}
            >
                <AnimatePresence mode="wait">
                    {uploading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            <p className="text-sm font-medium text-teal-100 tracking-wide animate-pulse">OPTIMIZING...</p>
                        </motion.div>
                    ) : currentUrl ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full relative group/image"
                        >
                            <img
                                src={currentUrl}
                                alt={label}
                                className={cn(
                                    "w-full h-full transition-transform duration-700 ease-out group-hover/image:scale-105",
                                    isBanner ? "object-cover rounded-xl" : "object-contain p-4 drop-shadow-2xl"
                                )}
                            />
                            {/* Pro Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover/image:opacity-100 transition-all duration-300 flex flex-col items-center justify-center rounded-xl">
                                <span className="bg-teal-500/10 border border-teal-500/50 text-teal-100 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 backdrop-blur-md shadow-xl transform translate-y-4 group-hover/image:translate-y-0 transition-transform">
                                    <Sparkles className="w-3 h-3" /> Replace Asset
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            {/* Fancy Empty State Icon */}
                            <div className={cn(
                                "w-16 h-16 rounded-3xl mb-5 flex items-center justify-center transition-all duration-500 relative overflow-hidden",
                                "bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800",
                                "group-hover:from-zinc-800 group-hover:to-zinc-900 group-hover:border-teal-500/30 group-hover:shadow-[inset_0_0_20px_rgba(20,184,166,0.05)]"
                            )}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.1),transparent_50%)]" />
                                <ImageIcon className={cn(
                                    "w-7 h-7 text-zinc-600 transition-colors duration-300",
                                    "group-hover:text-teal-400 group-hover:drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
                                )} />
                            </div>

                            <h3 className="text-zinc-200 font-semibold text-base mb-2 group-hover:text-white transition-colors">{label}</h3>
                            <p className="text-zinc-500 text-xs max-w-[240px] leading-relaxed group-hover:text-zinc-400 transition-colors">
                                {description}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileSelect}
                />
            </div>

            {/* Top Right 'Badge' for Upload */}
            {!currentUrl && !uploading && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:border-teal-500/50 group-hover:text-teal-400 transition-all shadow-lg">
                        <Upload className="w-3.5 h-3.5" />
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Pro Color Picker ---

function ProColorPicker({
    label,
    value,
    onChange
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="group relative bg-zinc-950/50 rounded-xl p-4 border border-zinc-900 transition-all hover:bg-zinc-900/50 hover:border-zinc-800">
            <div className="flex justify-between items-center mb-3">
                <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">{label}</Label>
                <div className="w-full max-w-[80px] h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-current transition-all" style={{ width: '100%', backgroundColor: value }} />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="relative w-full h-12 rounded-lg ring-1 ring-zinc-800 overflow-hidden cursor-pointer shadow-inner">
                    <input
                        type="color"
                        className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 border-0"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: value }} />
                    <Input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-9 pl-10 font-mono text-sm bg-zinc-950 border-zinc-800 text-white focus-visible:ring-teal-500/50 uppercase"
                    />
                </div>
            </div>
        </div>
    );
}

// --- Pro Currency Picker ---

function ProCurrencyPicker({
    value,
    onChange
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const currencies = [
        { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
        { code: 'QAR', symbol: 'QR', label: 'Qatari Riyal', flag: '🇶🇦' },
        { code: 'MAD', symbol: 'DH', label: 'Moroccan Dirham', flag: '🇲🇦' },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {currencies.map((currency) => (
                <div
                    key={currency.code}
                    onClick={() => onChange(currency.code)}
                    className={cn(
                        "cursor-pointer relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
                        value === currency.code
                            ? "bg-teal-500/10 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                            : "bg-zinc-950 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900"
                    )}
                >
                    <div className="flex flex-col items-center text-center gap-2">
                        <span className="text-2xl">{currency.flag}</span>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-bold text-lg",
                                value === currency.code ? "text-teal-400" : "text-white"
                            )}>
                                {currency.code}
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">{currency.label}</span>
                        </div>
                    </div>
                    {value === currency.code && (
                        <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export function SettingsClient({ restaurant }: { restaurant: any }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: restaurant?.name || "",
        description: restaurant?.description || "",
        slug: restaurant?.slug || "",
        primary_color: restaurant?.primary_color || "#000000",
        secondary_color: restaurant?.secondary_color || "#ffffff",
        background_color: restaurant?.background_color || "#ffffff",
        foreground_color: restaurant?.foreground_color || "#09090b",
        logo_url: restaurant?.logo_url || "",
        banner_url: restaurant?.banner_url || "",
        phone: restaurant?.phone || "",
        email_public: restaurant?.email_public || "",
        address: restaurant?.address || "",
        instagram_url: restaurant?.instagram_url || "",
        facebook_url: restaurant?.facebook_url || "",
        website_url: restaurant?.website_url || "",
        seo_title: restaurant?.seo_title || "",
        seo_description: restaurant?.seo_description || "",
        brand_story: restaurant?.brand_story || "",
        currency: restaurant?.currency || "USD",
    });

    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);

        const cleanSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        const { error } = await supabase
            .from('restaurants')
            .update({
                name: formData.name,
                description: formData.description,
                slug: cleanSlug,
                primary_color: formData.primary_color,
                secondary_color: formData.secondary_color,
                background_color: formData.background_color,
                foreground_color: formData.foreground_color,
                logo_url: formData.logo_url,
                banner_url: formData.banner_url,
                phone: formData.phone,
                email_public: formData.email_public,
                address: formData.address,
                instagram_url: formData.instagram_url,
                facebook_url: formData.facebook_url,
                website_url: formData.website_url,
                seo_title: formData.seo_title,
                seo_description: formData.seo_description,
                brand_story: formData.brand_story,
                currency: formData.currency,
            })
            .eq('id', restaurant.id);

        if (error) {
            console.error("Update failed:", error);
            const errorMessage = error.message || error.details || "Check your permissions or database connection.";
            toast.error(`Update failed: ${errorMessage}`);
        } else {
            toast.success("Settings saved successfully");
            if (cleanSlug !== formData.slug) {
                setFormData(prev => ({ ...prev, slug: cleanSlug }));
            }
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (field === 'logo_url') setUploadingLogo(true);
        else setUploadingBanner(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurant.id}/${field}-${Date.now()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('restaurant-assets')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('restaurant-assets')
                .getPublicUrl(fileName);

            // Artificial delay to show off the fancy animation a bit (it's too fast otherwise)
            await new Promise(r => setTimeout(r, 800));

            setFormData(prev => ({ ...prev, [field]: publicUrl }));
            toast.success("Image updated successfully");
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error("Error uploading image");
        } finally {
            if (field === 'logo_url') setUploadingLogo(false);
            else setUploadingBanner(false);
        }
    };

    const restaurantUrl = typeof window !== 'undefined' ? `${window.location.origin}/restaurant/${formData.slug}` : '';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                    <p className="text-zinc-400">Manage your restaurant profile, appearance, and connectivity.</p>
                </div>
                <Button
                    onClick={handleUpdate}
                    disabled={loading}
                    size="lg"
                    className="min-w-[140px] bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 font-medium rounded-xl border-none transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px] h-14 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-all">
                        <Store className="h-4 w-4 mr-2" /> General
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-all">
                        <Palette className="h-4 w-4 mr-2" /> Branding
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-all">
                        <Phone className="h-4 w-4 mr-2" /> Contact
                    </TabsTrigger>
                    <TabsTrigger value="marketing" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-all">
                        <TrendingUp className="h-4 w-4 mr-2" /> Marketing
                    </TabsTrigger>
                    <TabsTrigger value="qrcode" className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-all">
                        <Globe className="h-4 w-4 mr-2" /> QR Code
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <TabsContent value="general">
                            <Card className="border-none bg-zinc-900 shadow-lg rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">Restaurant Profile</CardTitle>
                                    <CardDescription className="text-zinc-400">This information is visible on your home page.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">Restaurant Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="e.g. The Gourmet Kitchen"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="Brief tagline or description"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">Restaurant ID (Slug)</Label>
                                        <Input
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="h-11 font-mono bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="e.g. my-restaurant-name"
                                        />
                                        <p className="text-xs text-zinc-500">
                                            This defines your unique website link. Use lowercase letters, numbers, and dashes only.
                                        </p>
                                    </div>

                                    <div className="grid gap-2 pt-4">
                                        <Label className="text-zinc-300">Currency Settings</Label>
                                        <ProCurrencyPicker
                                            value={formData.currency}
                                            onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                                        />
                                        <p className="text-xs text-zinc-500">
                                            Select the currency for your menu prices and reports.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="branding">
                            <div className="grid gap-6">
                                {/* Pro Colors Section */}
                                <Card className="border-none bg-zinc-900 shadow-lg rounded-xl overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-transparent opacity-50" />
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                            <Palette className="w-5 h-5 text-teal-500" />
                                            Brand Colors
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">Customize the look and feel of your digital menu.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-8">
                                        <ProColorPicker
                                            label="Primary Action Color"
                                            value={formData.primary_color}
                                            onChange={(val) => setFormData(prev => ({ ...prev, primary_color: val }))}
                                        />
                                        <ProColorPicker
                                            label="Secondary Accent"
                                            value={formData.secondary_color}
                                            onChange={(val) => setFormData(prev => ({ ...prev, secondary_color: val }))}
                                        />
                                        <ProColorPicker
                                            label="Page Background"
                                            value={formData.background_color || '#ffffff'}
                                            onChange={(val) => setFormData(prev => ({ ...prev, background_color: val }))}
                                        />
                                        <ProColorPicker
                                            label="Text Color"
                                            value={formData.foreground_color || '#09090b'}
                                            onChange={(val) => setFormData(prev => ({ ...prev, foreground_color: val }))}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Pro Assets Section */}
                                <Card className="border-none bg-zinc-900 shadow-lg rounded-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-teal-500 to-transparent opacity-50" />
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-teal-500" />
                                            Visual Assets
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">Upload high-resolution images to showcase your brand.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-10">
                                        {/* Logo Section */}
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <ProImageUploader
                                                label="Brand Logo"
                                                description="Square PNG format recommended (512x512)"
                                                currentUrl={formData.logo_url}
                                                onFileSelect={(e) => handleFileUpload(e, 'logo_url')}
                                                uploading={uploadingLogo}
                                            />
                                            <div className="space-y-4 pt-2">
                                                <div>
                                                    <h4 className="text-white font-semibold mb-1">Your Logo</h4>
                                                    <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
                                                        This will appear on the top navigation bar of your digital menu and on QR codes.
                                                        Use a transparent background for the best look.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-teal-500 font-medium bg-teal-500/10 w-fit px-3 py-1.5 rounded-full">
                                                    <Check className="w-3 h-3" /> Optimized for Dark Mode
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-800" />

                                        {/* Banner Section */}
                                        <div className="space-y-6">
                                            <div className="flex flex-col">
                                                <h4 className="text-white font-semibold mb-1">Hero Banner</h4>
                                                <p className="text-zinc-500 text-sm">Main background image for your landing page. (1920x1080 recommended)</p>
                                            </div>

                                            <ProImageUploader
                                                label="Hero Banner"
                                                description="Drag and drop or click to upload a high-quality cover photo"
                                                currentUrl={formData.banner_url}
                                                onFileSelect={(e) => handleFileUpload(e, 'banner_url')}
                                                isBanner={true}
                                                uploading={uploadingBanner}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact">
                            <Card className="border-none bg-zinc-900 shadow-lg mb-6 rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">Contact Information</CardTitle>
                                    <CardDescription className="text-zinc-400">Help customers find and reach you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Phone Number</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-300">Public Email</Label>
                                            <Input
                                                value={formData.email_public}
                                                onChange={(e) => setFormData({ ...formData, email_public: e.target.value })}
                                                placeholder="contact@restaurant.com"
                                                className="h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Physical Address</Label>
                                        <Textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="123 Food Street, City, Country"
                                            className="resize-none h-24 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none bg-zinc-900 shadow-lg rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">Social Media</CardTitle>
                                    <CardDescription className="text-zinc-400">Link your social profiles to your digital menu.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Instagram URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-zinc-500">
                                                <Instagram className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.instagram_url}
                                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                                placeholder="https://instagram.com/..."
                                                className="h-11 pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Facebook URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-zinc-500">
                                                <Facebook className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.facebook_url}
                                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                                placeholder="https://facebook.com/..."
                                                className="h-11 pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Website URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-zinc-500">
                                                <LinkIcon className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.website_url}
                                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                                placeholder="https://..."
                                                className="h-11 pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="marketing">
                            <Card className="border-none bg-zinc-900 shadow-lg rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">Marketing & SEO</CardTitle>
                                    <CardDescription className="text-zinc-400">Optimize your restaurant's presence on search engines and share your story.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">SEO Meta Title</Label>
                                        <Input
                                            value={formData.seo_title}
                                            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                            className="h-11 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="e.g. Best Italian Pizza in Town | The Gourmet Kitchen"
                                        />
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold px-1">Appears in Google search and browser tabs.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">SEO Meta Description</Label>
                                        <Textarea
                                            value={formData.seo_description}
                                            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                            className="min-h-[100px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="Describe your restaurant for search engines..."
                                        />
                                    </div>
                                    <Separator className="bg-zinc-800" />
                                    <div className="grid gap-2">
                                        <Label className="text-zinc-300">Brand Story (Why Us?)</Label>
                                        <Textarea
                                            value={formData.brand_story}
                                            onChange={(e) => setFormData({ ...formData, brand_story: e.target.value })}
                                            className="min-h-[150px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-teal-500 focus-visible:border-teal-500"
                                            placeholder="Tell your customers about your history, philosophy, or secret recipes..."
                                        />
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold px-1">This will be showcased on your public landing page.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="qrcode">
                            <Card className="border-none bg-zinc-900 shadow-lg rounded-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-white">Table QR Code</CardTitle>
                                    <CardDescription className="text-zinc-400">Print this for your customers to scan and order.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-8 py-8">
                                    <div className="bg-white p-6 rounded-2xl border-4 border-white/50 shadow-xl transform transition-transform hover:scale-105">
                                        <QRCodeSVG
                                            value={restaurantUrl}
                                            size={256}
                                            level="H"
                                            includeMargin={true}
                                            imageSettings={formData.logo_url ? {
                                                src: formData.logo_url,
                                                x: undefined,
                                                y: undefined,
                                                height: 48,
                                                width: 48,
                                                excavate: true,
                                            } : undefined}
                                        />
                                        <p className="text-center font-bold mt-4 text-black text-lg max-w-[200px] truncate mx-auto">{formData.name}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => window.print()} className="shadow-sm border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                            <ExternalLink className="mr-2 h-4 w-4" /> Print PDF
                                        </Button>
                                        <Button onClick={() => window.location.href = restaurantUrl} className="shadow-lg shadow-teal-500/20 bg-teal-500 hover:bg-teal-600 text-white border-none">
                                            View Live Site
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </motion.div>
                </div>
            </Tabs >
        </div >
    );
}
