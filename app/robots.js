const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/wishlist", "/account", "/admin"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
