import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <Link
              href="/"
              className="inline-flex w-fit transition-opacity hover:opacity-90"
            >
              <Image
                src="/sukilo-logo-light.png"
                alt="Sukilo"
                width={429}
                height={389}
                className="h-16 w-auto sm:h-18"
              />
            </Link>
            <p className="mt-3 text-sm text-ink-400 leading-relaxed">
              Your one-stop shop for quality products at great prices.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["All Products", "/products"],
                ["Electronics", "/products?category=Electronics"],
                ["Fashion", "/products?category=Fashion+%26+Apparel"],
                ["Home & Kitchen", "/products?category=Home+%26+Kitchen"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["Sign In", "/auth/login"],
                ["Register", "/auth/register"],
                ["My Account", "/account"],
                ["Sell on Sukilo", "/vendor/apply"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                ["About Us", "#"],
                ["Help Center", "#"],
                ["Privacy Policy", "#"],
                ["Terms of Service", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-500">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-ink-300">Sukilo</span>. All
            rights reserved.
          </p>

          <p className="text-ink-400">
            Your trusted destination for online shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
