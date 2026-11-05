import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/ops/admin-nav";
import { adminPageSession, openChangeCount } from "@/server/ops-queries";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  // Non-admins get a 404 rather than a 403, so the route does not advertise itself.
  await adminPageSession();
  const openCount = await openChangeCount();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-24 md:px-8 md:pt-32 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <Suspense fallback={<div className="h-12" />}>
          <AdminNav openCount={openCount} />
        </Suspense>
      </aside>
      <div className="min-w-0 pt-8 lg:pt-0">{children}</div>
    </div>
  );
}
