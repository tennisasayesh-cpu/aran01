import { signIn } from "@/app/actions";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand-mark">A</div>
        <p className="eyebrow">ARAN OS</p>
        <h1>سامانه مدیریت یکپارچه آران</h1>
        <p className="muted">
          مدیریت زمین‌ها، اقامت، گیم‌روم، رستوران بیانکو، خرید، انبار و درآمد مجموعه.
        </p>

        <form action={signIn} className="form-stack">
          <label>
            ایمیل سازمانی
            <input name="email" type="email" placeholder="name@aran.ir" required />
          </label>
          <label>
            گذرواژه
            <input name="password" type="password" placeholder="••••••••" required />
          </label>
          <button className="button primary" type="submit">ورود به پنل مدیریت</button>
        </form>

        <p className="login-note">
          حساب‌های کاربری و سطح دسترسی هر همکار از پنل Supabase مدیریت می‌شود.
        </p>
      </section>
    </main>
  );
}
