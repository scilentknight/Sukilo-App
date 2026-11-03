"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/nav";
import { displayName, initials } from "@/lib/format";

/** Collapsible admin navigation. Shows icons only when collapsed. */
export default function AdminSidebar({ collapsed, mobileOpen, onNavigate }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onNavigate}
          className="fixed inset-0 z-30 bg-ink-900/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-200 bg-white transition-[width,transform] duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        } ${collapsed ? "md:w-[76px]" : "md:w-64"}`}
      >
        <div
          className={`flex h-16 shrink-0 items-center gap-3 border-b border-ink-100 ${
            collapsed ? "md:justify-center md:px-2" : "px-5"
          }`}
        >
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 focus-ring"
            title="Sukilo Admin"
          >
            <Image
              src="/sukilo-logo-horizontal.png"
              alt="Sukilo"
              width={616}
              height={260}
              className={`h-9 w-auto shrink-0 ${collapsed ? "md:hidden" : ""}`}
            />
            <Image
              src="/sukilo-mark.png"
              alt="Sukilo"
              width={264}
              height={332}
              className={`hidden h-9 w-auto shrink-0 ${collapsed ? "md:block" : "md:hidden"}`}
            />
          </Link>
        </div>

        <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {ADMIN_NAV.map((group, index) => (
            <div key={group.title ?? `group-${index}`} className="space-y-1">
              {group.title && (
                <p
                  className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400 ${
                    collapsed ? "md:hidden" : ""
                  }`}
                >
                  {group.title}
                </p>
              )}
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className={`border-t border-ink-100 p-3 ${collapsed ? "md:px-2" : ""}`}>
          <SidebarAccount collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ item, collapsed, onNavigate }) {
  const { href, exact, label, icon: Icon } = item;
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        collapsed ? "md:justify-center md:px-2" : ""
      } ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={active ? 2.2 : 1.8}
        className={active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600"}
      />
      <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{label}</span>
    </Link>
  );
}

function SidebarAccount({ collapsed }) {
  const { user, roles } = useAuth();
  const name = displayName(user);
  const role = roles[0] ? roles[0].replaceAll("_", " ").toLowerCase() : "administrator";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg bg-ink-50 px-3 py-2.5 ${
        collapsed ? "md:justify-center md:px-1" : ""
      }`}
      title={collapsed ? name : undefined}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
        {initials(name)}
      </span>
      <span className={`min-w-0 ${collapsed ? "md:hidden" : ""}`}>
        <span className="block truncate text-xs font-semibold text-ink-800">{name}</span>
        <span className="block truncate text-[11px] capitalize text-ink-500">{role}</span>
      </span>
    </div>
  );
}
