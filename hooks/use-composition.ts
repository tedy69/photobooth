"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";
import {
  normalizeSticker,
  renderComposition,
  templateGeometry,
  type Composition,
  type StickerObject,
  type StickerPlacement,
} from "@/lib/composition";
export function useComposition(
  composition: Composition,
  onChange: (stickers: StickerPlacement[]) => void,
  selectedId: string | null,
  onSelect: (id: string | null) => void,
) {
  const elementRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const renderingRef = useRef(false);
  const latest = useRef({ composition, onChange, onSelect });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    latest.current = { composition, onChange, onSelect };
  });
  useEffect(() => {
    if (!elementRef.current || !containerRef.current) return;
    const canvas = new Canvas(elementRef.current, {
      preserveObjectStacking: true,
      selection: false,
      enableRetinaScaling: false,
      enablePointerEvents: true,
    });
    canvasRef.current = canvas;
    const changed = ({ target }: { target?: StickerObject }) => {
      if (!target?.placementId) return;
      const { composition: current, onChange: update } = latest.current;
      const geometry = templateGeometry(current.template);
      update(
        current.stickers.map((sticker) =>
          sticker.id === target.placementId
            ? normalizeSticker(
                {
                  ...sticker,
                  x: target.left,
                  y: target.top,
                  rotation: target.angle,
                  size: target.getScaledWidth(),
                },
                geometry.width,
                geometry.height,
              )
            : sticker,
        ),
      );
    };
    const select = () => {
      if (renderingRef.current) return;
      latest.current.onSelect(
        (canvas.getActiveObject() as StickerObject | undefined)?.placementId ??
          null,
      );
    };
    canvas.on("object:modified", changed);
    canvas.on("selection:created", select);
    canvas.on("selection:updated", select);
    canvas.on("selection:cleared", select);
    const resize = () => {
      const geometry = templateGeometry(latest.current.composition.template);
      const available = containerRef.current?.clientWidth ?? 280;
      const width = Math.min(
        available - 32,
        geometry.width,
        (520 * geometry.width) / geometry.height,
      );
      if (width <= 0) return;
      canvas.setDimensions(
        { width, height: (width * geometry.height) / geometry.width },
        { cssOnly: true },
      );
      canvas.calcOffset();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);
    resize();
    return () => {
      observer.disconnect();
      canvas.off();
      canvasRef.current = null;
      void canvas.dispose();
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = new AbortController();
    let active = true;
    setStatus("loading");
    renderingRef.current = true;
    void renderComposition(canvas, composition, controller.signal, true)
      .then(() => {
        if (!active) return;
        const geometry = templateGeometry(composition.template);
        const available = containerRef.current?.clientWidth ?? 280;
        const width = Math.min(
          available - 32,
          geometry.width,
          (520 * geometry.width) / geometry.height,
        );
        canvas.setDimensions(
          { width, height: (width * geometry.height) / geometry.width },
          { cssOnly: true },
        );
        canvas.calcOffset();
        renderingRef.current = false;
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [composition, revision]);
  useEffect(() => {
    if (status !== "ready" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const object = canvas
      .getObjects()
      .find((item) => (item as StickerObject).placementId === selectedId);
    if (object) canvas.setActiveObject(object);
    else canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [selectedId, status]);
  return [
    elementRef,
    containerRef,
    { status, retry: () => setRevision((value) => value + 1) },
  ] as const;
}
