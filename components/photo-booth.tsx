"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/hooks/use-language";
import { useCamera } from "@/hooks/use-camera";
import { usePhotoGallery } from "@/hooks/use-photo-gallery";
import { templates } from "@/lib/templates";
import {
  delay,
  initialSession,
  samplePhotos,
  sessionReducer,
} from "@/lib/session";
import {
  downloadImage,
  exportComposition,
  type Composition,
} from "@/lib/composition";
import TemplateSelector from "./template-selector";
import StripPreview from "./strip-preview";
import ConfirmDialog from "./confirm-dialog";
function EditorLoading() {
  const { t } = useLanguage();
  return <p role="status">{t.processing}</p>;
}
const Editor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: EditorLoading,
});
export default function PhotoBooth({ demo = false }: { demo?: boolean }) {
  const { t, copy, language } = useLanguage();
  const [videoRef, camera] = useCamera();
  const gallery = usePhotoGallery();
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const [phase, setPhase] = useState<"capture" | "edit" | "gallery">("capture");
  const [mode, setMode] = useState<"camera" | "sample">("camera");
  const [mirror, setMirror] = useState(true);
  const [timer, setTimer] = useState(3);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [message, setMessage] = useState<
    "capture" | "export" | "saved" | "downloaded" | null
  >(null);
  const [composition, setComposition] = useState<Composition | null>(null);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [exporting, setExporting] = useState(false);
  const [dialog, setDialog] = useState<{
    message: string;
    action: () => void;
  } | null>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const work = useRef<AbortController | null>(null);
  const exportWork = useRef<AbortController | null>(null);
  const exportLock = useRef(false);
  const template =
    templates.find((item) => item.id === session.templateId) ?? templates[0];
  const complete =
    session.photos.length === template.photoCount &&
    session.retakeIndex === null;
  const cancelCapture = useCallback(() => {
    work.current?.abort();
    work.current = null;
    setBusy(false);
    setRemaining(null);
    setFlash(false);
  }, []);
  useEffect(() => {
    const leave = () => {
      if (document.hidden) cancelCapture();
    };
    document.addEventListener("visibilitychange", leave);
    return () => {
      document.removeEventListener("visibilitychange", leave);
      cancelCapture();
      exportWork.current?.abort();
    };
  }, [cancelCapture]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (camera.status !== "ready" && mode === "camera") cancelCapture();
    }, 0);
    return () => clearTimeout(timer);
  }, [camera.status, mode, cancelCapture]);
  const reset = (templateId = session.templateId) => {
    cancelCapture();
    camera.stopCamera();
    exportWork.current?.abort();
    exportLock.current = false;
    dispatch({ type: "reset", templateId });
    setComposition(null);
    setPhase("capture");
    setMode("camera");
    setMessage(null);
  };
  const askReset = (templateId?: string) => {
    if (session.photos.length || composition)
      setDialog({
        message: copy.resetConfirm,
        action: () => reset(templateId),
      });
    else reset(templateId);
  };
  const useSamples = () => {
    cancelCapture();
    camera.stopCamera();
    setMode("sample");
    setMessage(null);
  };
  const edit = () => {
    if (!complete) return;
    cancelCapture();
    camera.stopCamera();
    setComposition((previous) =>
      previous
        ? { ...previous, photos: session.photos }
        : {
            template,
            photos: session.photos,
            stickers: [],
            backgroundId: "white",
            frameId: "none",
          },
    );
    setPhase("edit");
    setMessage(null);
  };
  const capture = async (automatic: boolean) => {
    if (
      work.current ||
      complete ||
      (mode === "camera" && camera.status !== "ready")
    )
      return;
    const controller = new AbortController();
    work.current = controller;
    const signal = controller.signal;
    setBusy(true);
    setMessage(null);
    const count =
      session.retakeIndex !== null
        ? 1
        : automatic
          ? template.photoCount - session.photos.length
          : 1;
    try {
      for (let i = 0; i < count; i++) {
        const seconds = i === 0 ? timer : 5;
        for (let second = seconds; second > 0; second--) {
          setRemaining(second);
          await delay(1000, signal);
        }
        setRemaining(null);
        if (signal.aborted) return;
        const photo =
          mode === "sample"
            ? samplePhotos[
                (session.retakeIndex ?? session.photos.length + i) %
                  samplePhotos.length
              ]
            : camera.capturePhoto(mirror);
        if (!photo) {
          setMessage("capture");
          return;
        }
        dispatch({ type: "capture", src: photo, count: template.photoCount });
        setFlash(true);
        await delay(140, signal);
        setFlash(false);
      }
      if (automatic || session.photos.length + count >= template.photoCount)
        camera.stopCamera();
    } catch {
      if (!signal.aborted) setMessage("capture");
    } finally {
      if (work.current === controller) {
        work.current = null;
        setBusy(false);
        setRemaining(null);
        setFlash(false);
      }
    }
  };
  const exportPhoto = async (destination: "download" | "gallery") => {
    if (!composition || exportLock.current) return;
    exportLock.current = true;
    const controller = new AbortController();
    exportWork.current = controller;
    setExporting(true);
    setMessage(null);
    try {
      const src = await exportComposition(
        composition,
        destination === "gallery" ? "png" : format,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (destination === "gallery") {
        if (
          gallery.saveToGallery(src, {
            hasStickers: composition.stickers.length > 0,
            stickerCount: composition.stickers.length,
            sample: mode === "sample",
          })
        )
          setMessage("saved");
      } else {
        downloadImage(
          src,
          `photobooth-${Date.now()}.${format === "jpeg" ? "jpg" : "png"}`,
        );
        setMessage("downloaded");
      }
    } catch {
      if (!controller.signal.aborted) setMessage("export");
    } finally {
      if (exportWork.current === controller) {
        exportLock.current = false;
        setExporting(false);
        exportWork.current = null;
      }
    }
  };
  const openGallery = () => {
    cancelCapture();
    camera.stopCamera();
    setPhase("gallery");
    setMessage(null);
  };
  const retake = (index: number) => {
    cancelCapture();
    camera.stopCamera();
    dispatch({ type: "retake", index });
    setPhase("capture");
    setMessage(null);
  };
  const status =
    mode === "sample"
      ? copy.sampleLabel
      : camera.status === "ready"
        ? copy.ready
        : camera.status === "requesting"
          ? copy.requesting
          : copy.off;
  return (
    <div className="studio-shell">
      <div className="studio-heading">
        <div>
          <h1>
            {phase === "edit"
              ? copy.editTitle
              : phase === "gallery"
                ? t.gallery
                : copy.headline}
          </h1>
          <p>
            {phase === "edit"
              ? copy.editHelp
              : phase === "gallery"
                ? copy.emptyHelp
                : demo
                  ? copy.demoIntro
                  : copy.intro}
          </p>
        </div>
        <div className="session-nav">
          <button
            type="button"
            aria-pressed={phase !== "gallery"}
            onClick={() =>
              setPhase(composition && complete ? "edit" : "capture")
            }
          >
            {copy.studio}
          </button>
          <button
            type="button"
            aria-pressed={phase === "gallery"}
            onClick={openGallery}
          >
            {t.gallery} <span>{gallery.galleryPhotos.length}</span>
          </button>
        </div>
      </div>
      {message && (
        <p
          className={`feedback ${message === "capture" || message === "export" ? "error" : ""}`}
          role={
            message === "capture" || message === "export" ? "alert" : "status"
          }
        >
          {message === "capture"
            ? copy.captureError
            : message === "export"
              ? copy.exportError
              : message === "saved"
                ? t.photoSaved
                : t.downloadStarted}
        </p>
      )}
      {phase === "capture" && (
        <div className="capture-workspace">
          <aside className="layout-panel" aria-labelledby="layout-heading">
            <h2 id="layout-heading">{t.chooseLayout.replace(":", "")}</h2>
            <TemplateSelector
              templates={templates}
              selectedTemplate={template.id}
              onSelectTemplate={askReset}
              disabled={busy}
            />
            <p className="quiet-note">{copy.captureHelp}</p>
          </aside>
          <section className="capture-panel" aria-label={t.camera}>
            <div className="stage-toolbar">
              <span>{status}</span>
              <span>
                {copy.progress}{" "}
                {session.retakeIndex !== null
                  ? session.retakeIndex + 1
                  : Math.min(
                      session.photos.length + 1,
                      template.photoCount,
                    )}{" "}
                / {template.photoCount}
              </span>
            </div>
            <div className={`camera-stage ${flash ? "shutter-flash" : ""}`}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  transform: mirror ? "scaleX(-1)" : undefined,
                  visibility:
                    camera.status === "ready" && mode === "camera"
                      ? "visible"
                      : "hidden",
                }}
              />
              {mode === "sample" && (
                <>
                  <img
                    className="sample-stage-image"
                    src={
                      samplePhotos[
                        (session.retakeIndex ?? session.photos.length) %
                          samplePhotos.length
                      ]
                    }
                    alt={copy.sampleLabel}
                  />
                  <span className="sample-label">{copy.sampleLabel}</span>
                </>
              )}
              {mode === "camera" && camera.status !== "ready" && (
                <div className="camera-empty">
                  {complete && (
                    <img
                      className="captured-backdrop"
                      src={session.photos[session.photos.length - 1]}
                      alt={copy.previewTitle}
                    />
                  )}
                  <div className="camera-empty-content">
                    <img
                      className="camera-mark"
                      src="/logo.svg"
                      width="54"
                      height="54"
                      alt=""
                    />
                    <h2>
                      {camera.status === "requesting"
                        ? copy.requesting
                        : complete
                          ? t.photoComplete
                          : copy.cameraOff}
                    </h2>
                    <p role={camera.error ? "alert" : undefined}>
                      {camera.error
                        ? copy.errors[camera.error]
                        : complete
                          ? copy.captureHelp
                          : copy.cameraOffNote}
                    </p>
                    {camera.status === "requesting" ? (
                      <button type="button" onClick={camera.stopCamera}>
                        {copy.cancel}
                      </button>
                    ) : (
                      !complete && (
                        <button
                          type="button"
                          className="primary"
                          onClick={() => {
                            setMessage(null);
                            void camera.startCamera();
                          }}
                        >
                          {camera.error ? copy.retry : copy.enable}
                        </button>
                      )
                    )}
                    {!complete && camera.status !== "requesting" && (
                      <button
                        type="button"
                        className="stage-secondary"
                        onClick={useSamples}
                      >
                        {copy.sample}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {remaining !== null && (
                <span className="countdown" role="status" aria-live="assertive">
                  {remaining}
                </span>
              )}
            </div>
            <div
              className={`photo-tray ${template.photoCount === 6 ? "six-photos" : ""}`}
              aria-label={copy.previewTitle}
            >
              {Array.from({ length: template.photoCount }, (_, i) => (
                <div
                  key={i}
                  className={`photo-slot ${session.retakeIndex === i ? "retaking" : ""}`}
                >
                  {session.photos[i] ? (
                    <>
                      <img
                        src={session.photos[i]}
                        alt={`${copy.progress} ${i + 1}`}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => retake(i)}
                        aria-label={`${t.retake} ${i + 1}`}
                      >
                        {t.retake} {i + 1}
                      </button>
                    </>
                  ) : (
                    <span>{String(i + 1).padStart(2, "0")}</span>
                  )}
                </div>
              ))}
            </div>
            {!complete && (
              <div className="capture-options">
                <label>
                  {copy.timer}
                  <select
                    aria-label={copy.timer}
                    value={timer}
                    onChange={(event) => setTimer(Number(event.target.value))}
                    disabled={busy}
                  >
                    <option value={0}>{copy.noDelay}</option>
                    <option value={3}>3 s</option>
                    <option value={5}>5 s</option>
                  </select>
                </label>
                {mode === "camera" && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={mirror}
                      onChange={(event) => setMirror(event.target.checked)}
                      disabled={busy}
                    />
                    {copy.mirror}
                  </label>
                )}
              </div>
            )}
            <div className="capture-actions">
              {busy ? (
                <button
                  type="button"
                  className="primary"
                  onClick={cancelCapture}
                >
                  {copy.cancel}
                </button>
              ) : complete ? (
                <button type="button" className="primary" onClick={edit}>
                  {copy.review}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="primary shutter-button"
                    disabled={mode !== "sample" && camera.status !== "ready"}
                    onClick={() => void capture(false)}
                  >
                    <span className="shutter-dot" aria-hidden="true" />
                    {session.retakeIndex !== null ? t.retake : t.takePhoto}
                  </button>
                  {template.photoCount > 1 && session.retakeIndex === null && (
                    <button
                      type="button"
                      disabled={mode !== "sample" && camera.status !== "ready"}
                      onClick={() => void capture(true)}
                    >
                      {copy.auto}
                    </button>
                  )}
                </>
              )}
              {(session.photos.length > 0 || mode === "sample") && (
                <button
                  type="button"
                  onClick={() => askReset()}
                  disabled={busy}
                >
                  {copy.reset}
                </button>
              )}
            </div>
          </section>
          <aside className="strip-panel" aria-labelledby="strip-heading">
            <h2 id="strip-heading">{copy.previewTitle}</h2>
            <p>
              {session.photos.length
                ? `${session.photos.length} / ${template.photoCount} ${t.photos}`
                : copy.previewNote}
            </p>
            <StripPreview
              template={template}
              photos={
                session.photos.length
                  ? session.photos
                  : samplePhotos.slice(0, template.photoCount)
              }
              caption={
                session.photos.length ? copy.previewTitle : copy.sampleLabel
              }
            />
            <p className="quiet-note">
              {template.size}
              <br />
              {copy.local}
            </p>
            {mode !== "sample" &&
              camera.status !== "requesting" &&
              !session.photos.length && (
                <button
                  type="button"
                  className="text-button"
                  onClick={useSamples}
                >
                  {copy.sample}
                </button>
              )}
          </aside>
        </div>
      )}
      {phase === "edit" && composition && (
        <>
          <div className="edit-topline">
            <p>{mode === "sample" ? copy.sampleLabel : copy.local}</p>
            <div className="action-row">
              <button
                type="button"
                onClick={() => {
                  setPhase("capture");
                  setMessage(null);
                }}
              >
                {t.retake}
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={() => askReset()}
              >
                {copy.reset}
              </button>
            </div>
          </div>
          <Editor composition={composition} onChange={setComposition} />
          <div className="export-bar">
            <label>
              {copy.format}
              <select
                aria-label={copy.format}
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as "png" | "jpeg")
                }
                disabled={exporting}
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </label>
            <button
              type="button"
              disabled={exporting || !gallery.loaded || gallery.error}
              onClick={() => void exportPhoto("gallery")}
            >
              {exporting ? t.processing : t.saveToGallery}
            </button>
            <button
              type="button"
              className="primary"
              disabled={exporting}
              onClick={() => void exportPhoto("download")}
            >
              {exporting ? t.processing : t.downloadStrip}
            </button>
          </div>
          {gallery.error && (
            <div className="feedback error" role="alert">
              <p>{copy.galleryError}</p>
              <button onClick={gallery.load}>{copy.storageRetry}</button>
            </div>
          )}
        </>
      )}
      {phase === "gallery" && (
        <section className="gallery-panel" aria-label={t.gallery}>
          {gallery.error && gallery.galleryPhotos.length > 0 && (
            <div className="feedback error" role="alert">
              <p>{copy.galleryError}</p>
              <button onClick={gallery.load}>{copy.storageRetry}</button>
            </div>
          )}
          {!gallery.loaded ? (
            <p role="status">{t.processing}</p>
          ) : gallery.error && gallery.galleryPhotos.length === 0 ? (
            <div className="empty-gallery">
              <p role="alert">{copy.galleryError}</p>
              <button onClick={gallery.load}>{copy.storageRetry}</button>
            </div>
          ) : gallery.galleryPhotos.length === 0 ? (
            <div className="empty-gallery">
              <h2>{t.galleryEmpty}</h2>
              <p>{copy.emptyHelp}</p>
              <button
                className="primary"
                onClick={() => setPhase(composition ? "edit" : "capture")}
              >
                {copy.studio}
              </button>
            </div>
          ) : (
            <div className="gallery-grid">
              {gallery.galleryPhotos.map((photo) => (
                <article key={photo.id}>
                  <button
                    type="button"
                    className="gallery-image"
                    onClick={() => setViewPhoto(photo.src)}
                    aria-label={t.view}
                  >
                    <img src={photo.src} alt={copy.previewTitle} />
                  </button>
                  <p>
                    {new Intl.DateTimeFormat(language, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(photo.timestamp)}
                    {photo.metadata?.sample && (
                      <span> · {copy.sampleLabel}</span>
                    )}
                  </p>
                  <div className="action-row">
                    <button
                      type="button"
                      onClick={() =>
                        downloadImage(photo.src, `${photo.id}.png`)
                      }
                    >
                      {t.download}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDialog({
                          message: copy.deleteConfirm,
                          action: () => gallery.deleteFromGallery(photo.id),
                        })
                      }
                    >
                      {t.delete}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      {dialog && (
        <ConfirmDialog
          message={dialog.message}
          onConfirm={dialog.action}
          onClose={() => setDialog(null)}
        />
      )}
      {viewPhoto && (
        <PhotoDialog src={viewPhoto} onClose={() => setViewPhoto(null)} />
      )}
    </div>
  );
}
function PhotoDialog({ src, onClose }: { src: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { copy } = useLanguage();
  useEffect(() => {
    ref.current?.showModal();
    const dialog = ref.current;
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="photo-dialog"
      aria-label={copy.previewTitle}
      onCancel={onClose}
      onClose={onClose}
    >
      <button type="button" onClick={onClose} autoFocus>
        {copy.close}
      </button>
      <img src={src} alt={copy.previewTitle} />
    </dialog>
  );
}
