import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/dashboard", label: "داشبورد مدیریتی", icon: "◈" },
  { href: "/reservations", label: "رزرو و پذیرش", icon: "◷" },
  { href: "/restaurant", label: "رستوران بیانکو", icon: "♨" },
  { href: "/inventory", label: "انبار و خرید", icon: "▣" },
  { href: "/settings", label: "منابع و تنظیمات", icon: "⚙" }
];

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">A</div>
          <div>
            <strong>ARAN OS</strong>
            <span>Enterprise Platform</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-title">عملیات مجموعه</p>
          {navigation.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{user.email?.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{user.email?.split("@")[0]}</strong>
              <span>کاربر سازمانی</span>
            </div>
          </div>
          <form action={signOut}>
            <button className="logout" type="submit">خروج از سامانه</button>
          </form>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">مجموعه ورزشی، اقامتی و تفریحی</p>
            <h2>مجموعه آران</h2>
          </div>
          <div className="topbar-actions">
            <span className="status-dot">سامانه فعال</span>
            <span className="date-label">
              {new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(new Date())}
            </span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}