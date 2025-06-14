import { Canvas, FabricImage, Rect, FabricObject } from 'fabric';

export interface FabricCanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  preserveObjectStacking?: boolean;
  selection?: boolean;
  interactive?: boolean;
}

export interface StickerData {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: number;
  rotation: number;
}

/**
 * Creates and configures a new Fabric.js canvas
 */
export function createFabricCanvas(
  canvasElement: HTMLCanvasElement,
  config: FabricCanvasConfig,
): Canvas {
  return new Canvas(canvasElement, {
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor ?? 'transparent',
    preserveObjectStacking: config.preserveObjectStacking !== false,
    selection: config.selection !== false,
    interactive: config.interactive !== false,
  });
}

/**
 * Loads an image and returns a promise that resolves with the HTMLImageElement
 */
export function loadImage(src: string, timeout = 5000): Promise<HTMLImageElement> {
  return Promise.race([
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Image load timeout')), timeout),
    ),
  ]);
}

/**
 * Creates a Fabric.js image object from an HTMLImageElement
 */
export function createFabricImage(
  img: HTMLImageElement,
  options: Partial<FabricImage> = {},
): FabricImage {
  return new FabricImage(img, {
    selectable: false,
    evented: false,
    ...options,
  });
}

/**
 * Creates a Fabric.js rectangle (used for borders)
 */
export function createFabricRect(options: Partial<Rect>): Rect {
  return new Rect({
    fill: 'transparent',
    selectable: false,
    evented: false,
    ...options,
  });
}

/**
 * Adds a sticker to a Fabric.js canvas
 */
export async function addStickerToCanvas(
  canvas: Canvas,
  sticker: StickerData,
): Promise<FabricImage | null> {
  try {
    const imgElement = await loadImage(sticker.src);

    const fabricImg = new FabricImage(imgElement, {
      left: sticker.position.x,
      top: sticker.position.y,
      scaleX: sticker.size / 100,
      scaleY: sticker.size / 100,
      angle: sticker.rotation,
      hasControls: true,
      hasBorders: true,
      selectable: true,
      moveable: true,
    });

    // Store sticker ID in the Fabric object
    fabricImg.set('stickerId', sticker.id);

    canvas.add(fabricImg);
    canvas.renderAll();

    return fabricImg;
  } catch {
    return null;
  }
}

/**
 * Removes a sticker from a Fabric.js canvas by sticker ID
 */
export function removeStickerFromCanvas(canvas: Canvas, stickerId: string): boolean {
  const objects = canvas.getObjects();
  const stickerObj = objects.find((obj) => obj.get('stickerId') === stickerId);

  if (stickerObj) {
    canvas.remove(stickerObj);
    canvas.renderAll();
    return true;
  }

  return false;
}

/**
 * Updates sticker data from a Fabric.js object
 */
export function extractStickerDataFromFabricObject(obj: FabricObject): Partial<StickerData> | null {
  const stickerId = obj.get('stickerId');
  if (!stickerId) return null;

  return {
    id: stickerId,
    position: { x: obj.left || 0, y: obj.top || 0 },
    rotation: obj.angle || 0,
    size: (obj.scaleX || 1) * 100,
  };
}

/**
 * Clears all stickers from a Fabric.js canvas
 */
export function clearStickersFromCanvas(canvas: Canvas): void {
  const objects = canvas.getObjects();
  const stickerObjects = objects.filter((obj) => obj.get('stickerId'));
  stickerObjects.forEach((obj) => canvas.remove(obj));
  canvas.renderAll();
}

// Extended Fabric Object interface to include custom properties
export interface ExtendedFabricObject extends FabricObject {
  name?: string;
  stickerId?: string;
}

// Type guards and utilities for Fabric.js objects
export const isPhotoImage = (obj: FabricObject): obj is ExtendedFabricObject => {
  return (obj as ExtendedFabricObject).name === 'photo-image';
};

export const isBackgroundElement = (obj: FabricObject): obj is ExtendedFabricObject => {
  const name = (obj as ExtendedFabricObject).name;
  return name === 'background-rect' || name === 'background-pattern';
};

export const isFrameElement = (obj: FabricObject): obj is ExtendedFabricObject => {
  return (obj as ExtendedFabricObject).name === 'frame-element';
};

export const isStickerElement = (obj: FabricObject): obj is ExtendedFabricObject => {
  return !!(obj as ExtendedFabricObject).stickerId;
};

export const findPhotoImage = (objects: FabricObject[]): ExtendedFabricObject | undefined => {
  return objects.find(isPhotoImage);
};

export const findBackgroundElements = (objects: FabricObject[]): ExtendedFabricObject[] => {
  return objects.filter(isBackgroundElement);
};

export const findFrameElements = (objects: FabricObject[]): ExtendedFabricObject[] => {
  return objects.filter(isFrameElement);
};

export const findStickerElements = (objects: FabricObject[]): ExtendedFabricObject[] => {
  return objects.filter(isStickerElement);
};

export const findStickerById = (objects: FabricObject[], stickerId: string): ExtendedFabricObject | undefined => {
  return objects.find(obj => (obj as ExtendedFabricObject).stickerId === stickerId);
};
