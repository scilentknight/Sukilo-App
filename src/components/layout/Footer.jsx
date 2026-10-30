import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-xl font-black text-white tracking-tight">
              sukilo
            </Link>
            <p className="mt-2 text-sm text-ink-400 leading-relaxed">
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
                  <Link href={href} className="hover:text-white transition-colors">
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
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">
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
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} Sukilo. All rights reserved.</p>
          <p>Built with Next.js &amp; FastAPI</p>
        </div>
      </div>
    </footer>
  );
}

