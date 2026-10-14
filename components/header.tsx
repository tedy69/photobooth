"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/use-language";
import { getLanguageName, getSupportedLanguages } from "@/lib/i18n";
export default function Header() {
  const { language, setLanguage, copy, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        {copy.skip}
      </a>
      <div className="header-inner">
        <Link className="brand" href="/">
          <img src="/logo.svg" width="36" height="36" alt="" />
          <span>
            Photo Booth<span className="brand-caption">by Tedy Fazrin</span>
          </span>
        </Link>
        <div className="header-controls">
          <nav aria-label={copy.studio}>
            <Link href="/">{copy.studio}</Link>
            <Link href="/demo">Demo</Link>
            <Link href="/support">{t.supportCenter}</Link>
          </nav>
          <label className="language-control">
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              aria-label="Language"
            >
              {getSupportedLanguages().map((code) => (
                <option key={code} value={code}>
                  {getLanguageName(code)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="theme-control"
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={resolvedTheme === "dark" ? copy.light : copy.dark}
          >
            <span aria-hidden="true">
              {resolvedTheme === "dark" ? "☀" : "◐"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
