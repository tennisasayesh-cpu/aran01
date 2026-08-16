import { createReservation } from "@/app/actions";
import { getReservationsData } from "@/lib/queries";

const kindMap: Record<string, string> = {
  tennis: "تنیس",
  beach_tennis: "تنیس ساحلی",
  padel: "پدل",
  lodging: "اقامت",
  game: "گیم‌روم",
  gym: "بدنسازی",
  restaurant_table: "فضای پذیرایی",
  other: "سایر"
};

export default async function ReservationsPage() {
  const { assets, bookings } = await getReservationsData();

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="eyebrow">پذیرش یکپارچه</p>
          <h1>رزرو زمین، اقامت و خدمات</h1>
        </div>
        <p>تقویم و ظرفیت هر منبع، در نسخهٔ بعدی به نمای روزانه و هفتگی متصل می‌شود.</p>
      </div>

      <div className="split-layout">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">پذیرش</p>
              <h3>ثبت رزرو جدید</h3>
            </div>
          </div>

          <form action={createReservation} className="form-grid">
            <label className="full">
              منبع قابل رزرو
              <select name="asset_id" required>
                <option value="">انتخاب زمین، سوئیت یا فضا</option>
                {assets.map((asset: any) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} — {kindMap[asset.kind] ?? asset.kind}
                  </option>
                ))}
              </select>
            </label>
            <label>
              نام مشتری
              <input name="customer_name" placeholder="نام و نام خانوادگی" required />
            </label>
            <label>
              شماره همراه
              <input name="phone" inputMode="numeric" placeholder="۰۹۱۲..." required />
            </label>
            <label>
              شروع رزرو
              <input name="start_at" type="datetime-local" required />
            </label>
            <label>
              پایان رزرو
              <input name="end_at" type="datetime-local" required />
            </label>
            <label className="full">
              مبلغ کل (تومان)
              <input name="total_amount" type="number" min="0" placeholder="۰" required />
            </label>
            <button className="button primary full" type="submit">ثبت و تأیید رزرو</button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">۳۰ رکورد آخر</p>
              <h3>فهرست رزروها</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>مشتری</th>
                  <th>منبع</th>
                  <th>زمان شروع</th>
                  <th>وضعیت</th>
                  <th>مبلغ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.customer_name}</strong><small>{booking.phone}</small></td>
                    <td>{booking.asset?.name ?? "—"}</td>
                    <td>{new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(new Date(booking.start_at))}</td>
                    <td><span className={`badge ${booking.status}`}>{booking.status === "confirmed" ? "تأییدشده" : booking.status}</span></td>
                    <td>{new Intl.NumberFormat("fa-IR").format(Number(booking.total_amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}