import { getAssetsData } from "@/lib/queries";

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

export default async function SettingsPage() {
  const { assets } = await getAssetsData();

  const groups = Object.entries(
    assets.reduce((acc: Record<string, any[]>, asset: any) => {
      (acc[asset.kind] ??= []).push(asset);
      return acc;
    }, {})
  );

  return (
    <section className="page-section">
      <div className="page-title">
        <div>
          <p className="eyebrow">MASTER DATA</p>
          <h1>منابع و ساختار مجموعه آران</h1>
        </div>
        <p>این اطلاعات مبنای رزرو، ظرفیت‌سنجی، نرخ‌گذاری، شیفت‌بندی و گزارش‌های مدیریتی هستند.</p>
      </div>

      <div className="asset-summary">
        <article><strong>۱۸</strong><span>زمین تنیس</span></article>
        <article><strong>۵</strong><span>زمین تنیس ساحلی</span></article>
        <article><strong>۴</strong><span>زمین پدل</span></article>
        <article><strong>۲۵</strong><span>واحد اقامتی</span></article>
        <article><strong>۱</strong><span>رستوران بیانکو</span></article>
      </div>

      <div className="resource-groups">
        {groups.map(([kind, group]) => (
          <article className="panel" key={kind}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{new Intl.NumberFormat("fa-IR").format(group.length)} منبع</p>
                <h3>{kindMap[kind] ?? kind}</h3>
              </div>
            </div>
            <div className="chips">
              {group.map((asset: any) => (
                <span className={asset.is_active ? "chip" : "chip disabled"} key={asset.id}>
                  {asset.name}
                  {asset.capacity ? ` · ظرفیت ${new Intl.NumberFormat("fa-IR").format(asset.capacity)}` : ""}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}