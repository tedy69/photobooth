'use client';

import { useRef, useState, useCallback } from 'react';
import { Canvas, FabricImage, Rect } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { type Background, type Frame } from '@/lib/backgrounds';

interface FabricImageWithName extends FabricImage {
  name?: string;
}

export interface AppliedSticker {
  id: string;
  stickerId: string;
  src: string;
  name: string;
  position: { x: number; y: number };
  size: number;
  rotation: number;
}

export function useFabricStickers() {
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const fabricCanvasElementRef = useRef<HTMLCanvasElement>(null);

  const [isFabricReady, setIsFabricReady] = useState(false);
  const [appliedStickers, setAppliedStickers] = useState<AppliedSticker[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('white');
  const [selectedFrame, setSelectedFrame] = useState<string>('none'); // Initialize Fabric.js canvas
  const initializeFabricCanvas = useCallback((activeTab: string) => {
    if (activeTab === 'preview' && fabricCanvasElementRef.current && !fabricCanvasRef.current) {
      setTimeout(() => {
        if (fabricCanvasElementRef.current && !fabricCanvasRef.current) {
          try {
            const canvas = new Canvas(fabricCanvasElementRef.current, {
              width: 384,
              height: 384,
              backgroundColor: 'transparent',
              selection: true,
              preserveObjectStacking: true,
            });

            fabricCanvasRef.current = canvas;
            setIsFabricReady(true);
          } catch {
            // Canvas initialization failed - continue without fabric canvas
          }
        }
      }, 100);
    }
  }, []);

  const resetFabricCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
        setIsFabricReady(false);
    }
  }, []);


  // Load captured image as background
  const setBackgroundImage = useCallback(
    (capturedImage: string) => {
      if (!fabricCanvasRef.current || !capturedImage) return;

      const canvas = fabricCanvasRef.current;

      // Clear any existing photo
      const objects = canvas.getObjects();
      const existingPhoto = objects.find(
        (obj) => (obj as FabricImageWithName).name === 'photo-image',
      );
      if (existingPhoto) {
        canvas.remove(existingPhoto);
      }

      FabricImage.fromURL(capturedImage, {
        crossOrigin: 'anonymous',
      })
        .then((img) => {
          if (!canvas) return;

          const maxWidth = 384;
          const maxHeight = 600; // Add max height constraint
          const aspectRatio = (img.width || 1) / (img.height || 1);

          let canvasWidth, canvasHeight;
          let photoWidth, photoHeight;

          // Calculate canvas dimensions
          if (aspectRatio > 1) {
            // Wider than tall
            canvasWidth = Math.min(img.width || maxWidth, maxWidth);
            canvasHeight = canvasWidth / aspectRatio;
          } else {
            // Taller than wide (like photo strips)
            canvasHeight = Math.min(img.height || maxHeight, maxHeight);
            canvasWidth = canvasHeight * aspectRatio;
          }

          // Ensure we don't exceed maximum dimensions
          if (canvasWidth > maxWidth) {
            canvasWidth = maxWidth;
            canvasHeight = canvasWidth / aspectRatio;
          }
          if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
          }

          // Check if background or frame is applied - if so, make photo smaller
          const hasBackground =
            selectedBackground !== 'white' && selectedBackground !== 'transparent';
          const hasFrame = selectedFrame !== 'none';

          if (hasBackground || hasFrame) {
            // Add padding and make photo smaller when background/frame is applied
            const padding = 40; // 20px padding on each side
            photoWidth = canvasWidth - padding;
            photoHeight = canvasHeight - padding;

            // Maintain aspect ratio
            if (photoWidth / photoHeight > aspectRatio) {
              photoWidth = photoHeight * aspectRatio;
            } else {
              photoHeight = photoWidth / aspectRatio;
            }
          } else {
            // Full size when no background/frame
            photoWidth = canvasWidth;
            photoHeight = canvasHeight;
          }

          // Scale and position the image
          img.scaleToWidth(photoWidth);
          img.scaleToHeight(photoHeight);

          // Center the photo in the canvas
          img.set({
            left: (canvasWidth - photoWidth) / 2,
            top: (canvasHeight - photoHeight) / 2,
            selectable: false,
            evented: false,
          });

          // Add name for identification
          (img as FabricImageWithName).name = 'photo-image';

          // Set canvas dimensions
          canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

          // Add the photo image as an object (not backgroundImage)
          canvas.add(img);

          // Ensure stickers remain on top by bringing them to front
          const stickerObjects = canvas.getObjects().filter((obj) => (obj as any).stickerId);
          stickerObjects.forEach((sticker) => {
            canvas.bringObjectToFront(sticker);
          });

          canvas.renderAll();
        })
        .catch(() => {
          // Error loading captured image - continue
        });
    },
    [selectedBackground, selectedFrame],
  );

  // Add sticker to canvas
  const addSticker = useCallback(
    async (sticker: { id: string; src: string; name: string }) => {
      if (!fabricCanvasRef.current || !isFabricReady) {
        toast({
          title: 'Canvas not ready',
          description: 'Please wait for the canvas to initialize.',
          variant: 'destructive',
        });
        return;
      }

      const newSticker: AppliedSticker = {
        id: uuidv4(),
        stickerId: sticker.id,
        src: sticker.src,
        name: sticker.name,
        position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
        size: 80,
        rotation: 0,
      };

      try {
        let stickerSrc = sticker.src;

        // Handle SVG stickers - convert to PNG for better Fabric.js compatibility
        if (sticker.src.startsWith('data:image/svg+xml') || sticker.src.includes('.svg')) {
          try {
            // Create a canvas to convert SVG to PNG
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = 200; // Higher resolution for better quality
            tempCanvas.height = 200;

            if (tempCtx) {
              const img = new Image();

              const svgConversionPromise = new Promise<string>((resolve, reject) => {
                img.onload = () => {
                  try {
                    // Clear canvas with transparent background
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

                    // Calculate scaling to fit the image properly
                    const scale = Math.min(
                      tempCanvas.width / img.naturalWidth,
                      tempCanvas.height / img.naturalHeight,
                    );

                    const scaledWidth = img.naturalWidth * scale;
                    const scaledHeight = img.naturalHeight * scale;

                    // Center the image
                    const x = (tempCanvas.width - scaledWidth) / 2;
                    const y = (tempCanvas.height - scaledHeight) / 2;

                    // Draw the SVG with proper scaling and centering
                    tempCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

                    // Convert to PNG data URL with transparency
                    const pngDataUrl = tempCanvas.toDataURL('image/png', 1.0);
                    resolve(pngDataUrl);
                  } catch (err) {
                    reject(new Error(`SVG conversion error: ${err}`));
                  }
                };

                img.onerror = () => {
                  reject(new Error('Failed to load SVG'));
                };

                // Set crossOrigin before setting src
                img.crossOrigin = 'anonymous';
                img.src = sticker.src;
              });

              stickerSrc = await svgConversionPromise;
            }
          } catch {
            // Fallback to original SVG if conversion fails
            stickerSrc = sticker.src;
          }
        }

        const fabricImg = await FabricImage.fromURL(stickerSrc, {
          crossOrigin: 'anonymous',
        });

        fabricImg.set({
          left: newSticker.position.x,
          top: newSticker.position.y,
          scaleX: newSticker.size / 100,
          scaleY: newSticker.size / 100,
          angle: newSticker.rotation,
          hasControls: true,
          hasBorders: true,
          selectable: true,
          moveable: true,
          cornerSize: 12,
          transparentCorners: false,
          cornerColor: '#fff',
          cornerStrokeColor: '#333',
          borderColor: '#333',
          borderScaleFactor: 2,
        });

        // Store sticker ID on the fabric object
        (fabricImg as any).stickerId = newSticker.id;

        fabricCanvasRef.current.add(fabricImg);

        // Ensure sticker is on top by using canvas.bringObjectToFront
        fabricCanvasRef.current.bringObjectToFront(fabricImg);

        fabricCanvasRef.current.setActiveObject(fabricImg);

        // Force a render to ensure sticker appears
        fabricCanvasRef.current.renderAll();

        setAppliedStickers((prev) => [...prev, newSticker]);

        toast({
          title: 'Sticker added',
          description: `${sticker.name} has been added to your photo.`,
        });
      } catch {
        toast({
          title: 'Error adding sticker',
          description: 'There was a problem adding the sticker. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [isFabricReady],
  );

  // Remove sticker
  const removeSticker = useCallback((stickerId: string) => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    const stickerObject = objects.find((obj) => (obj as any).stickerId === stickerId);

    if (stickerObject) {
      fabricCanvasRef.current.remove(stickerObject);
      fabricCanvasRef.current.renderAll();
      setAppliedStickers((prev) => prev.filter((s) => s.id !== stickerId));
    }
  }, []);

  // Clear all stickers
  const clearAllStickers = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach((obj) => {
      if ((obj as any).stickerId) {
        fabricCanvasRef.current!.remove(obj);
      }
    });

    fabricCanvasRef.current.renderAll();
    setAppliedStickers([]);
  }, []);

  // Export canvas as image
  const exportCanvasAsImage = useCallback(() => {
    if (!fabricCanvasRef.current) return null;

    try {
      const canvas = fabricCanvasRef.current;
      const canvasDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2,
      });

      return canvasDataUrl;
    } catch {
      return null;
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
      setIsFabricReady(false);
    }
  }, []);

  // Refresh photo sizing when background/frame changes
  const refreshPhotoSizing = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const photoObj = objects.find((obj) => (obj as FabricImageWithName).name === 'photo-image');

    if (photoObj) {
      // Get the current photo's original image
      const fabricImg = photoObj as FabricImage;
      const imgElement = (fabricImg as any)._element;

      if (imgElement && imgElement.src) {
        // Reload the photo with new sizing
        setBackgroundImage(imgElement.src);
      }
    }
  }, [setBackgroundImage]);

  // Apply background
  const applyBackground = useCallback(
    (background: Background) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;

      // Remove existing background rectangle if any
      const objects = canvas.getObjects();
      const existingBg = objects.find((obj) => (obj as any).name === 'background-rect');
      if (existingBg) {
        canvas.remove(existingBg);
      }

      if (background.type === 'color') {
        // For solid colors, use canvas backgroundColor
        canvas.backgroundColor = background.value;
        // Reset background to transparent for color backgrounds
        const bgObjects = objects.filter((obj) => (obj as any).name === 'background-rect');
        bgObjects.forEach((obj) => canvas.remove(obj));
      } else if (background.type === 'gradient' || background.type === 'pattern') {
        // Reset canvas background to transparent for pattern/gradient backgrounds
        canvas.backgroundColor = 'transparent';

        // For gradients and patterns, create a background rectangle
        const bgRect = new Rect({
          left: 0,
          top: 0,
          width: canvas.width || 400,
          height: canvas.height || 400,
          fill: background.value,
          selectable: false,
          evented: false,
          excludeFromExport: false,
        });

        // Add name property for identification
        (bgRect as any).name = 'background-rect'; // Add the background rectangle - it will be behind the photo since photo is added later
        canvas.add(bgRect);

        // Send background to back and ensure proper layering
        canvas.sendObjectToBack(bgRect);

        // Move photo image to middle layer
        const photoObj = canvas.getObjects().find((obj) => (obj as any).name === 'photo-image');
        if (photoObj) {
          canvas.bringObjectForward(photoObj);
        }

        // Ensure stickers remain on top
        const stickerObjects = canvas.getObjects().filter((obj) => (obj as any).stickerId);
        stickerObjects.forEach((sticker) => {
          canvas.bringObjectToFront(sticker);
        });
      }

      setSelectedBackground(background.id);
      canvas.renderAll();

      // Refresh photo sizing since background changed
      setTimeout(() => {
        refreshPhotoSizing();
      }, 100);
    },
    [refreshPhotoSizing],
  );

  // Apply frame (simplified version)
  const applyFrame = useCallback(
    (frame: Frame) => {
      if (!fabricCanvasRef.current) return;

      setSelectedFrame(frame.id);

      // Refresh photo sizing since frame changed
      setTimeout(() => {
        refreshPhotoSizing();
      }, 100);

      // Note: Full frame implementation would require more complex SVG handling
      // For now, we'll just track the selected frame
    },
    [refreshPhotoSizing],
  );

  return {
    fabricCanvasElementRef,
    fabricCanvasRef,
    isFabricReady,
    appliedStickers,
    initializeFabricCanvas,
    resetFabricCanvas,
    setBackgroundImage,
    addSticker,
    removeSticker,
    clearAllStickers,
    exportCanvasAsImage,
    cleanup,
    selectedBackground,
    setSelectedBackground,
    selectedFrame,
    setSelectedFrame,
    applyBackground,
    applyFrame,
    refreshPhotoSizing,
  };
}
