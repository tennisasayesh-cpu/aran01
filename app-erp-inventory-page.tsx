import { recordInventoryMovement } from "@/app/actions";
import { getInventoryData } from "@/lib/queries";

export default async function InventoryPage() {
  const { items } = await getInventoryData();

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="eyebrow">PROCUREMENT & INVENTORY</p>
          <h1>انبار، خرید و کنترل موجودی</h1>
        </div>
        <p>ثبت ورود خرید، مصرف آشپزخانه، ضایعات و اصلاح موجودی با قابلیت گزارش‌گیری.</p>
      </div>

      <div className="split-layout">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">گردش کالا</p>
              <h3>ثبت ورود یا خروج</h3>
            </div>
          </div>

          <form action={recordInventoryMovement} className="form-grid">
            <label className="full">
              قلم انبار
              <select name="item_id" required>
                <option value="">انتخاب کالا</option>
                {items.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                ))}
              </select>
            </label>
            <label>
              نوع گردش
              <select name="movement_type" required>
                <option value="in">ورود از خرید / انتقال</option>
                <option value="out">خروج برای مصرف</option>
                <option value="waste">ضایعات</option>
                <option value="adjustment">اصلاح موجودی</option>
              </select>
            </label>
            <label>
              مقدار
              <input name="quantity" type="number" min="0.01" step="0.01" placeholder="۰" required />
            </label>
            <label className="full">
              توضیحات
              <input name="note" placeholder="مثال: خرید روزانه برای آشپزخانه فرنگی" />
            </label>
            <button className="button primary full" type="submit">ثبت گردش انبار</button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">موجودی لحظه‌ای</p>
              <h3>کالاهای ثبت‌شده</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>کالا</th>
                  <th>موجودی</th>
                  <th>نقطه سفارش</th>
                  <th>میانگین قیمت</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const low = Number(item.current_stock) <= Number(item.reorder_point);
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{new Intl.NumberFormat("fa-IR").format(Number(item.current_stock))} {item.unit}</td>
                      <td>{new Intl.NumberFormat("fa-IR").format(Number(item.reorder_point))} {item.unit}</td>
                      <td>{new Intl.NumberFormat("fa-IR").format(Number(item.average_cost))} تومان</td>
                      <td><span className={`badge ${low ? "pending" : "confirmed"}`}>{low ? "نیازمند سفارش" : "مناسب"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}