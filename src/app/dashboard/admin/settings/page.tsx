import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Globe, Shield, Bell, Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
    const supabase = await createClient();

    // RBAC Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@restauplus.com') {
        redirect("/dashboard/owner");
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Global <span className="text-primary">Settings</span>
                    </h1>
                    <p className="text-muted-foreground">Configure platform-wide behavior and security.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="border-white/5 bg-black/40 backdrop-blur-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Globe className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-white">Public Platform Settings</h3>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-base text-white">Allow Public Registration</Label>
                                <p className="text-sm text-muted-foreground">When disabled, only invited users can create accounts.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-base text-white">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">Directs all public traffic to a placeholder page.</p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </Card>

                <Card className="border-white/5 bg-black/40 backdrop-blur-xl p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-white">Security & Access</h3>
                    </div>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-base text-white">Auto-approve New Users</Label>
                                <p className="text-sm text-muted-foreground">Automatically grant access status 'approved' upon registration.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Label className="text-base text-white">Two-Factor Authentication Requirement</Label>
                                <p className="text-sm text-muted-foreground">Force all staff/owners to use 2FA for dashboard access.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </Card>

                <Card className="border-white/5 bg-black/40 backdrop-blur-xl p-8 border-dashed">
                    <div className="flex items-center gap-3 mb-8 opacity-50">
                        <Bell className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-white">Notification Webhooks</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 italic">Configure external services (Zapier, Slack) for platform events.</p>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-muted-foreground">
                        Configure Webhooks
                    </Button>
                </Card>
            </div>
        </div>
    );
}
