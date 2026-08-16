import { createRestaurantOrder } from "@/app/actions";
import { getRestaurantData } from "@/lib/queries";

const statusMap: Record<string, string> = {
  open: "باز",
  preparing: "در حال آماده‌سازی",
  served: "سرو شده",
  paid: "تسویه‌شده",
  cancelled: "لغو شده"
};

export default async function RestaurantPage() {
  const { orders } = await getRestaurantData();

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="eyebrow">BIANCO RESTAURANT</p>
          <h1>عملیات رستوران و کافی‌شاپ</h1>
        </div>
        <p>بستر پایه برای خرید، انبار خشک و تر، آماده‌سازی، آشپزخانه‌ها، سالن‌ها و صندوق.</p>
      </div>

      <div className="restaurant-flow">
        <span>خرید</span><i>←</i><span>انبار خشک و تر</span><i>←</i><span>آماده‌سازی</span><i>←</i><span>آشپزخانه‌ها</span><i>←</i><span>سالن و صندوق</span>
      </div>

      <div className="split-layout">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">صندوق</p>
              <h3>ثبت سفارش سریع</h3>
            </div>
          </div>

          <form action={createRestaurantOrder} className="form-grid">
            <label>
              محل سرو
              <select name="table_name" required>
                <option value="سالن پایین">سالن پایین</option>
                <option value="سالن بالا">سالن بالا</option>
                <option value="تراس جلو">تراس جلو</option>
                <option value="تراس پشت">تراس پشت</option>
                <option value="کافی‌شاپ">کافی‌شاپ</option>
                <option value="سفارش بیرون‌بر">بیرون‌بر</option>
              </select>
            </label>
            <label>
              نام مشتری
              <input name="customer_name" placeholder="اختیاری" />
            </label>
            <label className="full">
              مبلغ سفارش (تومان)
              <input name="total_amount" type="number" min="0" placeholder="۰" required />
            </label>
            <button className="button primary full" type="submit">باز کردن سفارش</button>
          </form>

          <div className="kitchen-notes">
            <strong>ایستگاه‌های عملیاتی بیانکو</strong>
            <span>آشپزخانه سنتی</span>
            <span>آشپزخانه فرنگی</span>
            <span>آشپزخانه آسیایی</span>
            <span>کافی‌شاپ</span>
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">۳۰ سفارش اخیر</p>
              <h3>تابلوی سفارش‌ها</h3>
            </div>
          </div>

          <div className="order-grid">
            {orders.length === 0 ? (
              <p className="empty-state">هنوز سفارشی در صندوق ثبت نشده است.</p>
            ) : (
              orders.map((order: any) => (
                <article className="order-card" key={order.id}>
                  <div>
                    <span className={`badge ${order.status}`}>{statusMap[order.status] ?? order.status}</span>
                    <strong>{order.order_number}</strong>
                  </div>
                  <p>{order.table_name}</p>
                  <small>{order.customer_name || "مشتری حضوری"}</small>
                  <b>{new Intl.NumberFormat("fa-IR").format(Number(order.total_amount))} تومان</b>
                </article>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
