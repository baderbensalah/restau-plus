
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Upload, ExternalLink, Save, Store, Palette, Phone, Globe, Image as ImageIcon, Instagram, Facebook, Link as LinkIcon, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export function SettingsClient({ restaurant }: { restaurant: any }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: restaurant?.name || "",
        description: restaurant?.description || "",
        slug: restaurant?.slug || "",
        primary_color: restaurant?.primary_color || "#000000",
        secondary_color: restaurant?.secondary_color || "#ffffff",
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
    });

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

        const loadingToast = toast.loading("Uploading image...");

        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurant.id}/${field}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('restaurant-assets')
            .upload(fileName, file);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            toast.error("Error uploading image");
            toast.dismiss(loadingToast);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('restaurant-assets')
            .getPublicUrl(fileName);

        setFormData(prev => ({ ...prev, [field]: publicUrl }));
        toast.dismiss(loadingToast);
        toast.success("Image uploaded!");
    };

    const restaurantUrl = typeof window !== 'undefined' ? `${window.location.origin}/restaurant/${formData.slug}` : '';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight glow-text text-primary">Settings</h2>
                    <p className="text-muted-foreground">Manage your restaurant profile, appearance, and connectivity.</p>
                </div>
                <Button onClick={handleUpdate} disabled={loading} size="lg" className="min-w-[140px] shadow-lg shadow-primary/25">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px] h-14 p-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
                    <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Store className="h-4 w-4 mr-2" /> General
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Palette className="h-4 w-4 mr-2" /> Branding
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Phone className="h-4 w-4 mr-2" /> Contact
                    </TabsTrigger>
                    <TabsTrigger value="marketing" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <TrendingUp className="h-4 w-4 mr-2" /> Marketing
                    </TabsTrigger>
                    <TabsTrigger value="qrcode" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Globe className="h-4 w-4 mr-2" /> QR Code
                    </TabsTrigger>
                </TabsList>

                <div className="mt-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <TabsContent value="general">
                            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                <CardHeader>
                                    <CardTitle>Restaurant Profile</CardTitle>
                                    <CardDescription>This information is visible on your home page.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label>Restaurant Name</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-11 bg-background/50"
                                            placeholder="e.g. The Gourmet Kitchen"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="h-11 bg-background/50"
                                            placeholder="Brief tagline or description"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Restaurant ID (Slug)</Label>
                                        <Input
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="h-11 font-mono bg-background/50"
                                            placeholder="e.g. my-restaurant-name"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            This defines your unique website link. Use lowercase letters, numbers, and dashes only.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="branding">
                            <div className="grid gap-6">
                                <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Colors</CardTitle>
                                        <CardDescription>Define your brand's visual identity.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label>Primary Color</Label>
                                            <div className="flex gap-3">
                                                <div className="h-11 w-11 rounded-lg border shadow-sm overflow-hidden shrink-0 relative transition-transform hover:scale-105">
                                                    <input
                                                        type="color"
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                                        value={formData.primary_color}
                                                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                                    />
                                                </div>
                                                <Input
                                                    value={formData.primary_color}
                                                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                                                    className="uppercase h-11 font-mono bg-background/50"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Used for buttons, highlights, and headers.</p>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Secondary Color</Label>
                                            <div className="flex gap-3">
                                                <div className="h-11 w-11 rounded-lg border shadow-sm overflow-hidden shrink-0 relative transition-transform hover:scale-105">
                                                    <input
                                                        type="color"
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                                        value={formData.secondary_color}
                                                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                                    />
                                                </div>
                                                <Input
                                                    value={formData.secondary_color}
                                                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                                    className="uppercase h-11 font-mono bg-background/50"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Used for backgrounds and accents.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                    <CardHeader>
                                        <CardTitle>Assets</CardTitle>
                                        <CardDescription>Upload high-quality images for the best reservation experience.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="h-32 w-32 shrink-0 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10 overflow-hidden relative group transition-all hover:border-primary/50">
                                                {formData.logo_url ? (
                                                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <p className="text-xs text-white font-medium flex items-center gap-1"><Upload className="w-3 h-3" /> Change</p>
                                                </div>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleFileUpload(e, 'logo_url')}
                                                />
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <Label className="text-base">Logo</Label>
                                                <p className="text-sm text-muted-foreground">Recommended size: 512x512px. Transparent PNG looks best.</p>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="relative">
                                                        <Upload className="h-3.5 w-3.5 mr-2" /> Upload New
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleFileUpload(e, 'logo_url')}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-base">Banner Image</Label>
                                                <Button variant="outline" size="sm" className="relative">
                                                    <Upload className="h-3.5 w-3.5 mr-2" /> Upload New
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={(e) => handleFileUpload(e, 'banner_url')}
                                                    />
                                                </Button>
                                            </div>

                                            <div className="w-full h-48 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10 overflow-hidden relative group transition-all hover:border-primary/50">
                                                {formData.banner_url ? (
                                                    <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                                        <p className="text-sm text-muted-foreground">No banner uploaded</p>
                                                    </div>
                                                )}
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleFileUpload(e, 'banner_url')}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">This will be the main background of your digital menu. High resolution (1920x1080) recommended.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="contact">
                            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm mb-6">
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>Help customers find and reach you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="h-11 bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Public Email</Label>
                                            <Input
                                                value={formData.email_public}
                                                onChange={(e) => setFormData({ ...formData, email_public: e.target.value })}
                                                placeholder="contact@restaurant.com"
                                                className="h-11 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Physical Address</Label>
                                        <Textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="123 Food Street, City, Country"
                                            className="resize-none h-24 bg-background/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                <CardHeader>
                                    <CardTitle>Social Media</CardTitle>
                                    <CardDescription>Link your social profiles to your digital menu.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label>Instagram URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-muted-foreground">
                                                <Instagram className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.instagram_url}
                                                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                                                placeholder="https://instagram.com/..."
                                                className="h-11 pl-10 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Facebook URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-muted-foreground">
                                                <Facebook className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.facebook_url}
                                                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                                                placeholder="https://facebook.com/..."
                                                className="h-11 pl-10 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Website URL</Label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-3 text-muted-foreground">
                                                <LinkIcon className="w-5 h-5" />
                                            </div>
                                            <Input
                                                value={formData.website_url}
                                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                                                placeholder="https://..."
                                                className="h-11 pl-10 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="marketing">
                            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                <CardHeader>
                                    <CardTitle>Marketing & SEO</CardTitle>
                                    <CardDescription>Optimize your restaurant's presence on search engines and share your story.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label>SEO Meta Title</Label>
                                        <Input
                                            value={formData.seo_title}
                                            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                            className="h-11 bg-background/50"
                                            placeholder="e.g. Best Italian Pizza in Town | The Gourmet Kitchen"
                                        />
                                        <p className="text-[10px] text-muted-foreground uppercase font-black px-1">Appears in Google search and browser tabs.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>SEO Meta Description</Label>
                                        <Textarea
                                            value={formData.seo_description}
                                            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                            className="min-h-[100px] bg-background/50"
                                            placeholder="Describe your restaurant for search engines..."
                                        />
                                    </div>
                                    <Separator className="bg-white/5" />
                                    <div className="grid gap-2">
                                        <Label>Brand Story (Why Us?)</Label>
                                        <Textarea
                                            value={formData.brand_story}
                                            onChange={(e) => setFormData({ ...formData, brand_story: e.target.value })}
                                            className="min-h-[150px] bg-background/50"
                                            placeholder="Tell your customers about your history, philosophy, or secret recipes..."
                                        />
                                        <p className="text-[10px] text-muted-foreground uppercase font-black px-1">This will be showcased on your public landing page.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="qrcode">
                            <Card className="border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
                                <CardHeader>
                                    <CardTitle>Table QR Code</CardTitle>
                                    <CardDescription>Print this for your customers to scan and order.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center space-y-8 py-8">
                                    <div className="bg-white p-6 rounded-2xl border-4 border-primary/20 shadow-2xl transform transition-transform hover:scale-105">
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
                                        <Button variant="outline" onClick={() => window.print()} className="shadow-sm">
                                            <ExternalLink className="mr-2 h-4 w-4" /> Print PDF
                                        </Button>
                                        <Button onClick={() => window.location.href = restaurantUrl} className="shadow-lg shadow-primary/25">
                                            View Live Site
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </motion.div>
                </div>
            </Tabs>
        </div>
    );
}
