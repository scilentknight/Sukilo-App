"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { displayName, initials } from "@/lib/format";

const MENU_ITEMS = [
  { label: "Profile", href: "/admin/settings#profile", icon: UserRound },
  { label: "Notifications", href: "/admin/settings#notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/** Top bar with collapse control, page title, and the profile menu. */
export default function AdminHeader({ title, collapsed, onToggleCollapse, onOpenMobile }) {
  const { user, roles, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef(null);

  const name = displayName(user);
  const avatar = user?.avatar_url || user?.avatar || user?.profile_image || null;
  const roleLabel = roles[0]
    ? roles[0].replaceAll("_", " ").toLowerCase()
    : "administrator";

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/auth/login");
    } finally {
      setSigningOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100 md:hidden"
      >
        <Menu size={20} />
      </button>

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800 md:grid"
      >
        {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
          Admin panel
        </p>
        <h1 className="truncate text-base font-semibold text-ink-900">{title}</h1>
      </div>

      <Link
        href="/"
        className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-800 sm:flex"
      >
        <ExternalLink size={14} />
        View store
      </Link>

      <Link
        href="/admin/applications"
        aria-label="Pending notifications"
        className="relative grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800"
      >
        <Bell size={18} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-600" />
      </Link>

      <span className="hidden h-7 w-px bg-ink-200 sm:block" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-ink-100"
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {initials(name)}
            </span>
          )}
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-[140px] truncate text-xs font-semibold text-ink-800">
              {name}
            </span>
            <span className="block text-[11px] capitalize text-ink-500">{roleLabel}</span>
          </span>
          <ChevronDown
            size={16}
            className={`text-ink-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg shadow-ink-900/5"
          >
            <div className="border-b border-ink-100 px-4 py-2.5">
              <p className="truncate text-sm font-semibold text-ink-800">{name}</p>
              <p className="truncate text-xs text-ink-500">
                {user?.email_masked || "Signed in"}
              </p>
            </div>
            {MENU_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              >
                <Icon size={16} className="text-ink-400" />
                {label}
              </Link>
            ))}
            <div className="my-1 h-px bg-ink-100" />
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
            >
              <LogOut size={16} />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
