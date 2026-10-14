import {
  Canvas,
  FabricImage,
  Rect,
  Pattern,
  Gradient,
  StaticCanvas,
  FabricText,
  type FabricObject,
} from "fabric";
import { backgrounds, frames } from "./backgrounds";
import type { Template } from "@/components/template-selector";
export interface StickerPlacement {
  id: string;
  stickerId: string;
  src: string;
  name: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}
export interface Composition {
  template: Template;
  photos: string[];
  backgroundId: string;
  frameId: string;
  stickers: StickerPlacement[];
}
export interface Slot {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function templateGeometry(template: Template) {
  const width = template.layout === "vertical" ? 600 : 1200;
  const height = Math.round(width / template.aspectRatio);
  const margin = Math.round(width * 0.045);
  const gap = Math.round(width * 0.025);
  const columns = template.layout === "grid" ? 2 : 1;
  const rows = Math.ceil(template.photoCount / columns);
  const footer = Math.round(width * 0.12);
  const slotWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
  const slotHeight = (height - margin * 2 - footer - gap * (rows - 1)) / rows;
  const slots = Array.from({ length: template.photoCount }, (_, i) => ({
    x: margin + (i % columns) * (slotWidth + gap),
    y: margin + Math.floor(i / columns) * (slotHeight + gap),
    width: slotWidth,
    height: slotHeight,
  }));
  return { width, height, margin, footer, slots };
}
export function coverCrop(imageWidth: number, imageHeight: number, slot: Slot) {
  const scale = Math.max(slot.width / imageWidth, slot.height / imageHeight);
  return {
    scale,
    cropX: (imageWidth - slot.width / scale) / 2,
    cropY: (imageHeight - slot.height / scale) / 2,
    width: slot.width / scale,
    height: slot.height / scale,
  };
}
export function normalizeSticker(
  placement: StickerPlacement,
  width: number,
  height: number,
) {
  return {
    ...placement,
    x: Math.max(0, Math.min(width, placement.x)),
    y: Math.max(0, Math.min(height, placement.y)),
    size: Math.max(30, Math.min(width, placement.size)),
    rotation: ((placement.rotation % 360) + 360) % 360,
  };
}
export function loadImage(
  src: string,
  signal?: AbortSignal,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const cleanup = () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      img.src = "";
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      cleanup();
      img.src = "";
      reject(new Error("Image load timeout"));
    }, 10000);
    img.onload = () => {
      cleanup();
      resolve(img);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error("Image could not load"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    img.src = src;
  });
}
function backgroundFill(id: string, width: number, height: number) {
  const background =
    backgrounds.find((item) => item.id === id) ?? backgrounds[0];
  if (background.type === "color") return background.value;
  if (background.type === "gradient") {
    const colors = [
      ...background.value.matchAll(/(#[a-f\d]{6})\s+(\d+)%/gi),
    ].map((match) => ({ color: match[1], offset: Number(match[2]) / 100 }));
    return new Gradient({
      type: "linear",
      coords: { x1: 0, y1: 0, x2: width, y2: height },
      colorStops: colors,
    });
  }
  const pattern = document.createElement("canvas");
  pattern.width = 40;
  pattern.height = 40;
  const ctx = pattern.getContext("2d");
  if (!ctx) throw new Error("Pattern unavailable");
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 40, 40);
  if (id === "polka-dots") {
    ctx.fillStyle = "#fce7f3";
    ctx.beginPath();
    ctx.arc(10, 10, 3, 0, Math.PI * 2);
    ctx.arc(30, 30, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 14;
    for (let i = -40; i <= 80; i += 28) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 40, 40);
      ctx.stroke();
    }
  }
  return new Pattern({ source: pattern, repeat: "repeat" });
}
export type StickerObject = FabricObject & { placementId?: string };
export async function renderComposition(
  canvas: Canvas | StaticCanvas,
  composition: Composition,
  signal?: AbortSignal,
  interactive = false,
) {
  const geometry = templateGeometry(composition.template);
  if (composition.photos.length !== composition.template.photoCount)
    throw new Error("Incomplete composition");
  const [photos, stickerImages] = await Promise.all([
    Promise.all(composition.photos.map((src) => loadImage(src, signal))),
    Promise.all(
      composition.stickers.map((sticker) => loadImage(sticker.src, signal)),
    ),
  ]);
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  canvas.clear();
  canvas.setDimensions({ width: geometry.width, height: geometry.height });
  canvas.backgroundColor = backgroundFill(
    composition.backgroundId,
    geometry.width,
    geometry.height,
  );
  // Frames sit around the photos, never as an opaque overlay hiding them.
  if (composition.frameId !== "none") {
    const frame = frames.find((item) => item.id === composition.frameId);
    if (frame) {
      const image = await loadImage(frame.src, signal);
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const frameObject = new FabricImage(image, {
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      frameObject.scaleX = geometry.width / image.width;
      frameObject.scaleY = geometry.height / image.height;
      canvas.add(frameObject);
    }
  }
  photos.forEach((image, i) => {
    const slot = geometry.slots[i];
    const crop = coverCrop(image.width, image.height, slot);
    const object = new FabricImage(image, {
      originX: "left",
      originY: "top",
      left: slot.x,
      top: slot.y,
      cropX: crop.cropX,
      cropY: crop.cropY,
      width: crop.width,
      height: crop.height,
      scaleX: crop.scale,
      scaleY: crop.scale,
      selectable: false,
      evented: false,
    });
    canvas.add(object);
    if (composition.frameId !== "none")
      canvas.add(
        new Rect({
          originX: "left",
          originY: "top",
          left: slot.x,
          top: slot.y,
          width: slot.width,
          height: slot.height,
          fill: "transparent",
          stroke: composition.frameId === "gold" ? "#b8860b" : "#20231f",
          strokeWidth: 3,
          selectable: false,
          evented: false,
        }),
      );
  });
  canvas.add(
    new FabricText("Photo Booth", {
      left: geometry.width / 2,
      top: geometry.height - geometry.margin - geometry.footer / 2,
      originX: "center",
      originY: "center",
      fontSize: Math.round(geometry.width * 0.04),
      fontFamily: "Georgia",
      fill: "#20231f",
      backgroundColor: "#fffef9",
      selectable: false,
      evented: false,
    }),
  );
  stickerImages.forEach((image, i) => {
    const sticker = normalizeSticker(
      composition.stickers[i],
      geometry.width,
      geometry.height,
    );
    const object = new FabricImage(image, {
      originX: "center",
      originY: "center",
      left: sticker.x,
      top: sticker.y,
      scaleX: sticker.size / image.width,
      scaleY: sticker.size / image.width,
      angle: sticker.rotation,
      selectable: interactive,
      evented: interactive,
      cornerSize: 18,
      touchCornerSize: 30,
      transparentCorners: false,
      cornerColor: "#20231f",
      borderColor: "#20231f",
      lockScalingFlip: true,
    }) as StickerObject;
    object.placementId = sticker.id;
    canvas.add(object);
  });
  canvas.renderAll();
}
export async function exportComposition(
  composition: Composition,
  format: "png" | "jpeg",
  signal?: AbortSignal,
) {
  const element = document.createElement("canvas");
  const canvas = new StaticCanvas(element, { enableRetinaScaling: false });
  try {
    await renderComposition(canvas, composition, signal);
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const data = canvas.toDataURL({ format, quality: 0.95, multiplier: 1 });
    if (!data.startsWith(`data:image/${format}`))
      throw new Error("Export unavailable");
    return data;
  } finally {
    await canvas.dispose();
  }
}
export function downloadImage(data: string, name: string) {
  const link = document.createElement("a");
  link.href = data;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
