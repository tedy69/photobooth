"use client";
import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useComposition } from "@/hooks/use-composition";
import { backgrounds, frames } from "@/lib/backgrounds";
import { stickers } from "@/lib/frames";
import {
  normalizeSticker,
  templateGeometry,
  type Composition,
  type StickerPlacement,
} from "@/lib/composition";
export default function Editor({
  composition,
  onChange,
}: {
  composition: Composition;
  onChange: (value: Composition) => void;
}) {
  const { t, copy } = useLanguage();
  const [selectedId, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const updateStickers = useCallback(
    (next: StickerPlacement[]) => onChange({ ...composition, stickers: next }),
    [composition, onChange],
  );
  const [elementRef, containerRef, canvas] = useComposition(
    composition,
    updateStickers,
    selectedId,
    setSelected,
  );
  const selected = composition.stickers.find(
    (sticker) => sticker.id === selectedId,
  );
  const geometry = templateGeometry(composition.template);
  const visibleStickers = useMemo(
    () =>
      stickers.filter((sticker) =>
        `${sticker.name} ${sticker.tags?.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );
  const changeSelected = (
    key: "x" | "y" | "size" | "rotation",
    value: number,
  ) => {
    if (!selected) return;
    updateStickers(
      composition.stickers.map((sticker) =>
        sticker.id === selectedId
          ? normalizeSticker(
              { ...sticker, [key]: value },
              geometry.width,
              geometry.height,
            )
          : sticker,
      ),
    );
  };
  return (
    <div className="edit-workspace">
      <div className="composition-stage" ref={containerRef}>
        <div className="canvas-wrap" aria-busy={canvas.status === "loading"}>
          <canvas ref={elementRef} aria-label={copy.previewTitle} />
        </div>
        {canvas.status === "loading" && (
          <p className="stage-status" role="status">
            {t.processing}
          </p>
        )}
        {canvas.status === "error" && (
          <div className="stage-status" role="alert">
            <p>{copy.exportError}</p>
            <button onClick={canvas.retry}>{copy.retry}</button>
          </div>
        )}
        <p className="print-size">
          {composition.template.size} · {geometry.width} × {geometry.height} px
        </p>
      </div>
      <aside className="editor-tools">
        <p className="tool-help">{copy.editHelp}</p>
        <details open>
          <summary>{copy.backgrounds}</summary>
          <div className="background-options">
            {backgrounds.map((background) => (
              <button
                type="button"
                key={background.id}
                aria-label={background.name}
                title={background.name}
                aria-pressed={composition.backgroundId === background.id}
                style={{ background: background.preview }}
                onClick={() =>
                  onChange({ ...composition, backgroundId: background.id })
                }
              >
                <span className="swatch-label">{background.name}</span>
              </button>
            ))}
          </div>
        </details>
        <details open>
          <summary>{copy.frames}</summary>
          <div className="frame-options">
            {frames.map((frame) => (
              <button
                type="button"
                key={frame.id}
                aria-pressed={composition.frameId === frame.id}
                onClick={() => onChange({ ...composition, frameId: frame.id })}
              >
                {frame.name}
              </button>
            ))}
          </div>
        </details>
        <details open>
          <summary>{t.stickers.replace(":", "")}</summary>
          <label className="search-label">
            <span className="sr-only">{copy.search}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.search}
            />
          </label>
          <div className="sticker-options">
            {visibleStickers.map((sticker) => (
              <button
                type="button"
                key={sticker.id}
                aria-label={sticker.name}
                title={sticker.name}
                onClick={() => {
                  const id = crypto.randomUUID();
                  updateStickers([
                    ...composition.stickers,
                    {
                      id,
                      stickerId: sticker.id,
                      src: sticker.src,
                      name: sticker.name,
                      x: geometry.width / 2,
                      y: geometry.height / 2,
                      size: geometry.width * 0.25,
                      rotation: 0,
                    },
                  ]);
                  setSelected(id);
                }}
              >
                <img src={sticker.src} alt="" />
                <span>{sticker.name}</span>
              </button>
            ))}
          </div>
          {visibleStickers.length === 0 && (
            <p role="status">{copy.search}: 0</p>
          )}
        </details>
        {composition.stickers.length > 0 && (
          <section className="sticker-controls" aria-label={copy.selection}>
            <label>
              {copy.selection}
              <select
                aria-label={copy.selection}
                value={selectedId ?? ""}
                onChange={(event) => setSelected(event.target.value || null)}
              >
                <option value="">{copy.selection}</option>
                {composition.stickers.map((sticker, i) => (
                  <option key={sticker.id} value={sticker.id}>
                    {sticker.name} {i + 1}
                  </option>
                ))}
              </select>
            </label>
            {selected && (
              <>
                {(
                  [
                    ["x", copy.horizontal, geometry.width],
                    ["y", copy.vertical, geometry.height],
                    ["size", copy.size, geometry.width],
                    ["rotation", copy.rotation, 359],
                  ] as const
                ).map(([key, label, max]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="range"
                      min={key === "size" ? 30 : 0}
                      max={max}
                      step={1}
                      value={selected[key]}
                      onChange={(event) =>
                        changeSelected(key, Number(event.target.value))
                      }
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updateStickers(
                      composition.stickers.filter(
                        (sticker) => sticker.id !== selected.id,
                      ),
                    );
                    setSelected(null);
                  }}
                >
                  {copy.remove}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                updateStickers([]);
                setSelected(null);
              }}
            >
              {t.clearStickers}
            </button>
          </section>
        )}
      </aside>
    </div>
  );
}
