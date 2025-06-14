import { createFabricCanvas, createFabricImage, loadImage, StickerData } from './fabric-utils';

export interface CompositeImageOptions {
  baseImageSrc: string;
  stickers: StickerData[];
  canvasWidth?: number;
  canvasHeight?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Creates a composite image with base image and stickers using Fabric.js
 */
export async function createCompositeImage(options: CompositeImageOptions): Promise<string | null> {
  const {
    baseImageSrc,
    stickers,
    canvasWidth = 384,
    canvasHeight = 384,
    format = 'png',
    quality = 1.0,
  } = options;

  try {
    // Create Fabric.js canvas for composite rendering
    const compositeCanvasElement = document.createElement('canvas');
    const compositeCanvas = createFabricCanvas(compositeCanvasElement, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'white',
    });

    // Load and add the base image
    const baseImg = await loadImage(baseImageSrc);
    const fabricBaseImg = createFabricImage(baseImg, {
      left: 0,
      top: 0,
    });

    // Scale image to fit canvas if needed
    const scaleX = compositeCanvas.width / baseImg.width;
    const scaleY = compositeCanvas.height / baseImg.height;
    const scale = Math.min(scaleX, scaleY);

    fabricBaseImg.scale(scale);
    compositeCanvas.add(fabricBaseImg);

    // Add stickers with the same positioning logic
    for (const sticker of stickers) {
      try {
        const stickerImg = await loadImage(sticker.src);
        const fabricSticker = createFabricImage(stickerImg, {
          left: sticker.position.x,
          top: sticker.position.y,
          scaleX: sticker.size / 100,
          scaleY: sticker.size / 100,
          angle: sticker.rotation,
        });

        compositeCanvas.add(fabricSticker);
      } catch {
        // Failed to add sticker to composite
      }
    }

    // Render to data URL
    const dataURL = compositeCanvas.toDataURL({
      format,
      quality,
      multiplier: 1,
    });

    // Clean up
    compositeCanvas.dispose();

    return dataURL;
  } catch {
    return null;
  }
}

/**
 * Downloads an image from a data URL
 */
export function downloadImage(dataUrl: string, filename?: string): void {
  const link = document.createElement('a');
  link.download = filename ?? `photobooth-${new Date().getTime()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Scales sticker positions for different canvas sizes
 */
export function scaleStickers(
  stickers: StickerData[],
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number,
): StickerData[] {
  const scaleX = toWidth / fromWidth;
  const scaleY = toHeight / fromHeight;

  return stickers.map((sticker) => ({
    ...sticker,
    position: {
      x: sticker.position.x * scaleX,
      y: sticker.position.y * scaleY,
    },
  }));
}
