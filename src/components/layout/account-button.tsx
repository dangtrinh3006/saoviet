"use client";

import { LogOut, Shield, User } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

export function AccountButton({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { data, isPending } = useSession();

  if (isPending) return <span className={cn("h-10 w-24 animate-pulse rounded-full bg-surface", className)} />;

  if (!data) {
    return (
      <Link href="/sign-in" className={cn("btn btn-ghost !py-2.5 text-sm", className)}>
        <User size={15} /> {t("signIn")}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {data.user.role === "admin" && (
        <Link href="/admin" className="grid size-10 place-items-center rounded-full ring-1 ring-line" title={t("admin")}>
          <Shield size={15} />
        </Link>
      )}
      <Link href="/account" className="btn btn-ghost !py-2.5 text-sm" title={t("account")}>
        <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-ink">
          {data.user.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden max-w-24 truncate xl:inline">{data.user.name}</span>
      </Link>
      <button
        type="button"
        title={t("signOut")}
        aria-label={t("signOut")}
        className="grid size-10 place-items-center rounded-full text-ink-muted hover:text-ink"
        onClick={async () => {
          await signOut();
          router.refresh();
        }}
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}
