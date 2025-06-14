'use client';

import { useRef, useState, useCallback } from 'react';
import { Canvas, FabricImage } from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { type Background, type Frame } from '@/lib/backgrounds';
import { 
  type ExtendedFabricObject, 
  findPhotoImage, 
  findBackgroundElements, 
  findFrameElements, 
  findStickerElements,
  findStickerById
} from '@/lib/fabric-utils';

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
          const stickerObjects = findStickerElements(canvas.getObjects());
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
        (fabricImg as ExtendedFabricObject).stickerId = newSticker.id;

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
    const stickerObject = findStickerById(objects, stickerId);

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

      // Remove existing background objects if any
      const objects = canvas.getObjects();
      const existingBgObjects = objects.filter((obj) => 
        (obj as any).name === 'background-rect' || 
        (obj as any).name === 'background-pattern'
      );
      existingBgObjects.forEach((obj) => canvas.remove(obj));

      if (background.type === 'color') {
        // For solid colors, use canvas backgroundColor
        canvas.backgroundColor = background.value;
        // Reset background to transparent for color backgrounds
        const bgObjects = objects.filter((obj) => (obj as any).name === 'background-rect');
        bgObjects.forEach((obj) => canvas.remove(obj));
      } else if (background.type === 'gradient') {
        // Reset canvas background to transparent for gradient backgrounds
        canvas.backgroundColor = 'transparent';

        // For gradients, we need to create a canvas element with the gradient and use it as an image
        const canvasWidth = canvas.width || 400;
        const canvasHeight = canvas.height || 400;

        // Create a temporary canvas to draw the gradient
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        if (tempCtx) {
          // Create the gradient on the temporary canvas
          let gradient;
          
          if (background.id === 'sunset') {
            gradient = tempCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#ff9a9e');
            gradient.addColorStop(0.5, '#fecfef');
            gradient.addColorStop(1, '#fecfef');
          } else if (background.id === 'ocean') {
            gradient = tempCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
          } else if (background.id === 'rainbow') {
            gradient = tempCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#ff9a9e');
            gradient.addColorStop(0.25, '#fecfef');
            gradient.addColorStop(0.5, '#fecfef');
            gradient.addColorStop(0.75, '#a8edea');
            gradient.addColorStop(1, '#fed6e3');
          } else if (background.id === 'cosmic') {
            gradient = tempCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
          } else {
            // Fallback
            gradient = tempCtx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#ff9a9e');
            gradient.addColorStop(1, '#fecfef');
          }

          // Fill the temporary canvas with the gradient
          tempCtx.fillStyle = gradient;
          tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Convert to data URL and create a Fabric image
          const gradientDataUrl = tempCanvas.toDataURL('image/png');
          
          FabricImage.fromURL(gradientDataUrl, {
            crossOrigin: 'anonymous',
          }).then((gradientImg) => {
            if (!gradientImg || !canvas) return;

            gradientImg.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              excludeFromExport: false,
            });

            // Add name property for identification
            (gradientImg as any).name = 'background-rect';
            canvas.add(gradientImg);

            // Send background to back and ensure proper layering
            canvas.sendObjectToBack(gradientImg);

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

            canvas.renderAll();
          }).catch(() => {
            // Fallback to solid color if gradient fails
            canvas.backgroundColor = '#ff9a9e';
          });
        }
      } else if (background.type === 'pattern') {
        // Reset canvas background to transparent for pattern backgrounds
        canvas.backgroundColor = 'transparent';

        // Create pattern background using a canvas approach for better rendering
        const canvasWidth = canvas.width || 400;
        const canvasHeight = canvas.height || 400;

        // Create a temporary canvas to draw the pattern
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        if (tempCtx) {
          if (background.id === 'polka-dots') {
            // Create polka dots pattern
            tempCtx.fillStyle = '#ffffff'; // Base color
            tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            tempCtx.fillStyle = '#fce7f3'; // Dot color
            const dotSize = 6;
            const spacing = 20;

            for (let x = 0; x < canvasWidth + spacing; x += spacing) {
              for (let y = 0; y < canvasHeight + spacing; y += spacing) {
                tempCtx.beginPath();
                tempCtx.arc(x, y, dotSize / 2, 0, 2 * Math.PI);
                tempCtx.fill();
              }
            }
          } else if (background.id === 'stripes') {
            // Create stripes pattern
            tempCtx.fillStyle = '#ffffff'; // Base color
            tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            tempCtx.fillStyle = '#f3e8ff'; // Stripe color
            const stripeWidth = 20;

            for (let x = 0; x < canvasWidth + stripeWidth; x += stripeWidth * 2) {
              tempCtx.fillRect(x, 0, stripeWidth, canvasHeight);
            }
          }

          // Convert to data URL and create a Fabric image
          const patternDataUrl = tempCanvas.toDataURL('image/png');
          
          FabricImage.fromURL(patternDataUrl, {
            crossOrigin: 'anonymous',
          }).then((patternImg) => {
            if (!patternImg || !canvas) return;

            patternImg.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              excludeFromExport: false,
            });

            // Add name property for identification
            (patternImg as any).name = 'background-rect';
            canvas.add(patternImg);

            // Send background to back and ensure proper layering
            canvas.sendObjectToBack(patternImg);

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

            canvas.renderAll();
          }).catch(() => {
            // Fallback to solid color if pattern fails
            canvas.backgroundColor = '#f8fafc';
          });
        }
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

  // Apply frame (improved implementation)
  const applyFrame = useCallback(
    async (frame: Frame) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      
      // Remove existing frame objects if any
      const objects = canvas.getObjects();
      const existingFrameObjects = objects.filter((obj) => (obj as any).name === 'frame-element');
      existingFrameObjects.forEach((obj) => canvas.remove(obj));

      setSelectedFrame(frame.id);

      // If no frame selected, just refresh sizing and return
      if (frame.id === 'none' || !frame.src) {
        setTimeout(() => {
          refreshPhotoSizing();
        }, 100);
        return;
      }

      try {
        // Load the frame as an image and add it to the canvas
        const frameImg = await FabricImage.fromURL(frame.src, {
          crossOrigin: 'anonymous',
        });

        if (!frameImg) return;

        const canvasWidth = canvas.width || 400;
        const canvasHeight = canvas.height || 400;

        // Scale frame to canvas size
        frameImg.scaleToWidth(canvasWidth);
        frameImg.scaleToHeight(canvasHeight);

        frameImg.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          excludeFromExport: false,
        });

        // Add name for identification
        (frameImg as any).name = 'frame-element';
        
        canvas.add(frameImg);

        // Ensure frame is on top of background but below stickers
        const photoObj = canvas.getObjects().find((obj) => (obj as any).name === 'photo-image');
        if (photoObj) {
          canvas.bringObjectToFront(frameImg);
          canvas.bringObjectToFront(photoObj);
        }

        // Ensure stickers remain on top
        const stickerObjects = canvas.getObjects().filter((obj) => (obj as any).stickerId);
        stickerObjects.forEach((sticker) => {
          canvas.bringObjectToFront(sticker);
        });

        canvas.renderAll();

        // Refresh photo sizing since frame changed
        setTimeout(() => {
          refreshPhotoSizing();
        }, 100);
      } catch (error) {
        console.error('Error loading frame:', error);
        // Fallback: just refresh sizing
        setTimeout(() => {
          refreshPhotoSizing();
        }, 100);
      }
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
