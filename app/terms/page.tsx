"use client";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
export default function TermsPage() {
  const { t } = useLanguage();
  const sections = [
    [t.termsAcceptance, t.termsAcceptanceText],
    [t.termsUse, t.termsUseText],
    [t.termsContent, t.termsContentText],
    [t.termsPrivacy, t.termsPrivacyText],
    [t.termsLimitations, t.termsLimitationsText],
    [t.termsModifications, t.termsModificationsText],
    [t.termsGoverning, t.termsGoverningText],
    [t.termsContactInfo, t.termsContactInfoText],
  ];
  return (
    <article className="document-page">
      <Link className="back-link" href="/">
        {t.backToPhotoBooth}
      </Link>
      <h1>{t.termsOfService}</h1>
      <p className="document-intro">{t.termsIntro}</p>
      <div className="prose">
        {sections.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
        <Link className="back-link" href="/privacy">
          {t.privacyPolicy}
        </Link>
      </div>
    </article>
  );
}
