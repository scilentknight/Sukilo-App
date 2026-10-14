import Link from "next/link";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { PLANNED_SECTIONS } from "@/components/admin/nav";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PLANNED_SECTIONS).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  return { title: PLANNED_SECTIONS[section]?.label };
}

/** Placeholder for admin sections whose screens and API are not built yet. */
export default async function PlannedAdminSection({ params }) {
  const { section } = await params;
  const item = PLANNED_SECTIONS[section];
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-white">{item.label}</h1>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
          <Construction className="h-6 w-6" />
        </span>
        <p className="font-semibold text-ink-900 dark:text-white">Not built yet</p>
        <p className="max-w-md text-sm text-ink-500 dark:text-ink-400">{item.description}</p>
        <Link href="/admin" className="focus-ring rounded-lg text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
