
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    category_id?: string;
}

export function MenuGrid({ initialItems, categories, restaurantId, currency }: { initialItems: MenuItem[], categories: any[], restaurantId: string, currency: string }) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [localCategories, setLocalCategories] = useState(categories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const initialFormState = { id: "", name: "", description: "", price: "", image_url: "", is_available: true, category_id: "" };
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);

    // Category Creation
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const getCurrencySymbol = (code: string) => {
        if (code === 'QAR') return 'QR';
        if (code === 'MAD') return 'DH';
        return '$';
    };

    const currencySymbol = getCurrencySymbol(currency);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [selectedCurrency, setSelectedCurrency] = useState(currency);

    const openAdd = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsDialogOpen(true);
        setSelectedCurrency(currency);
        setIsCreatingCategory(false); // Reset
        setNewCategoryName(""); // Reset
    };

    const openEdit = (item: MenuItem) => {
        setFormData({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            image_url: item.image_url || "",
            is_available: item.is_available,
            category_id: item.category_id || ""
        });
        setIsEditing(true);
        setIsDialogOpen(true);
        setSelectedCurrency(currency);
        setIsCreatingCategory(false);
        setNewCategoryName("");
    };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurantId}/menu-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('restaurant-assets')
            .upload(fileName, file);

        if (uploadError) {
            console.error("Upload Error:", uploadError);
            toast.error("Error uploading image");
            setLoading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('restaurant-assets')
            .getPublicUrl(fileName);

        setFormData(prev => ({ ...prev, image_url: publicUrl }));
        setLoading(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Update currency if changed
            if (selectedCurrency !== currency) {
                const { error: currError } = await supabase
                    .from('restaurants')
                    .update({ currency: selectedCurrency })
                    .eq('id', restaurantId);

                if (currError) {
                    console.error("Currency Update Error", currError);
                    toast.error("Failed to update store currency");
                } else {
                    toast.success(`Store currency updated to ${selectedCurrency}`);
                }
            }

            let categoryId = formData.category_id;

            // HANDLE CATEGORY CREATION
            if (isCreatingCategory && newCategoryName.trim()) {
                const { data: newCat, error: catError } = await supabase
                    .from('categories')
                    .insert({
                        restaurant_id: restaurantId,
                        name: newCategoryName.trim(),
                        sort_order: (localCategories.length * 10) // Basic sort logic
                    })
                    .select()
                    .single();

                if (catError) throw catError;

                // Update local state immediately
                setLocalCategories([...localCategories, newCat]);
                categoryId = newCat.id;
                toast.success(`Category '${newCategoryName}' created!`);
            }

            const payload = {
                restaurant_id: restaurantId,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                image_url: formData.image_url || null,
                is_available: formData.is_available,
                category_id: categoryId || null
            };

            if (isEditing) {
                const { data, error } = await supabase.from('menu_items')
                    .update(payload)
                    .eq('id', formData.id)
                    .select().single();
                if (error) throw error;
                setItems(items.map(i => i.id === formData.id ? data : i));
                toast.success("Item updated successfully");
            } else {
                const { data, error } = await supabase.from('menu_items')
                    .insert(payload)
                    .select().single();
                if (error) throw error;
                setItems([data, ...items]);
                toast.success("Item added successfully");
            }

            setIsDialogOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error("Error saving item (Full Details):", error);
            const msg = error?.message || error?.details || "Failed to save item";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            setItems(items.filter(i => i.id !== id));
            toast.success("Item deleted");
            router.refresh();
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Failed to delete item");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight glow-text text-primary">Menu Management</h1>
                    <p className="text-muted-foreground">Manage your culinary offerings.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search menu..."
                            className="pl-9 bg-card/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={openAdd} className="gap-2 shadow-lg shadow-primary/25">
                        <Plus className="h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Item" : "New Creation"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" className="col-span-3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <div className="col-span-3 flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                                        {currencySymbol}
                                    </span>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="pl-8"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <select
                                    className="w-32 h-10 px-3 rounded-md border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="MAD">MAD (DH)</option>
                                    <option value="QAR">QAR (QR)</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Selection with CREATE NEW logic */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Category</Label>
                            <div className="col-span-3 space-y-2">
                                {!isCreatingCategory ? (
                                    <div className="flex gap-2">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.category_id}
                                            onChange={(e) => {
                                                if (e.target.value === 'new') {
                                                    setIsCreatingCategory(true);
                                                    setFormData({ ...formData, category_id: "" });
                                                } else {
                                                    setFormData({ ...formData, category_id: e.target.value });
                                                }
                                            }}
                                        >
                                            <option value="">Select a Category...</option>
                                            {localCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                            <option value="new" className="font-bold text-primary">+ Create New Category</option>
                                        </select>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-2"
                                    >
                                        <Input
                                            placeholder="Enter new category name..."
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            autoFocus
                                            className="bg-primary/10 border-primary/50"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => { setIsCreatingCategory(false); setNewCategoryName(""); }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Info</Label>
                            <Textarea id="desc" className="col-span-3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right mt-2">Image</Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex items-center gap-4">
                                    {formData.image_url ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-border w-16 h-16 shrink-0 shadow-sm">
                                            <img src={formData.image_url} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setFormData({ ...formData, image_url: "" })}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 shrink-0 rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="cursor-pointer file:cursor-pointer text-xs"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">URL</span>
                                            <Input
                                                type="text"
                                                placeholder="https://..."
                                                value={formData.image_url || ""}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="pl-10 font-mono text-xs h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20">
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence>
                    {filteredItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="overflow-hidden group border-muted/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all hover:shadow-xl hover:shadow-primary/5">
                                <div className="relative aspect-video overflow-hidden">
                                    {item.image_url ? (
                                        <div className="w-full h-full relative">
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                                            <ImageIcon className="h-10 w-10 opacity-50" />
                                        </div>
                                    )}
                                    <Badge className="absolute top-2 right-2 backdrop-blur-md bg-black/50 hover:bg-black/70 border-white/10 text-white">
                                        {currencySymbol} {item.price.toFixed(2)}
                                    </Badge>
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-lg font-bold truncate">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 pb-4 flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">{item.description}</p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                    <Button variant="secondary" size="sm" className="flex-1 gap-2" onClick={() => openEdit(item)}>
                                        <Edit2 className="h-3 w-3" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No items found.</p>
                </div>
            )}
        </div>
    );
}
