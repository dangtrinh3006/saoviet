import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { OrderDelete, OrderStatusControl } from "@/components/admin/ops/ops-controls";
import { OrderEditForm } from "@/components/admin/ops/order-edit-form";
import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/l10n";
import { getTourAnyStatus } from "@/server/catalog";
import { adminPageSession, getOrder } from "@/server/ops-queries";

export default async function AdminOrderPage({ params }: PageProps<"/[locale]/admin/orders/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await adminPageSession();
  const order = await getOrder(id);
  if (!order) notFound();
  const [tour, t, format] = await Promise.all([getTourAnyStatus(order.tourSlug), getTranslations("adminops"), getFormatter()]);

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> {t("orders.title")}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="display readout break-words text-[clamp(2rem,5vw,3.5rem)]">{t("orders.detail", { code: order.code })}</h1>
          <p className="mt-2 break-words text-ink-muted">{tour ? pick(tour.title, locale) : order.tourSlug}</p>
          <p className="readout mt-1 text-xs text-ink-faint">
            {t("orders.created")}: {format.dateTime(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusControl orderId={order.id} status={order.status} />
          <OrderDelete orderId={order.id} code={order.code} redirectTo="/admin/orders" />
        </div>
      </div>
      <div className="mt-10 max-w-3xl">
        <OrderEditForm
          id={order.id}
          unitPriceVnd={order.unitPriceVnd}
          initial={{
            departureDate: order.departureDate,
            guests: order.guests,
            contactName: order.contactName,
            contactEmail: order.contactEmail,
            contactPhone: order.contactPhone,
            note: order.note ?? "",
          }}
        />
      </div>
    </div>
  );
}
