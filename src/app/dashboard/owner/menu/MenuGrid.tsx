
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from "lucide-react";
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

export function MenuGrid({ initialItems, restaurantId }: { initialItems: MenuItem[], restaurantId: string }) {
    const [items, setItems] = useState<MenuItem[]>(initialItems);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const initialFormState = { id: "", name: "", description: "", price: "", image_url: "", is_available: true };
    const [formData, setFormData] = useState(initialFormState);
    const [isEditing, setIsEditing] = useState(false);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAdd = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const openEdit = (item: MenuItem) => {
        setFormData({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: item.price.toString(),
            image_url: item.image_url || "",
            is_available: item.is_available
        });
        setIsEditing(true);
        setIsDialogOpen(true);
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
            const payload = {
                restaurant_id: restaurantId,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                image_url: formData.image_url || null,
                is_available: formData.is_available
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
        } catch (error) {
            console.error("Error saving item:", error);
            toast.error("Failed to save item");
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
                            <Input id="price" type="number" className="col-span-3" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
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
                                        <div className="relative group rounded-lg overflow-hidden border border-border w-16 h-16 shrink-0">
                                            <img src={formData.image_url} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 shrink-0 rounded-lg border border-border bg-muted flex items-center justify-center">
                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="cursor-pointer file:cursor-pointer"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">OR</span>
                                            <Input
                                                type="text"
                                                placeholder="Paste image URL..."
                                                value={formData.image_url || ""}
                                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                className="pl-10 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
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
                                        ${item.price.toFixed(2)}
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
