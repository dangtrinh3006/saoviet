"use client";

import { useTranslations } from "next-intl";
import { useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { Eye, EyeOff } from "@/components/ui/icons";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { name: string };

/** Password field with a show/hide toggle and a Caps Lock warning; drop-in for `<input type="password">`. */
export function PasswordInput({ className, onKeyUp, ...props }: Props) {
  const t = useTranslations("authx.field");
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const watchCaps = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState("CapsLock"));
    onKeyUp?.(e);
  };

  return (
    <span className="block">
      <span className="relative block">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={`field pr-12 ${className ?? ""}`}
          onKeyUp={watchCaps}
          onBlur={() => setCapsLock(false)}
          // Spellcheck and autocorrect would send a visible password to the OS dictionary.
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hide") : t("show")}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-ink-muted transition-colors hover:text-ink"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {capsLock && (
        <span role="status" className="mt-1.5 block text-xs text-ink-muted">
          {t("capsLock")}
        </span>
      )}
    </span>
  );
}
