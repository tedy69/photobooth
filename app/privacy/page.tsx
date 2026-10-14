"use client";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { privacyCopy } from "@/lib/privacy-copy";
export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const headings = [
    t.privacyInfoUse,
    t.privacyDataStorage,
    t.privacyInfoCollection,
    t.privacyThirdParty,
    t.privacyUserRights,
  ];
  return (
    <article className="document-page">
      <Link className="back-link" href="/">
        {t.backToPhotoBooth}
      </Link>
      <h1>{t.privacyPolicy}</h1>
      <p className="document-intro">
        {new Intl.DateTimeFormat(language, {
          dateStyle: "long",
          timeZone: "Asia/Jakarta",
        }).format(new Date("2026-10-14T00:00:00Z"))}
      </p>
      <div className="prose">
        {privacyCopy[language].map((paragraph, i) => (
          <section key={i}>
            <h2>{headings[i]}</h2>
            <p>{paragraph}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
