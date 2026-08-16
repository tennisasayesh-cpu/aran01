import { createClient } from "@/lib/supabase/server";

export async function getOrganizationId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("UNAUTHORIZED");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error("PROFILE_NOT_CONFIGURED");
  }

  return profile.organization_id as string;
}

export async function getDashboardData() {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    assetsResult,
    todayBookingsResult,
    inventoryResult,
    restaurantResult,
    latestBookingsResult
  ] = await Promise.all([
    supabase.from("assets").select("id, name, kind, is_active").eq("organization_id", organizationId),
    supabase.from("bookings").select("id, total_amount, status").eq("organization_id", organizationId).gte("start_at", startOfDay.toISOString()),
    supabase.from("inventory_items").select("id, name, current_stock, reorder_point, unit").eq("organization_id", organizationId),
    supabase.from("restaurant_orders").select("id, total_amount, status").eq("organization_id", organizationId).gte("created_at", startOfDay.toISOString()),
    supabase
      .from("bookings")
      .select("id, customer_name, start_at, end_at, status, total_amount, asset:assets(name, kind)")
      .eq("organization_id", organizationId)
      .order("start_at", { ascending: true })
      .limit(8)
  ]);

  const activeAssets = (assetsResult.data ?? []).filter((item) => item.is_active).length;
  const todayBookings = todayBookingsResult.data ?? [];
  const restaurantOrders = restaurantResult.data ?? [];
  const lowStockItems = (inventoryResult.data ?? []).filter(
    (item) => Number(item.current_stock) <= Number(item.reorder_point)
  );

  return {
    activeAssets,
    todayBookings: todayBookings.length,
    bookingRevenue: todayBookings.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0),
    restaurantRevenue: restaurantOrders.reduce((sum, item) => sum + Number(item.total_amount ?? 0), 0),
    restaurantOrders: restaurantOrders.length,
    lowStockItems,
    latestBookings: latestBookingsResult.data ?? []
  };
}

export async function getReservationsData() {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const [assets, bookings] = await Promise.all([
    supabase
      .from("assets")
      .select("id, name, kind, capacity")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("kind")
      .order("name"),
    supabase
      .from("bookings")
      .select("id, customer_name, phone, start_at, end_at, status, total_amount, asset:assets(name, kind)")
      .eq("organization_id", organizationId)
      .order("start_at", { ascending: false })
      .limit(30)
  ]);

  return { assets: assets.data ?? [], bookings: bookings.data ?? [] };
}

export async function getRestaurantData() {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const { data: orders } = await supabase
    .from("restaurant_orders")
    .select("id, order_number, table_name, customer_name, status, total_amount, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(30);

  return { orders: orders ?? [] };
}

export async function getInventoryData() {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, name, unit, current_stock, reorder_point, average_cost")
    .eq("organization_id", organizationId)
    .order("name");

  return { items: items ?? [] };
}

export async function getAssetsData() {
  const supabase = await createClient();
  const organizationId = await getOrganizationId();

  const { data: assets } = await supabase
    .from("assets")
    .select("id, name, kind, capacity, is_active, notes")
    .eq("organization_id", organizationId)
    .order("kind")
    .order("name");

  return { assets: assets ?? [] };
}