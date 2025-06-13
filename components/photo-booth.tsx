'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Download, RefreshCw, ImageIcon, Film, Clock } from 'lucide-react';
import StickerSelector from './sticker-selector';
import DraggableSticker from './draggable-sticker';
import PhotoGallery, { type GalleryPhoto } from './photo-gallery';
import CountdownTimer from './countdown-timer';
import TimerIndicator from './timer-indicator';
import PhotoStrip from './photo-strip';
import TemplateSelector, { type Template } from './template-selector';
import { stickers } from '@/lib/frames';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface AppliedSticker {
  id: string;
  stickerId: string;
  src: string;
  name: string;
  position: { x: number; y: number };
}

// Updated templates with photoCount property and flattened design
const templates: Template[] = [
  {
    id: '4x1',
    name: 'Classic Strip',
    size: '2" × 6"',
    aspectRatio: 1 / 3,
    orientation: 'portrait',
    photoCount: 4,
    layout: 'vertical',
    hasBorders: true,
    flattened: true,
  },
  {
    id: '3x1',
    name: 'Triple Strip',
    size: '2" × 4.5"',
    aspectRatio: 1 / 2.25,
    orientation: 'portrait',
    photoCount: 3,
    layout: 'vertical',
    hasBorders: true,
    flattened: true,
  },
  {
    id: '2x2',
    name: 'Grid',
    size: '4" × 4"',
    aspectRatio: 1,
    orientation: 'portrait',
    photoCount: 4,
    layout: 'grid',
    hasBorders: true,
    flattened: true,
  },
  {
    id: '3x3',
    name: 'Three Grid',
    size: '4" × 4"',
    aspectRatio: 1,
    orientation: 'portrait',
    photoCount: 3,
    layout: 'grid',
    hasBorders: true,
    flattened: true,
  },
  {
    id: '1x1',
    name: 'Single Photo',
    size: '4" × 6"',
    aspectRatio: 2 / 3,
    orientation: 'landscape',
    photoCount: 1,
    layout: 'single',
    hasBorders: true,
    flattened: true,
  },
];

