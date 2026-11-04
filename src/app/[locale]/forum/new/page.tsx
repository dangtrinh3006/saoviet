import { getTranslations, setRequestLocale } from "next-intl/server";
import { ThreadForm } from "@/components/community/thread-form";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/auth";

export default async function NewThreadPage({ params }: PageProps<"/[locale]/forum/new">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) redirect({ href: "/sign-in?next=/forum/new", locale });
  const t = await getTranslations("forum");

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-28 md:px-8 md:pt-36">
      <p className="readout text-xs text-ink-faint">FORUM · NEW</p>
      <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.2rem)]">{t("newThread")}</h1>
      <div className="mt-10">
        <ThreadForm />
      </div>
    </div>
  );
}
