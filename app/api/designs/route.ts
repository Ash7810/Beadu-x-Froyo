import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { placedBeads, customerName, email, phone, wristInches, cordType, address, totalPrice, previewImageUrl } = body;

    if (!placedBeads || !Array.isArray(placedBeads) || placedBeads.length === 0) {
      return NextResponse.json(
        { error: "Strand cannot be empty when placing an order." },
        { status: 400 }
      );
    }

    const orderId = `BDU-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Fast non-blocking Supabase insert with 1.2s timeout guarantee
    let supabaseSaved = false;
    try {
      const dbPromise = (async () => {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.from("bracelets").insert({
          customer_name: customerName || "Valued Customer",
          email: email || "",
          phone: phone || "",
          wrist_inches: wristInches || 7.0,
          cord_type: cordType || "elastic",
          placed_beads: placedBeads,
          total_price: Math.round((totalPrice || 0) * 100),
          address: address || "",
          preview_image_url: previewImageUrl || null,
          status: "confirmed",
        });
        return !error;
      })();

      const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1200));
      supabaseSaved = await Promise.race([dbPromise, timeoutPromise]);
    } catch (sbErr) {
      console.warn("Supabase connection notice:", sbErr);
    }

    const orderData = {
      orderId,
      status: "confirmed",
      customerName: customerName || "Valued Customer",
      email: email || "customer@example.com",
      phone: phone || "",
      wristInches: wristInches || 7.0,
      cordType: cordType || "elastic",
      address: address || "",
      totalPrice: totalPrice || 0,
      itemCount: placedBeads.length,
      placedBeads,
      supabaseSaved,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: orderData,
      message: "Custom design order created successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create design order", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Beadu Atelier Customizer API",
  });
}