export default function PhotoBooth() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [appliedStickers, setAppliedStickers] = useState<AppliedSticker[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('camera');
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Countdown strip states
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [stripPhotos, setStripPhotos] = useState<string[]>([]);
  const [currentStripPhotoIndex, setCurrentStripPhotoIndex] = useState(0);
  const [isStripMode, setIsStripMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('4x1');
  const [isProcessingStrip, setIsProcessingStrip] = useState(false);
  const [isSinglePhotoMode, setIsSinglePhotoMode] = useState(false);

  // Get the current template object based on selectedTemplate ID
  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];

  // Get the total number of photos needed for the current template
  const totalPhotosNeeded = currentTemplate.photoCount;

  // After the useState declarations, add new refs to track camera status
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const isCapturingRef = useRef<boolean>(false);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to track the current state in callbacks
  const currentPhotoIndexRef = useRef(0);
  const stripPhotosRef = useRef<string[]>([]);
  const isTimerActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const totalPhotosNeededRef = useRef(totalPhotosNeeded);

  // Keep refs in sync with state
  useEffect(() => {
    currentPhotoIndexRef.current = currentStripPhotoIndex;
    stripPhotosRef.current = stripPhotos;
    isTimerActiveRef.current = isTimerActive;
    isProcessingRef.current = isProcessingStrip;
    totalPhotosNeededRef.current = totalPhotosNeeded;

    // Debug logging
    if (isTimerActive) {
      console.log(
        `PhotoBooth state updated - currentPhotoIndex: ${currentStripPhotoIndex}, photos: ${stripPhotos.length}/${totalPhotosNeeded}`,
      );
    }
  }, [currentStripPhotoIndex, stripPhotos, isTimerActive, isProcessingStrip, totalPhotosNeeded]);

  // Load gallery photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('galleryPhotos');
    if (savedPhotos) {
      try {
        setGalleryPhotos(JSON.parse(savedPhotos));
      } catch (e) {
        console.error('Error loading saved photos:', e);
      }
    }
  }, []);

  // Save gallery photos to localStorage whenever it changes
  useEffect(() => {
    if (galleryPhotos.length > 0) {
      localStorage.setItem('galleryPhotos', JSON.stringify(galleryPhotos));
    }
  }, [galleryPhotos]);

  // Replace the useEffect that initializes the camera:
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Ensure any previous stream is properly stopped
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        cameraStreamRef.current = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsCameraReady(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(t.cameraError);
      }
    };

    startCamera();

    return () => {
      // Clean up camera on component unmount
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
        setActiveTab('preview');
        setAppliedStickers([]);
      }
    }
  }, []);

  // Capture a single photo for the strip
  const captureStripPhoto = useCallback(() => {
    if (isCapturingRef.current) {
      console.log('Already capturing, skipping');
      return;
    }

    isCapturingRef.current = true;

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        try {
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to data URL (use JPEG format for better performance)
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

          // Add to strip photos
          setStripPhotos((prev) => {
            const newPhotos = [...prev, imageDataUrl];
            stripPhotosRef.current = newPhotos;
            console.log(`Added photo ${newPhotos.length}/${totalPhotosNeededRef.current}`);
            return newPhotos;
          });

          // Increment the photo index
          setCurrentStripPhotoIndex((prev) => {
            const newIndex = prev + 1;
            currentPhotoIndexRef.current = newIndex;
            console.log(`Updated photo index to ${newIndex}/${totalPhotosNeededRef.current}`);
            return newIndex;
          });

          // Flash effect
          const flashElement = document.createElement('div');
          flashElement.className = 'absolute inset-0 bg-white z-40 opacity-70';
          const cameraContainer = document.querySelector('.camera-container');
          if (cameraContainer) {
            cameraContainer.appendChild(flashElement);
            setTimeout(() => {
              if (cameraContainer.contains(flashElement)) {
                cameraContainer.removeChild(flashElement);
              }
            }, 200);
          }
        } catch (error) {
          console.error('Error capturing photo:', error);
          toast({
            title: t.errorTitle,
            description: t.errorDescription,
            variant: 'destructive',
          });
        }
      }
    }

    // Reset the capturing flag after a short delay
    setTimeout(() => {
      isCapturingRef.current = false;
    }, 200);
  }, []);

  // New function to handle single photo capture after countdown
  const captureSingleCountdownPhoto = useCallback(() => {
    console.log('Capturing single countdown photo');

    // Take a single photo
    captureStripPhoto();

    // Process the photo after a short delay
    setTimeout(() => {
      // Create a duplicate of the photo to fill the template
      const photoCount = stripPhotosRef.current.length;
      if (photoCount > 0) {
        const photo = stripPhotosRef.current[0];
        const neededCopies = totalPhotosNeededRef.current - photoCount;

        // Fill the remaining slots with copies of the same photo
        if (neededCopies > 0) {
          const newPhotos = [...stripPhotosRef.current];
          for (let i = 0; i < neededCopies; i++) {
            newPhotos.push(photo);
          }
          setStripPhotos(newPhotos);
          stripPhotosRef.current = newPhotos;
        }

        // Finish the strip capture process
        finishStripCapture();
      }
    }, 300);
  }, []);

  const resetPhoto = useCallback(() => {
    setCapturedImage(null);
    setAppliedStickers([]);
    setActiveTab('camera');
  }, []);

  const resetStrip = useCallback(() => {
    setStripPhotos([]);
    stripPhotosRef.current = [];
    setCurrentStripPhotoIndex(0);
    currentPhotoIndexRef.current = 0;
    setIsStripMode(false);
    setIsProcessingStrip(false);
    setIsTimerActive(false);
    isTimerActiveRef.current = false;
    setIsSinglePhotoMode(false);
    setActiveTab('camera');
  }, []);

  const addStickerToPhoto = useCallback((sticker: any) => {
    const newSticker: AppliedSticker = {
      id: uuidv4(),
      stickerId: sticker.id,
      src: sticker.src,
      name: sticker.name,
      position: { x: 50, y: 50 },
    };
    setAppliedStickers((prev) => [...prev, newSticker]);
  }, []);

  const removeSticker = useCallback((stickerId: string) => {
    setAppliedStickers((prev) => prev.filter((sticker) => sticker.id !== stickerId));
  }, []);

  // Helper function to create a composite image with all elements
  const createCompositeImage = useCallback(async () => {
    if (!capturedImage) return null;

    // Create a canvas to combine everything
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    try {
      // Load the captured image
      const img = new Image();

      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load captured image'));
        img.src = capturedImage;
      });

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the captured photo
      ctx.drawImage(img, 0, 0);

      // Draw all stickers
      for (const sticker of appliedStickers) {
        try {
          const stickerImg = new Image();

          // Wait for the sticker to load with a timeout
          await Promise.race([
            new Promise<void>((resolve, reject) => {
              stickerImg.onload = () => resolve();
              stickerImg.onerror = () =>
                reject(new Error(`Failed to load sticker: ${sticker.src}`));
              stickerImg.src = sticker.src;
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Sticker loading timed out')), 3000),
            ),
          ]);

          const stickerWidth = 100;
          const stickerHeight = 100;
          const x = (sticker.position.x / 100) * canvas.width;
          const y = (sticker.position.y / 100) * canvas.height;

          ctx.drawImage(stickerImg, x, y, stickerWidth, stickerHeight);
        } catch (stickerError) {
          console.error('Sticker loading error:', stickerError);
          // Continue without this sticker
        }
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error creating composite image:', error);
      toast({
        title: 'Error creating image',
        description: 'There was a problem processing your photo. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [capturedImage, appliedStickers]);

  const saveToGallery = useCallback(async () => {
    if (!capturedImage || isSaving) return;

    setIsSaving(true);

    try {
      const finalImage = await createCompositeImage();

      if (finalImage) {
        const newPhoto: GalleryPhoto = {
          id: uuidv4(),
          imageData: finalImage,
          timestamp: Date.now(),
        };

        setGalleryPhotos((prev) => {
          const updatedGallery = [newPhoto, ...prev];
          // Save to localStorage immediately
          localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));
          return updatedGallery;
        });

        // Show gallery tab after saving
        setActiveTab('gallery');
        toast({
          title: 'Photo saved!',
          description: 'Your photo has been saved to the gallery.',
        });
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: 'Save failed',
        description: 'There was a problem saving your photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [capturedImage, createCompositeImage, isSaving]);

  const downloadPhoto = useCallback(async () => {
    if (!capturedImage || isDownloading) return;

    setIsDownloading(true);

    try {
      const finalImage = await createCompositeImage();

      if (finalImage) {
        // Create download link
        const link = document.createElement('a');
        link.download = `photobooth-${new Date().getTime()}.png`;
        link.href = finalImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: 'Download started',
          description: 'Your photo is being downloaded.',
        });
      }
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast({
        title: 'Download failed',
        description: 'There was a problem downloading your photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [capturedImage, createCompositeImage, isDownloading]);

  const deleteFromGallery = useCallback((photoId: string) => {
    setGalleryPhotos((prev) => {
      const updatedGallery = prev.filter((photo) => photo.id !== photoId);
      // Update localStorage when deleting
      localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));
      return updatedGallery;
    });
    toast({
      title: 'Photo deleted',
      description: 'The photo has been removed from your gallery.',
    });
  }, []);

  // Define createPhotoStrip before it's used in other functions
  const createPhotoStrip = useCallback(async () => {
    const template = templates.find((t) => t.id === selectedTemplate) || templates[0];
    const requiredPhotoCount = template.photoCount;

    if (stripPhotos.length !== requiredPhotoCount) {
      console.warn(`Not enough photos for strip: ${stripPhotos.length}/${requiredPhotoCount}`);
      return null;
    }

    console.log(`Creating photo strip with layout ${template.id}`);

    try {
      // Create a temporary canvas for the strip
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return null;
      }

      // Use a more efficient approach with Promise.allSettled
      console.log('Loading strip images');
      const imagePromises = stripPhotos.map(
        (src) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
            // Set a timeout to avoid hanging
            setTimeout(() => reject(new Error('Image load timeout')), 5000);
          }),
      );

      const results = await Promise.allSettled(imagePromises);

      // Filter successful loads
      const images = results
        .filter(
          (result): result is PromiseFulfilledResult<HTMLImageElement> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value);

      console.log(`Loaded ${images.length}/${requiredPhotoCount} images successfully`);

      // Handle insufficient images
      if (images.length < Math.ceil(requiredPhotoCount * 0.75)) {
        // Allow some tolerance if a few images fail (at least 75% of required photos)
        throw new Error('Too few images loaded successfully');
      }

      // Fill missing images if necessary
      while (images.length < requiredPhotoCount) {
        // Duplicate the last successful image as a placeholder
        images.push(images[images.length - 1]);
      }

      // Get dimensions from first image
      const singleWidth = images[0].width;
      const singleHeight = images[0].height;

      // Set strip canvas dimensions based on selected template
      let canvasWidth, canvasHeight;
      const borderWidth = 4; // Border width in pixels
      const spacing = 10; // Spacing between photos

      switch (template.id) {
        case '4x1':
          canvasWidth = singleWidth + borderWidth * 2;
          canvasHeight = singleHeight * 4 + spacing * 3 + borderWidth * 2;
          break;
        case '3x1':
          canvasWidth = singleWidth + borderWidth * 2;
          canvasHeight = singleHeight * 3 + spacing * 2 + borderWidth * 2;
          break;
        case '2x2':
          canvasWidth = singleWidth * 2 + spacing + borderWidth * 2;
          canvasHeight = singleHeight * 2 + spacing + borderWidth * 2;
          break;
        case '3x3':
          canvasWidth = singleWidth * 2 + spacing + borderWidth * 2;
          canvasHeight = singleHeight * 2 + spacing + borderWidth * 2;
          break;
        case '1x1':
          canvasWidth = singleWidth + borderWidth * 2;
          canvasHeight = singleHeight + borderWidth * 2;
          break;
        default:
          canvasWidth = singleWidth + borderWidth * 2;
          canvasHeight =
            singleHeight * requiredPhotoCount +
            spacing * (requiredPhotoCount - 1) +
            borderWidth * 2;
      }

      // Set canvas dimensions
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Add outer border
      ctx.strokeStyle = 'black';
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(
        borderWidth / 2,
        borderWidth / 2,
        canvasWidth - borderWidth,
        canvasHeight - borderWidth,
      );

      // Draw each image based on layout with inner borders
      const innerBorderWidth = 2; // Width of inner borders
      ctx.strokeStyle = '#333333'; // Dark gray for inner borders
      ctx.lineWidth = innerBorderWidth;

      switch (template.id) {
        case '4x1':
          // Vertical strip layout with 4 photos
          for (let i = 0; i < 4; i++) {
            const y = borderWidth + i * (singleHeight + spacing);
            ctx.drawImage(images[i], borderWidth, y, singleWidth, singleHeight);

            // Draw inner border around each photo
            ctx.strokeRect(borderWidth, y, singleWidth, singleHeight);
          }
          break;

        case '3x1':
          // Vertical strip layout with 3 photos
          for (let i = 0; i < 3; i++) {
            const y = borderWidth + i * (singleHeight + spacing);
            ctx.drawImage(images[i], borderWidth, y, singleWidth, singleHeight);

            // Draw inner border around each photo
            ctx.strokeRect(borderWidth, y, singleWidth, singleHeight);
          }
          break;

        case '2x2':
          // 2x2 grid layout
          // Top left
          ctx.drawImage(images[0], borderWidth, borderWidth, singleWidth, singleHeight);
          ctx.strokeRect(borderWidth, borderWidth, singleWidth, singleHeight);

          // Top right
          ctx.drawImage(
            images[1],
            borderWidth + singleWidth + spacing,
            borderWidth,
            singleWidth,
            singleHeight,
          );
          ctx.strokeRect(
            borderWidth + singleWidth + spacing,
            borderWidth,
            singleWidth,
            singleHeight,
          );

          // Bottom left
          ctx.drawImage(
            images[2],
            borderWidth,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          ctx.strokeRect(
            borderWidth,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );

          // Bottom right
          ctx.drawImage(
            images[3],
            borderWidth + singleWidth + spacing,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          ctx.strokeRect(
            borderWidth + singleWidth + spacing,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          break;

        case '3x3':
          // 3x3 grid layout (3 photos in a triangular arrangement)
          // Top center
          const topX = (canvasWidth - singleWidth) / 2;
          ctx.drawImage(images[0], topX, borderWidth, singleWidth, singleHeight);
          ctx.strokeRect(topX, borderWidth, singleWidth, singleHeight);

          // Bottom left
          ctx.drawImage(
            images[1],
            borderWidth,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          ctx.strokeRect(
            borderWidth,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );

          // Bottom right
          ctx.drawImage(
            images[2],
            borderWidth + singleWidth + spacing,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          ctx.strokeRect(
            borderWidth + singleWidth + spacing,
            borderWidth + singleHeight + spacing,
            singleWidth,
            singleHeight,
          );
          break;

        case '1x1':
          // Single photo
          ctx.drawImage(images[0], borderWidth, borderWidth, singleWidth, singleHeight);
          ctx.strokeRect(borderWidth, borderWidth, singleWidth, singleHeight);
          break;

        default:
          // Default vertical layout
          for (let i = 0; i < images.length; i++) {
            const y = borderWidth + i * (singleHeight + spacing);
            ctx.drawImage(images[i], borderWidth, y, singleWidth, singleHeight);
            ctx.strokeRect(borderWidth, y, singleWidth, singleHeight);
          }
      }

      // Add template name and timestamp
      ctx.fillStyle = 'black';
      ctx.font = '12px sans-serif';
      const timestamp = new Date().toLocaleDateString();
      ctx.fillText(`Photo Booth - ${timestamp}`, borderWidth + 5, canvasHeight - 10);

      console.log('Photo strip created successfully');
      return canvas.toDataURL('image/jpeg', 0.85); // Use JPEG for better performance
    } catch (error) {
      console.error('Error creating photo strip:', error);
      toast({
        title: 'Error creating strip',
        description: 'There was a problem creating your photo strip. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  }, [stripPhotos, selectedTemplate]);

  // Updated startCountdown function to only take a single photo
  const startCountdown = useCallback(() => {
    // Stop any active timers first
    if (isTimerActive) {
      setIsTimerActive(false);
    }

    // Clean state
    setIsStripMode(true);
    setIsSinglePhotoMode(true);
    setStripPhotos([]);
    stripPhotosRef.current = [];
    setCurrentStripPhotoIndex(0);
    currentPhotoIndexRef.current = 0;
    setIsProcessingStrip(false);
    isProcessingRef.current = false;

    // Check camera is ready before starting
    if (videoRef.current && videoRef.current.srcObject) {
      setTimeout(() => {
        setIsCountdownActive(true);
        console.log('Countdown started for single photo');
      }, 300);
    } else {
      // Try to restart camera if not ready
      console.log('Camera not ready, attempting to restart');
      const restartCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          });

          if (videoRef.current) {
            if (cameraStreamRef.current) {
              cameraStreamRef.current.getTracks().forEach((track) => track.stop());
            }

            cameraStreamRef.current = mediaStream;
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);

            // Start countdown after camera is ready
            setTimeout(() => {
              setIsCountdownActive(true);
              console.log('Countdown started after camera restart');
            }, 500);
          }
        } catch (err) {
          console.error('Failed to restart camera:', err);
          toast({
            title: 'Camera error',
            description: 'Failed to restart camera. Please refresh the page.',
            variant: 'destructive',
          });
        }
      };

      restartCamera();
    }
  }, [isTimerActive]);

  // Replace the startTimedCapture function:
  const startTimedCapture = useCallback(() => {
    // Reset all state for a fresh start
    setIsStripMode(true);
    setIsSinglePhotoMode(false);
    setStripPhotos([]);
    stripPhotosRef.current = [];
    setCurrentStripPhotoIndex(0);
    currentPhotoIndexRef.current = 0;
    setIsProcessingStrip(false);
    isProcessingRef.current = false;

    console.log('Starting timed capture sequence');

    // Small delay before starting the timer to ensure clean state
    setTimeout(() => {
      setIsTimerActive(true);
      isTimerActiveRef.current = true;
      console.log('Timer activated');
    }, 200);

    const template = templates.find((t) => t.id === selectedTemplate) || templates[0];

    toast({
      title: 'Timed capture started',
      description: `Taking ${template.photoCount} photos, one every 5 seconds.`,
    });
  }, [selectedTemplate]);

  // Separate function to handle strip completion
  const finishStripCapture = useCallback(() => {
    console.log('Finishing strip capture');

    // Stop the timer first
    setIsTimerActive(false);
    isTimerActiveRef.current = false;
    setIsCountdownActive(false);

    // Show processing state
    setIsProcessingStrip(true);
    isProcessingRef.current = true;

    // Process images in the background with a timeout to ensure UI updates
    setTimeout(async () => {
      try {
        console.log('Processing images for strip...');
        // Preload all images to ensure they're ready
        const preloadPromises = stripPhotosRef.current.map(
          (src) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
              img.src = src;
            }),
        );

        await Promise.allSettled(preloadPromises);
        console.log('Images preloaded');

        // Create the strip
        const stripImage = await createPhotoStrip();

        if (stripImage) {
          // Save to gallery automatically
          const newPhoto: GalleryPhoto = {
            id: uuidv4(),
            imageData: stripImage,
            timestamp: Date.now(),
          };

          setGalleryPhotos((prev) => {
            const updatedGallery = [newPhoto, ...prev];
            localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));
            return updatedGallery;
          });

          toast({
            title: 'Strip complete!',
            description: 'Your photo strip is ready and saved to gallery.',
          });
        }

        // Show the strip when ready
        setActiveTab('strip');
        setIsProcessingStrip(false);
        isProcessingRef.current = false;
      } catch (error) {
        console.error('Error processing strip:', error);
        toast({
          title: 'Processing error',
          description: 'There was a problem creating your photo strip. Please try again.',
          variant: 'destructive',
        });
        setIsProcessingStrip(false);
        isProcessingRef.current = false;
      }
    }, 500);
  }, [createPhotoStrip]);

  // Replace the handleTimerComplete function:
  const handleTimerComplete = useCallback(() => {
    // For single photo mode (countdown strip), capture one photo and finish
    if (isSinglePhotoMode) {
      console.log('Single photo mode: capturing one photo');
      captureSingleCountdownPhoto();
      return;
    }

    // For multi-photo mode (timed strip)
    console.log(
      `Timer complete, capturing photo ${currentPhotoIndexRef.current + 1}/${
        totalPhotosNeededRef.current
      }`,
    );

    // Take a photo
    captureStripPhoto();

    // Check if we've taken all photos
    setTimeout(() => {
      const currentIndex = currentPhotoIndexRef.current;
      const photosCount = stripPhotosRef.current.length;
      const requiredPhotos = totalPhotosNeededRef.current;

      console.log(`After capture: index=${currentIndex}, photos=${photosCount}/${requiredPhotos}`);

      if (photosCount >= requiredPhotos) {
        console.log('All photos taken, finishing strip capture');
        // Schedule finishStripCapture with a delay
        if (finishTimeoutRef.current) {
          clearTimeout(finishTimeoutRef.current);
        }

        finishTimeoutRef.current = setTimeout(() => {
          finishStripCapture();
        }, 300);
      } else {
        console.log(`Continuing timer, photo ${photosCount}/${requiredPhotos} taken`);
        // Timer continues automatically in TimerIndicator
      }
    }, 100);
  }, [captureStripPhoto, finishStripCapture, captureSingleCountdownPhoto, isSinglePhotoMode]);

  const downloadStrip = useCallback(async () => {
    if (isDownloading) return;

    const template = templates.find((t) => t.id === selectedTemplate) || templates[0];
    if (stripPhotos.length !== template.photoCount) return;

    setIsDownloading(true);

    try {
      // Create a composite image of the strip
      const stripImage = await createPhotoStrip();

      if (stripImage) {
        // Create download link
        const link = document.createElement('a');
        link.download = `photostrip-${new Date().getTime()}.png`;
        link.href = stripImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Also save to gallery for persistence
        const newPhoto: GalleryPhoto = {
          id: uuidv4(),
          imageData: stripImage,
          timestamp: Date.now(),
        };

        setGalleryPhotos((prev) => {
          const updatedGallery = [newPhoto, ...prev];
          localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));
          return updatedGallery;
        });

        toast({
          title: 'Download started',
          description: 'Your photo strip is being downloaded and saved to gallery.',
        });
      }
    } catch (error) {
      console.error('Error downloading strip:', error);
      toast({
        title: 'Download failed',
        description: 'There was a problem downloading your photo strip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [createPhotoStrip, isDownloading, stripPhotos, selectedTemplate]);

  // Updated to handle single photo mode
  const handleCountdownComplete = useCallback(() => {
    if (isSinglePhotoMode) {
      // For countdown strip, just take a single photo
      captureSingleCountdownPhoto();
    } else {
      // For timed strip, start the sequence
      startTimedCapture();
    }
  }, [startTimedCapture, captureSingleCountdownPhoto, isSinglePhotoMode]);

  return (
    <Card className='w-full max-w-3xl shadow-lg mx-auto'>
      <CardContent className='p-3 sm:p-6 overflow-hidden'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto'>
            <TabsTrigger value='camera' className='text-xs sm:text-sm px-2 py-2'>
              <Camera className='h-4 w-4 sm:hidden' />
              <span className='hidden sm:inline'>{t.camera}</span>
            </TabsTrigger>
            <TabsTrigger
              value='preview'
              disabled={!capturedImage}
              className='text-xs sm:text-sm px-2 py-2'>
              <ImageIcon className='h-4 w-4 sm:hidden' />
              <span className='hidden sm:inline'>{t.edit}</span>
            </TabsTrigger>
            <TabsTrigger
              value='strip'
              disabled={stripPhotos.length !== totalPhotosNeeded}
              className='text-xs sm:text-sm px-2 py-2'>
              <Film className='h-4 w-4 sm:hidden' />
              <span className='hidden sm:inline'>{t.strip}</span>
            </TabsTrigger>
            <TabsTrigger value='gallery' className='text-xs sm:text-sm px-2 py-2'>
              <ImageIcon className='h-4 w-4 sm:hidden' />
              <span className='hidden sm:inline'>
                {t.gallery} ({galleryPhotos.length})
              </span>
              <span className='sm:hidden'>({galleryPhotos.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='camera' className='mt-0'>
            <div className='space-y-4 sm:space-y-6'>
              <div>
                <h3 className='text-base sm:text-lg font-medium mb-2 sm:mb-3'>{t.chooseLayout}</h3>
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={setSelectedTemplate}
                />
              </div>

              <div className='relative aspect-video sm:aspect-video bg-black rounded-lg overflow-hidden mb-3 sm:mb-4 camera-container max-h-[60vh] sm:max-h-none'>
                {error ? (
                  <div className='absolute inset-0 flex items-center justify-center text-white p-2 sm:p-4 text-center text-sm sm:text-base'>
                    {error}
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className='w-full h-full object-cover'
                    />
                    <CountdownTimer
                      initialCount={5}
                      onCountdownComplete={handleCountdownComplete}
                      isActive={isCountdownActive}
                    />
                    <TimerIndicator
                      interval={5000}
                      onIntervalComplete={handleTimerComplete}
                      isActive={isTimerActive || isProcessingStrip}
                      currentPhotoIndex={currentStripPhotoIndex}
                      totalPhotos={totalPhotosNeeded}
                    />
                  </>
                )}
                <canvas ref={canvasRef} className='hidden' />
              </div>

              <div className='flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 photo-booth-buttons'>
                <Button
                  onClick={capturePhoto}
                  disabled={!isCameraReady || isStripMode}
                  size='lg'
                  className='bg-pink-500 hover:bg-pink-600 w-full sm:w-auto text-sm sm:text-base'>
                  <Camera className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  {t.takePhoto}
                </Button>

                <Button
                  onClick={startCountdown}
                  disabled={
                    !isCameraReady || isCountdownActive || isTimerActive || isProcessingStrip
                  }
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto text-sm sm:text-base'>
                  <Film className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  {t.countdownStrip}
                </Button>

                <Button
                  onClick={startTimedCapture}
                  disabled={
                    !isCameraReady || isCountdownActive || isTimerActive || isProcessingStrip
                  }
                  size='lg'
                  variant='outline'
                  className='w-full sm:w-auto text-sm sm:text-base'>
                  <Clock className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  {t.timedStrip}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='preview' className='mt-0'>
            {capturedImage && (
              <div className='space-y-3 sm:space-y-4'>
                <div className='relative aspect-video bg-black rounded-lg overflow-hidden'>
                  <div className='relative w-full h-full'>
                    <img
                      src={capturedImage || '/placeholder.svg'}
                      alt='Captured'
                      className='absolute inset-0 w-full h-full object-cover'
                    />
                    {appliedStickers.map((sticker) => (
                      <DraggableSticker
                        key={sticker.id}
                        id={sticker.id}
                        src={sticker.src}
                        name={sticker.name}
                        onRemove={removeSticker}
                        initialPosition={sticker.position}
                      />
                    ))}
                  </div>
                </div>

                <div className='space-y-3 sm:space-y-4'>
                  <div>
                    <h3 className='text-base sm:text-lg font-medium mb-2'>{t.stickers}</h3>
                    <StickerSelector stickers={stickers} onSelectSticker={addStickerToPhoto} />
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 justify-center'>
                  <Button
                    onClick={resetPhoto}
                    variant='outline'
                    size='lg'
                    className='w-full sm:w-auto text-sm sm:text-base'>
                    <RefreshCw className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                    {t.takeNewPhoto}
                  </Button>

                  <Button
                    onClick={saveToGallery}
                    size='lg'
                    className='bg-pink-500 hover:bg-pink-600 w-full sm:w-auto text-sm sm:text-base'
                    disabled={isSaving}>
                    <ImageIcon className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                    {isSaving ? t.saving : t.saveToGallery}
                  </Button>

                  <Button
                    onClick={downloadPhoto}
                    size='lg'
                    variant='secondary'
                    disabled={isDownloading}
                    className='w-full sm:w-auto text-sm sm:text-base'>
                    <Download className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                    {isDownloading ? t.downloading : t.download}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='strip' className='mt-0'>
            <div className='space-y-4 sm:space-y-6'>
              <PhotoStrip photos={stripPhotos} onReset={resetStrip} onDownload={downloadStrip} />
            </div>
          </TabsContent>

          <TabsContent value='gallery' className='mt-0'>
            <PhotoGallery photos={galleryPhotos} onDeletePhoto={deleteFromGallery} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
