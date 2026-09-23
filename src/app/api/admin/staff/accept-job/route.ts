import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { logAudit } from "@/lib/audit-logger";

export async function POST(req: Request) {
  try {
    const { bookingId, techId, mapId, techName } = await req.json();

    if (!bookingId || !techId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update booking
    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({
        assigned_tech_id: techId,
        assigned_at: new Date().toISOString(),
        status: "confirmed" // Ensure it's confirmed if it wasn't
      })
      .eq("id", bookingId)
      .select("*, service:service_id(name), vehicle:vehicle_id(make, model)")
      .single();

    if (updateError) throw updateError;

    // Log audit
    await logAudit({
      action: "UPDATE_BOOKING",
      entityType: "booking",
      entityId: bookingId,
      metadata: {
        type: "job_assignment",
        tech_id: techId,
        tech_map_id: mapId,
        tech_name: techName,
        assigned_at: new Date().toISOString()
      }
    });

    // TODO: Send notification to customer
    // This could be an SMS or Email trigger here

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Accept Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
