import { Canvas, FabricText } from 'fabric';
import { createFabricCanvas, createFabricImage, createFabricRect, loadImage } from './fabric-utils';

export interface Template {
  id: string;
  name: string;
  size: string;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  photoCount: number;
  layout: 'vertical' | 'grid' | 'single';
  hasBorders: boolean;
  flattened: boolean;
}

export interface PhotoStripOptions {
  template: Template;
  photos: string[];
  stickers?: Array<{
    id: string;
    src: string;
    position: { x: number; y: number };
    size: number;
    rotation: number;
  }>;
  borderWidth?: number;
  spacing?: number;
}

export interface ImagePosition {
  left: number;
  top: number;
}

/**
 * Calculates canvas dimensions based on template and image sizes
 */
export function calculateCanvasDimensions(
  template: Template,
  singleWidth: number,
  singleHeight: number,
  borderWidth = 4,
  spacing = 10,
): { width: number; height: number } {
  switch (template.id) {
    case '4x1':
      return {
        width: singleWidth + borderWidth * 2,
        height: singleHeight * 4 + spacing * 3 + borderWidth * 2,
      };
    case '3x1':
      return {
        width: singleWidth + borderWidth * 2,
        height: singleHeight * 3 + spacing * 2 + borderWidth * 2,
      };
    case '2x3':
      return {
        width: singleWidth * 2 + spacing + borderWidth * 2,
        height: singleHeight * 3 + spacing * 2 + borderWidth * 2,
      };
    case '2x2':
      return {
        width: singleWidth * 2 + spacing + borderWidth * 2,
        height: singleHeight * 2 + spacing + borderWidth * 2,
      };
    case '3x3':
      return {
        width: singleWidth * 2 + spacing + borderWidth * 2,
        height: singleHeight * 2 + spacing + borderWidth * 2,
      };
    case '1x1':
      return {
        width: singleWidth + borderWidth * 2,
        height: singleHeight + borderWidth * 2,
      };
    default:
      return {
        width: singleWidth + borderWidth * 2,
        height:
          singleHeight * template.photoCount +
          spacing * (template.photoCount - 1) +
          borderWidth * 2,
      };
  }
}

/**
 * Calculates image positions based on template layout
 */
export function calculateImagePositions(
  template: Template,
  singleWidth: number,
  singleHeight: number,
  canvasWidth: number,
  borderWidth = 4,
  spacing = 10,
): ImagePosition[] {
  const positions: ImagePosition[] = [];

  switch (template.id) {
    case '4x1':
      for (let i = 0; i < 4; i++) {
        positions.push({
          left: borderWidth,
          top: borderWidth + i * (singleHeight + spacing),
        });
      }
      break;
    case '3x1':
      for (let i = 0; i < 3; i++) {
        positions.push({
          left: borderWidth,
          top: borderWidth + i * (singleHeight + spacing),
        });
      }
      break;
    case '2x3':
      // 2x3 grid: 2 columns, 3 rows (6 photos total)
      positions.push(
        // First row
        { left: borderWidth, top: borderWidth },
        { left: borderWidth + singleWidth + spacing, top: borderWidth },
        // Second row
        { left: borderWidth, top: borderWidth + singleHeight + spacing },
        { left: borderWidth + singleWidth + spacing, top: borderWidth + singleHeight + spacing },
        // Third row
        { left: borderWidth, top: borderWidth + 2 * (singleHeight + spacing) },
        { left: borderWidth + singleWidth + spacing, top: borderWidth + 2 * (singleHeight + spacing) },
      );
      break;
    case '2x2':
      positions.push(
        { left: borderWidth, top: borderWidth },
        { left: borderWidth + singleWidth + spacing, top: borderWidth },
        { left: borderWidth, top: borderWidth + singleHeight + spacing },
        { left: borderWidth + singleWidth + spacing, top: borderWidth + singleHeight + spacing },
      );
      break;
    case '3x3':
      positions.push(
        { left: (canvasWidth - singleWidth) / 2, top: borderWidth },
        { left: borderWidth, top: borderWidth + singleHeight + spacing },
        { left: borderWidth + singleWidth + spacing, top: borderWidth + singleHeight + spacing },
      );
      break;
    case '1x1':
      positions.push({ left: borderWidth, top: borderWidth });
      break;
    default:
      for (let i = 0; i < template.photoCount; i++) {
        positions.push({
          left: borderWidth,
          top: borderWidth + i * (singleHeight + spacing),
        });
      }
  }

  return positions;
}

/**
 * Loads all images and handles failures gracefully
 */
