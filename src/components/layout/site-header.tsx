"use client";

import { Menu, X } from "@/components/ui/icons";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { AccountButton } from "./account-button";
import { LocaleSwitch } from "./locale-switch";
import { Logo } from "./logo";
import { ThemeSwitch } from "./theme-switch";

const NAV = ["tours", "map", "blog", "forum", "services"] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (state adjusted during render, per React docs).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-b hairline bg-bg/75 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:h-20 md:px-8">
        <Link href="/" className="shrink-0" aria-label="Sao Việt">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Main">
          {NAV.map((key) => {
            const href = `/${key}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors xl:px-4",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-surface ring-1 ring-line"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {t(key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden items-center gap-2 sm:flex">
            <LocaleSwitch />
            <ThemeSwitch />
          </div>
          <AccountButton className="hidden md:inline-flex" />
          <Link href="/tours" className="btn btn-primary hidden !py-2.5 text-sm md:inline-flex">
            {t("book")}
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full ring-1 ring-line lg:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-y-auto border-t hairline bg-bg lg:hidden"
          >
            <nav className="flex flex-col px-5 py-6" aria-label="Mobile">
              {NAV.map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link
                    href={`/${key}`}
                    className="flex items-baseline justify-between border-b hairline py-5"
                  >
                    <span className="display text-4xl">{t(key)}</span>
                    <span className="readout text-xs text-ink-faint">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LocaleSwitch />
                <ThemeSwitch />
                <AccountButton />
              </div>
              <Link href="/tours" className="btn btn-primary mt-6 justify-center">
                {t("book")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
