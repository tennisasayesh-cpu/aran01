import Link from "next/link";
import { getDashboardData } from "@/lib/queries";

const toman = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    { label: "منابع فعال مجموعه", value: data.activeAssets, hint: "زمین، سوئیت، گیم‌روم و فضاهای خدماتی", accent: "blue" },
    { label: "رزروهای امروز", value: data.todayBookings, hint: `${toman(data.bookingRevenue)} درآمد ثبت‌شده`, accent: "orange" },
    { label: "سفارش‌های بیانکو", value: data.restaurantOrders, hint: `${toman(data.restaurantRevenue)} فروش امروز`, accent: "green" },
    { label: "هشدار موجودی", value: data.lowStockItems.length, hint: "اقلام نیازمند سفارش یا بررسی", accent: "red" }
  ];

  return (
    <section className="page-section">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">نمای کلی عملیات</p>
          <h1>مدیریت هوشمند مجموعه آران</h1>
          <p>
            یک نقطهٔ کنترل برای ۱۸ زمین تنیس، ۵ زمین تنیس ساحلی، ۴ زمین پدل،
            اقامت، گیم‌روم، باشگاه بدنسازی و رستوران بیانکو.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" href="/reservations">ثبت رزرو جدید</Link>
          <Link className="button secondary" href="/restaurant">سفارش بیانکو</Link>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((item) => (
          <article className={`stat-card ${item.accent}`} key={item.label}>
            <p>{item.label}</p>
            <strong>{new Intl.NumberFormat("fa-IR").format(item.value)}</strong>
            <span>{item.hint}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">پذیرش و رزرو</p>
              <h3>رزروهای اخیر</h3>
            </div>
            <Link href="/reservations">مشاهده همه</Link>
          </div>

          <div className="data-list">
            {data.latestBookings.length === 0 ? (
              <p className="empty-state">هنوز رزروی ثبت نشده است.</p>
            ) : (
              data.latestBookings.map((booking: any) => (
                <div className="data-row" key={booking.id}>
                  <div className="row-icon">◷</div>
                  <div className="row-content">
                    <strong>{booking.customer_name}</strong>
                    <span>{booking.asset?.name ?? "منبع نامشخص"} · {new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(booking.start_at))}</span>
                  </div>
                  <div className="row-end">
                    <b>{toman(Number(booking.total_amount))}</b>
                    <em className={`badge ${booking.status}`}>{booking.status === "confirmed" ? "تأییدشده" : booking.status}</em>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">انبارهای خشک و تر</p>
              <h3>نیازمند اقدام</h3>
            </div>
            <Link href="/inventory">مدیریت انبار</Link>
          </div>

          <div className="data-list">
            {data.lowStockItems.length === 0 ? (
              <p className="empty-state">موجودی تمام اقلام در سطح مناسب است.</p>
            ) : (
              data.lowStockItems.slice(0, 6).map((item: any) => (
                <div className="data-row" key={item.id}>
                  <div className="row-icon warning">!</div>
                  <div className="row-content">
                    <strong>{item.name}</strong>
                    <span>حد سفارش مجدد: {new Intl.NumberFormat("fa-IR").format(item.reorder_point)} {item.unit}</span>
                  </div>
                  <div className="row-end">
                    <b>{new Intl.NumberFormat("fa-IR").format(item.current_stock)} {item.unit}</b>
                    <em className="badge pending">کم‌موجودی</em>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}