export async function loadImages(imageSources: string[]): Promise<HTMLImageElement[]> {
  const imagePromises = imageSources.map((src) => loadImage(src));
  const results = await Promise.allSettled(imagePromises);

  const images = results
    .filter(
      (result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled',
    )
    .map((result) => result.value);

  // Fill missing images if necessary
  while (images.length < imageSources.length && images.length > 0) {
    images.push(images[images.length - 1]);
  }

  return images;
}

/**
 * Creates a photo strip using Fabric.js
 */
export async function createPhotoStrip(options: PhotoStripOptions): Promise<string | null> {
  const { template, photos, stickers = [], borderWidth = 4, spacing = 10 } = options;

  if (photos.length !== template.photoCount) {
    return null;
  }

  try {
    // Load all images
    const images = await loadImages(photos);

    if (images.length < Math.ceil(template.photoCount * 0.75)) {
      throw new Error('Too few images loaded successfully');
    }

    // Get dimensions from first image
    const singleWidth = images[0].width;
    const singleHeight = images[0].height;

    // Calculate canvas dimensions
    const { width: canvasWidth, height: canvasHeight } = calculateCanvasDimensions(
      template,
      singleWidth,
      singleHeight,
      borderWidth,
      spacing,
    );

    // Create Fabric.js canvas
    const canvasElement = document.createElement('canvas');
    const stripCanvas = createFabricCanvas(canvasElement, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 'white',
    });

    // Add outer border
    const border = createFabricRect({
      left: borderWidth / 2,
      top: borderWidth / 2,
      width: canvasWidth - borderWidth,
      height: canvasHeight - borderWidth,
      stroke: 'black',
      strokeWidth: borderWidth,
    });
    stripCanvas.add(border);

    // Calculate image positions
    const imagePositions = calculateImagePositions(
      template,
      singleWidth,
      singleHeight,
      canvasWidth,
      borderWidth,
      spacing,
    );

    // Add images to canvas
    for (let i = 0; i < images.length && i < imagePositions.length; i++) {
      const fabricImg = createFabricImage(images[i], {
        left: imagePositions[i].left,
        top: imagePositions[i].top,
      });
      stripCanvas.add(fabricImg);

      // Add image border
      const imageBorder = createFabricRect({
        left: imagePositions[i].left,
        top: imagePositions[i].top,
        width: singleWidth,
        height: singleHeight,
        stroke: '#333333',
        strokeWidth: 2,
      });
      stripCanvas.add(imageBorder);
    }

    // Add stickers
    await addStickersToStrip(stripCanvas, stickers, canvasWidth, canvasHeight);

    // Add timestamp
    addTimestampToStrip(stripCanvas, borderWidth, canvasHeight);

    // Render to data URL
    const dataURL = stripCanvas.toDataURL({
      format: 'jpeg',
      quality: 0.85,
      multiplier: 1,
    });

    // Clean up
    stripCanvas.dispose();

    return dataURL;
  } catch {
    return null;
  }
}

/**
 * Adds stickers to the photo strip canvas
 */
async function addStickersToStrip(
  canvas: Canvas,
  stickers: Array<{
    id: string;
    src: string;
    position: { x: number; y: number };
    size: number;
    rotation: number;
  }>,
  canvasWidth: number,
  canvasHeight: number,
): Promise<void> {
  const previewMaxWidth = 384;
  const scaleX = canvasWidth / previewMaxWidth;
  const scaleY = canvasHeight / previewMaxWidth;

  for (const sticker of stickers) {
    try {
      const stickerImg = await loadImage(sticker.src);
      const stickerSize = 60;

      const fabricSticker = createFabricImage(stickerImg, {
        left: sticker.position.x * scaleX - (stickerSize * sticker.size) / 100 / 2,
        top: sticker.position.y * scaleY - (stickerSize * sticker.size) / 100 / 2,
        scaleX: sticker.size / 100,
        scaleY: sticker.size / 100,
        angle: sticker.rotation,
      });

      canvas.add(fabricSticker);
    } catch {
      // Failed to add sticker to strip
    }
  }
}

/**
 * Adds timestamp to the photo strip
 */
function addTimestampToStrip(canvas: Canvas, borderWidth: number, canvasHeight: number): void {
  const date = new Date();
  const timestamp = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  const text = new FabricText(timestamp, {
    left: borderWidth,
    top: canvasHeight - borderWidth - 20,
    fontSize: 16,
    fill: '#333333',
    fontFamily: 'Arial',
  });

  canvas.add(text);
}
