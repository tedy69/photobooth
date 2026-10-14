"use client";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
export default function Footer() {
  const { t, copy } = useLanguage();
  return (
    <footer className="site-footer">
      <p>
        {copy.local} <Link href="https://tedyfazrin.com">Tedy Fazrin</Link>
      </p>
      <nav aria-label={t.title}>
        <Link href="/privacy">{t.privacyPolicy}</Link>
        <Link href="/terms">{t.termsOfService}</Link>
        <Link href="/support">{t.supportCenter}</Link>
      </nav>
    </footer>
  );
}
