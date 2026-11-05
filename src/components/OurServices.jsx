import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────
// Edit this list. `image` is a path inside /public (e.g. /services/sell-phone.png).
// If `image` is missing, a neutral placeholder icon is shown instead.
// ─────────────────────────────────────────────────────────────
const SERVICES = [
  { name: "Sell Phone", href: "/sell-phone", image: "/services/sell-phone.png" },
  { name: "Buy Gadgets", href: "/gadgets", image: "/services/buy-gadgets.png" },
  { name: "Buy Phone", href: "/phones", image: "/services/buy-phone.png" },
  { name: "Buy Laptops", href: "/laptops", image: "/services/buy-laptops.png" },
  { name: "Rent PS5", href: "/rent-ps5", image: "/services/rent-ps5.png" },
  { name: "Buy Cameras & Lenses", href: "/cameras", image: "/services/cameras.png" },
  { name: "Pixel Upgrade", href: "/pixel-upgrade", image: "/services/pixel-upgrade.png" },
  { name: "Buy Gaming Consoles", href: "/consoles", image: "/services/consoles.png" },
  { name: "Repair Phone", href: "/repair-phone", image: "/services/repair-phone.png" },
  { name: "Repair Laptop", href: "/repair-laptop", image: "/services/repair-laptop.png" },
  { name: "Find New Phone", href: "/new-phones", image: "/services/find-new-phone.png" },
  { name: "Nearby Stores", href: "/stores", image: "/services/stores.png" },
  { name: "New Accessories", href: "/accessories", image: "/services/accessories.png" },
  { name: "Buy Smartwatches", href: "/smartwatches", image: "/services/smartwatches.png" },
  { name: "Recycle", href: "/recycle", image: "/services/recycle.png" },
  { name: "Buy Tablets", href: "/tablets", image: "/services/tablets.png" },
  { name: "Sell Your Car", href: "/sell-car", image: "/services/sell-car.png" },
];

function Placeholder() {
  return (
    <svg
      className="h-12 w-12 text-[#41c9b4]/60"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 18v3" />
    </svg>
  );
}

export default function OurServices({ services = SERVICES }) {
  return (
    <section className="font-sans text-[#222]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 lg:px-6 lg:py-10">
        <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-[40px] md:leading-tight">
          Our Services
        </h2>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {services.map((s) => (
            <li key={s.name}>
              <Link href={s.href} className="group block">
                {/* Tile */}
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-[#eaf6f4]">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      sizes="(min-width:1280px) 12vw, (min-width:1024px) 16vw, (min-width:768px) 24vw, 33vw"
                      className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Placeholder />
                    </div>
                  )}
                </div>

                {/* Label */}
                <p className="py-3 text-center text-[15px] font-medium transition-colors group-hover:text-[#33b8a4] md:text-[17px]">
                  {s.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}