"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatRole, normalizeLanguage, resolveLanguage, setStoredLanguage, t } from "@/lib/i18n";
import type { AnyTranslationKey, Language } from "@/types/i18n";
import type { User } from "@/types/user";

export function useI18n(user?: Pick<User, "preferred_language"> | null) {
  const preferredLanguage = user?.preferred_language;
  const initialLanguage = preferredLanguage ? normalizeLanguage(preferredLanguage) : "FR";
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const task = window.setTimeout(() => {
      setLanguageState(
        preferredLanguage ? resolveLanguage({ preferred_language: preferredLanguage }) : resolveLanguage()
      );
    }, 0);
    return () => window.clearTimeout(task);
  }, [preferredLanguage]);

  useEffect(() => {
    function onLanguageChange(event: Event) {
      const detail = (event as CustomEvent<Language>).detail;
      setLanguageState(detail);
    }
    function onStorage() {
      setLanguageState(resolveLanguage(user));
    }

    window.addEventListener("gansekou-language-change", onLanguageChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("gansekou-language-change", onLanguageChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  const translate = useCallback((key: AnyTranslationKey) => t(key, language), [language]);

  return useMemo(
    () => ({
      language,
      t: translate,
      setLanguage: setStoredLanguage,
      formatRole: (role?: string | null) => formatRole(role, language),
    }),
    [language, translate]
  );
}
