import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Promote user to admin and set status to approved
    const { error } = await supabase
        .from("profiles")
        .update({
            role: "admin",
            status: "approved"
        })
        .eq("id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        message: `User ${user.email} has been promoted to Admin. Please re-login or refresh your dashboard.`
    });
}
