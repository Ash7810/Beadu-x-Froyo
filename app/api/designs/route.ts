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

    let nextSeqNum = 1;
    let orderId = "";
    let supabaseSaved = false;

    try {
      const dbPromise = (async () => {
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Get exact total order count for sequential Event Order IDs (BDU-001, BDU-002...)
        const { count } = await supabaseAdmin.from("bracelets").select("id", { count: "exact", head: true });
        if (count && typeof count === "number") {
          nextSeqNum = count + 1;
        }

        const formattedSeqId = `BDU-EVENT-${String(nextSeqNum).padStart(3, "0")}`;

        // 2. Insert design order record
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

        return { saved: !error, seqId: formattedSeqId };
      })();

      const timeoutPromise = new Promise<{ saved: boolean; seqId?: string }>((resolve) =>
        setTimeout(() => resolve({ saved: false }), 800)
      );

      const result = await Promise.race([dbPromise, timeoutPromise]);
      supabaseSaved = result.saved;
      if (result.seqId) {
        orderId = result.seqId;
      } else {
        orderId = `BDU-EVENT-${String(Math.floor(Date.now() % 1000) + 1).padStart(3, "0")}`;
      }
    } catch (sbErr) {
      console.warn("Supabase connection notice:", sbErr);
      orderId = `BDU-EVENT-${String(Math.floor(Date.now() % 1000) + 1).padStart(3, "0")}`;
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
