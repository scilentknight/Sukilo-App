const ITEMS = [
  {
    eyebrow: "Limited time",
    title: "Fresh arrivals",
    detail: "New styles added from the latest catalog import.",
    tone: "bg-[#ffe2e9]",
  },
  {
    eyebrow: "Visual discovery",
    title: "See it. Search it.",
    detail: "Upload a photo and find the closest products in seconds.",
    tone: "bg-[#e7e0ff]",
  },
  {
    eyebrow: "Across the store",
    title: "Everything in one place",
    detail: "Fashion, footwear, accessories, watches, and care.",
    tone: "bg-[#fff0d7]",
  },
];

export default function TrustBar() {
  return (
    <section className="mx-auto mt-5 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-3 md:grid-cols-3">
        {ITEMS.map((item) => (
          <div
            key={item.title}
            className={`group rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${item.tone}`}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#e24b6a]">
              {item.eyebrow}
            </p>
            <p className="mt-2 text-lg font-extrabold text-[#2b2422]">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-stone-600">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
