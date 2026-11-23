import { TRUST_ITEMS } from "./home.constants";

export default function TrustSection() {
  return (
    <section className="border-t border-ink-100 bg-ink-50">
      <div className="container-page grid grid-cols-2 gap-8 py-10 sm:grid-cols-4 sm:py-14">
        {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
              <Icon size={22} strokeWidth={1.7} />
            </span>

            <div>
              <h3 className="text-sm font-bold text-ink-900">{title}</h3>

              <p className="mt-1 text-xs text-ink-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
