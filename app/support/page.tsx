"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
export default function Support() {
  const { t, copy } = useLanguage();
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const work = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const [availability, setAvailability] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    void fetch("/api/health", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((result) => {
        if (!controller.signal.aborted)
          setAvailability(
            result.supportConfigured === true ? "available" : "unavailable",
          );
      })
      .catch(() => setAvailability("unavailable"))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  useEffect(
    () => () => {
      work.current?.abort();
    },
    [],
  );
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const controller = new AbortController();
    work.current = controller;
    setStatus("sending");
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Not sent");
      setStatus("success");
      form.reset();
    } catch {
      if (work.current === controller) setStatus("error");
    } finally {
      clearTimeout(timeout);
      if (work.current === controller) {
        lock.current = false;
        work.current = null;
      }
    }
  };
  return (
    <div className="document-page">
      <Link className="back-link" href="/">
        {t.backToPhotoBooth}
      </Link>
      <h1>{t.supportCenter}</h1>
      <p className="document-intro">{t.supportDescription}</p>
      <div className="support-grid">
        <form onSubmit={submit}>
          <h2>{t.contactForm}</h2>
          <label htmlFor="name">
            {t.yourName}
            <input
              name="name"
              id="name"
              autoComplete="name"
              required
              maxLength={100}
            />
          </label>
          <label htmlFor="email">
            {t.yourEmail}
            <input
              name="email"
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label htmlFor="subject">
            {t.subject}
            <input name="subject" id="subject" required maxLength={160} />
          </label>
          <label htmlFor="message">
            {t.message}
            <textarea
              name="message"
              id="message"
              required
              maxLength={5000}
              rows={6}
            />
          </label>
          <input type="hidden" name="website" value="" />
          <p className="form-note">{copy.supportNote}</p>
          {availability === "checking" && <p role="status">{t.processing}</p>}
          {availability === "unavailable" && (
            <p className="feedback" role="status">
              {copy.supportUnavailable}
            </p>
          )}
          {status === "success" && (
            <p className="feedback" role="status">
              {t.emailSent}
            </p>
          )}
          {status === "error" && (
            <p className="feedback error" role="alert">
              {t.emailError}
            </p>
          )}
          <button
            className="primary"
            type="submit"
            disabled={status === "sending" || availability !== "available"}
          >
            {status === "sending" ? t.sending : t.send}
          </button>
          <a className="direct-email" href="mailto:gmail@tedyfazrin.com">
            gmail@tedyfazrin.com
          </a>
        </form>
        <div className="support-help">
          <h2>{t.faqTitle}</h2>
          {[
            [copy.enable, copy.cameraOffNote + " " + copy.errors.denied],
            [copy.review, copy.editHelp],
            [t.downloadStrip, copy.exportError],
            [t.saveToGallery, copy.emptyHelp + " " + copy.galleryError],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <Link className="back-link" href="/privacy">
            {t.privacyPolicy}
          </Link>
        </div>
      </div>
    </div>
  );
}
