"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationId } from "@/lib/queries";

async function ensureProfile(userId: string, email?: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("id")
      .order("created_at")
      .limit(1)
      .single();

    if (organization) {
      await supabase.from("profiles").insert({
        id: userId,
        organization_id: organization.id,
        full_name: email?.split("@")[0] ?? "کاربر جدید",
        role: "admin"
      });
    }
  }
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) redirect("/login");

  await ensureProfile(data.user.id, data.user.email);
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createReservation(formData: FormData) {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  await supabase.from("bookings").insert({
    organization_id: organizationId,
    asset_id: String(formData.get("asset_id")),
    customer_name: String(formData.get("customer_name")),
    phone: String(formData.get("phone")),
    start_at: new Date(String(formData.get("start_at"))).toISOString(),
    end_at: new Date(String(formData.get("end_at"))).toISOString(),
    total_amount: Number(formData.get("total_amount") ?? 0),
    status: "confirmed",
    source: "reception"
  });

  revalidatePath("/dashboard");
  revalidatePath("/reservations");
}

export async function createRestaurantOrder(formData: FormData) {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const orderNumber = `B-${Date.now().toString().slice(-6)}`;

  await supabase.from("restaurant_orders").insert({
    organization_id: organizationId,
    order_number: orderNumber,
    table_name: String(formData.get("table_name")),
    customer_name: String(formData.get("customer_name")) || null,
    total_amount: Number(formData.get("total_amount") ?? 0),
    status: "open"
  });

  revalidatePath("/dashboard");
  revalidatePath("/restaurant");
}

export async function recordInventoryMovement(formData: FormData) {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  await supabase.rpc("record_stock_movement", {
    p_organization_id: organizationId,
    p_item_id: String(formData.get("item_id")),
    p_type: String(formData.get("movement_type")),
    p_quantity: Number(formData.get("quantity")),
    p_note: String(formData.get("note") || "")
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}