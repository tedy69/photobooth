'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Download, RefreshCw, ImageIcon, Film } from 'lucide-react';
import StickerSelector from './sticker-selector';
import BackgroundFrameSelector from './background-frame-selector';
import PhotoGallery from './photo-gallery';
import TimerIndicator from './timer-indicator';
import TemplateSelector, { type Template } from './template-selector';
import PhotoStrip from './photo-strip';
import { stickers } from '@/lib/frames';
import { backgrounds } from '@/lib/backgrounds';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { downloadImage } from '@/lib/composite-image-utils';

// Import our custom hooks
import { useCamera } from '@/hooks/use-camera';
import { useFabricStickers } from '@/hooks/use-fabric-stickers';
import { usePhotoGallery } from '@/hooks/use-photo-gallery';

// Templates configuration
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

  // UI State
  const [activeTab, setActiveTab] = useState('camera');
  const [isDownloading, setIsDownloading] = useState(false);

  // Photo strip state
  const [stripPhotos, setStripPhotos] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0].id);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Custom hooks
  const camera = useCamera();
  const fabricStickers = useFabricStickers();
  const gallery = usePhotoGallery();

  // Refs for strip capture
  const stripCaptureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current template
  const currentTemplate = templates.find((t) => t.id === selectedTemplate) || templates[0];

  // Initialize camera on mount
  useEffect(() => {
    camera.startCamera();

    // Capture the ref value at effect time
    const timeoutRef = stripCaptureTimeoutRef;

    return () => {
      camera.stopCamera();
      fabricStickers.cleanup();
      const timeoutId = timeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to reapply background
  const reapplyCurrentBackground = useCallback(() => {
    if (fabricStickers.selectedBackground) {
      const currentBg = backgrounds.find((bg) => bg.id === fabricStickers.selectedBackground);
      if (currentBg) {
        fabricStickers.applyBackground(currentBg);
      }
    }
  }, [fabricStickers]);

  // Initialize Fabric canvas when preview tab is active
  useEffect(() => {
    if (activeTab === 'preview' && camera.capturedImage) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!fabricStickers.isFabricReady) {
          fabricStickers.initializeFabricCanvas(activeTab);
        }

        // Set background image if canvas is ready
        if (
          fabricStickers.isFabricReady &&
          fabricStickers.fabricCanvasElementRef.current &&
          camera.capturedImage
        ) {
          fabricStickers.setBackgroundImage(camera.capturedImage);

          // Re-apply current background to ensure proper layering
          setTimeout(reapplyCurrentBackground, 200);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeTab, camera.capturedImage, fabricStickers, reapplyCurrentBackground]);

  // Photo strip capture functionality
  const startPhotoStripCapture = useCallback(() => {
    setStripPhotos([]);
    setCurrentPhotoIndex(0);
    setIsTimerActive(true);

    toast({
      title: 'Strip capture started!',
      description: `Taking ${currentTemplate.photoCount} photos, one every 5 seconds.`,
    });
  }, [currentTemplate.photoCount]);

  // Helper function to load an image
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  // Create composite strip image for editing
  const createCompositeStripImage = useCallback(
    async (photos: string[]) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx || photos.length === 0) return null;

        // Load all images
        const imagePromises = photos.map(loadImage);
        const images = await Promise.all(imagePromises);

        const imgWidth = images[0].width;
        const imgHeight = images[0].height; // Set canvas dimensions for vertical strip
        canvas.width = imgWidth;
        canvas.height = imgHeight * photos.length;

        // Draw images vertically
        images.forEach((img, i) => {
          ctx.drawImage(img, 0, i * imgHeight, imgWidth, imgHeight);
        });

        const result = canvas.toDataURL('image/jpeg', 0.8);
        return result;
      } catch {
        return null;
      }
    },
    [loadImage],
  );

  // Unified photo capture handler that waits for the actual captured image
  const handleStripTimerComplete = useCallback(async () => {
    try {
      // Capture photo and wait for the result
      const capturedImageUrl = await camera.capturePhoto();

      if (!capturedImageUrl) {
        toast({
          title: t.errorTitle,
          description: 'Failed to capture photo. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const template = templates.find((t) => t.id === selectedTemplate);
      const requiredPhotos = template?.photoCount ?? 1;
      const updatedStripPhotos = [...stripPhotos, capturedImageUrl];
      const photosCount = updatedStripPhotos.length;

      // Update strip photos state
      setStripPhotos(updatedStripPhotos);

      // Check if we've captured all required photos
      if (photosCount >= requiredPhotos) {
        // All photos captured - stop timer and process
        setIsTimerActive(false);

        // Check if it's a single photo template
        if (requiredPhotos === 1) {
          // For single photos, use the captured image directly
          camera.setCapturedImageImmediately(capturedImageUrl);
          setActiveTab('preview');
          camera.stopCamera();
          toast({
            title: t.photoComplete,
            description: t.stripCompleteEdit,
          });
        } else {
          // For multi-photo strips, create composite from all photos
          try {
            const compositeImage = await createCompositeStripImage(updatedStripPhotos);
            if (compositeImage) {
              camera.setCapturedImageImmediately(compositeImage);
              setActiveTab('preview');
              camera.stopCamera();
              toast({
                title: t.photoComplete,
                description: t.stripCompleteEdit,
              });
            } else {
              // Fallback to strip view if composite creation returns null
              setActiveTab('strip');
              camera.stopCamera();
              toast({
                title: t.errorTitle,
                description: t.errorDescription,
              });
            }
          } catch {
            // Fallback to strip view if composite creation fails
            setActiveTab('strip');
            camera.stopCamera();
            toast({
              title: t.errorTitle,
              description: t.errorDescription,
            });
          }
        }
      } else {
        // More photos needed - increment counter and continue timer
        setCurrentPhotoIndex(currentPhotoIndex + 1);

        toast({
          title: `Photo ${photosCount}/${requiredPhotos} captured!`,
          description: `Next photo in 5 seconds...`,
        });
      }
    } catch {
      toast({
        title: t.errorTitle,
        description: 'Failed to capture photo. Please try again.',
        variant: 'destructive',
      });
    }
  }, [
    stripPhotos,
    selectedTemplate,
    camera,
    setActiveTab,
    t,
    createCompositeStripImage,
    currentPhotoIndex,
  ]);

  // Download functionality
  const downloadPhoto = useCallback(async () => {
    if (!camera.capturedImage || isDownloading) return;

    setIsDownloading(true);

    try {
      const finalImage = fabricStickers.exportCanvasAsImage();

      if (finalImage) {
        downloadImage(finalImage, `photobooth-${new Date().getTime()}.png`);
        toast({
          title: 'Download started',
          description: 'Your photo is being downloaded.',
        });
      }
    } catch {
      toast({
        title: 'Download failed',
        description: 'There was a problem downloading your photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [camera, fabricStickers, isDownloading]);

  // Save to gallery
  const savePhotoToGallery = useCallback(async () => {
    const finalImage = fabricStickers.exportCanvasAsImage();
    if (finalImage) {
      await gallery.saveToGallery(finalImage, {
        hasStickers: fabricStickers.appliedStickers.length > 0,
        stickerCount: fabricStickers.appliedStickers.length,
      });

      toast({
        title: 'Photo saved!',
        description: 'Your photo has been saved to the gallery.',
      });
    }
  }, [fabricStickers, gallery]);

  // Photo strip functionality - remove unused function
  const clearPhotoStrip = useCallback(() => {
    setStripPhotos([]);
    setCurrentPhotoIndex(0);
    setIsTimerActive(false);
    setActiveTab('camera');
  }, []);

  const resetPhoto = useCallback(() => {
    camera.retakePhoto();
    fabricStickers.clearAllStickers();
    setActiveTab('camera');
  }, [camera, fabricStickers]);

  // Reset photo session
  const resetPhotoSession = useCallback(() => {
    setStripPhotos([]);
    setCurrentPhotoIndex(0);
    setIsTimerActive(false);
    camera.retakePhoto(); // Clear captured image
    if (stripCaptureTimeoutRef.current) {
      clearTimeout(stripCaptureTimeoutRef.current);
    }
  }, [camera]);

  // Enhanced template selector handler
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      // If we're changing template and have a session in progress, reset it
      if (stripPhotos.length > 0 || isTimerActive) {
        resetPhotoSession();
      }
      setSelectedTemplate(templateId);
    },
    [stripPhotos.length, isTimerActive, resetPhotoSession],
  );

  // Handle tab selection
  const handleSelectTab = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      // If switching to camera tab, reset photo session
      if (tab === 'camera') {
        resetPhotoSession();
        camera.stopCamera();

        setTimeout(() => {
          camera.startCamera(); // Restart camera after a short delay
        }, 100);
      }
    },
    [camera, resetPhotoSession],
  );

  // Reset timer and strip state when template changes
  useEffect(() => {
    // Only reset if we're not in the middle of a capture session
    if (stripPhotos.length === 0) {
      setIsTimerActive(false);
      setCurrentPhotoIndex(0);
    }
  }, [selectedTemplate, stripPhotos.length]);

  return (
    <div className='w-full max-w-4xl mx-auto p-4 space-y-4'>
      <Card className='overflow-hidden shadow-lg'>
        <CardContent className='p-0'>
          <Tabs value={activeTab} onValueChange={handleSelectTab} className='w-full'>
            <TabsList className='grid w-full grid-cols-4 bg-muted/50 h-auto'>
              <TabsTrigger value='camera' className='flex items-center gap-2 px-2 py-3'>
                <Camera className='h-4 w-4' />
                <span className='hidden sm:inline'>{t.camera}</span>
              </TabsTrigger>
              <TabsTrigger
                value='preview'
                className='flex items-center gap-2 px-2 py-3'
                disabled={!camera.capturedImage}>
                <ImageIcon className='h-4 w-4' />
                <span className='hidden sm:inline'>{t.preview}</span>
              </TabsTrigger>
              <TabsTrigger value='strip' className='flex items-center gap-2 px-2 py-3'>
                <Film className='h-4 w-4' />
                <span className='hidden sm:inline'>{t.strip}</span>
              </TabsTrigger>
              <TabsTrigger value='gallery' className='flex items-center gap-2 px-2 py-3'>
                <ImageIcon className='h-4 w-4' />
                <span className='hidden sm:inline'>
                  {t.gallery} ({gallery.galleryPhotos.length})
                </span>
                <span className='sm:hidden'>({gallery.galleryPhotos.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value='camera' className='p-4 space-y-4'>
              <div>
                <h3 className='text-lg font-medium mb-3'>{t.chooseLayout}</h3>
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateChange}
                />
              </div>

              <div className='aspect-video bg-black rounded-lg overflow-hidden relative camera-container'>
                {camera.error ? (
                  <div className='absolute inset-0 flex items-center justify-center text-white'>
                    <div className='text-center p-4'>
                      <p className='mb-4'>{camera.error}</p>
                      <Button onClick={camera.startCamera} variant='outline'>
                        {t.retryCamera}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={camera.videoRef}
                      autoPlay
                      muted
                      playsInline
                      className='w-full h-full object-cover scale-x-[-1]'
                    />
                    <canvas ref={camera.canvasRef} className='hidden' />

                    {/* Timer Indicator for Strip Mode */}
                    {isTimerActive && (
                      <TimerIndicator
                        interval={5000}
                        isActive={isTimerActive}
                        onIntervalComplete={handleStripTimerComplete}
                        currentPhotoIndex={currentPhotoIndex}
                        totalPhotos={currentTemplate.photoCount}
                      />
                    )}
                  </>
                )}
              </div>

              <div className='flex flex-wrap gap-3 justify-center'>
                <Button
                  onClick={startPhotoStripCapture}
                  disabled={!camera.isCameraReady || camera.isCapturing || isTimerActive}
                  size='lg'
                  className='bg-pink-500 hover:bg-pink-600'>
                  <Camera className='mr-2 h-5 w-5' />
                  {camera.isCapturing ? t.capturing : t.takePhoto}
                </Button>

                {/* Show reset button if there's an active session */}
                {(stripPhotos.length > 0 || isTimerActive || camera.capturedImage) && (
                  <Button onClick={resetPhotoSession} variant='outline' size='lg'>
                    <RefreshCw className='mr-2 h-5 w-5' />
                    New Session
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value='preview' className='p-4 space-y-4'>
              {camera.capturedImage ? (
                <div className='space-y-4'>
                  <div className='flex justify-center'>
                    <div className='relative'>
                      <canvas
                        ref={fabricStickers.fabricCanvasElementRef}
                        className='border border-gray-200 rounded-lg shadow-sm max-w-full'
                      />
                    </div>
                  </div>

                  {/* Sticker Selector */}
                  <div>
                    <h3 className='text-lg font-medium mb-3'>{t.stickers}</h3>
                    <StickerSelector
                      stickers={stickers}
                      onSelectSticker={fabricStickers.addSticker}
                    />
                  </div>

                  {/* Background & Frame Selector */}
                  <div>
                    <h3 className='text-lg font-medium mb-3'>{t.backgroundsFrames}</h3>
                    <BackgroundFrameSelector
                      selectedBackground={fabricStickers.selectedBackground}
                      selectedFrame={fabricStickers.selectedFrame}
                      onSelectBackground={fabricStickers.applyBackground}
                      onSelectFrame={fabricStickers.applyFrame}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-wrap gap-3 justify-center'>
                    <Button onClick={resetPhoto} variant='outline' size='lg'>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      {t.retake}
                    </Button>

                    <Button
                      onClick={downloadPhoto}
                      disabled={isDownloading}
                      size='lg'
                      variant='secondary'>
                      <Download className='mr-2 h-4 w-4' />
                      {isDownloading ? t.downloading : t.download}
                    </Button>

                    <Button
                      onClick={savePhotoToGallery}
                      disabled={gallery.isSaving}
                      size='lg'
                      className='bg-pink-500 hover:bg-pink-600'>
                      <ImageIcon className='mr-2 h-4 w-4' />
                      {gallery.isSaving ? t.saving : t.saveToGallery}
                    </Button>

                    {fabricStickers.appliedStickers.length > 0 && (
                      <Button onClick={fabricStickers.clearAllStickers} variant='outline'>
                        {t.clearStickers}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-muted-foreground mb-4'>{t.noPhotoTaken}</p>
                  <Button
                    onClick={() => setActiveTab('camera')}
                    className='bg-pink-500 hover:bg-pink-600'>
                    {t.takePhotoFirst}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Photo Strip Tab */}
            <TabsContent value='strip' className='p-4 space-y-4'>
              <div className='w-full max-w-sm mx-auto'>
                <PhotoStrip photos={stripPhotos} selectedTemplate={selectedTemplate} />
              </div>

              <div className='flex flex-wrap gap-3 justify-center'>
                <Button onClick={clearPhotoStrip} variant='outline' size='lg'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  {t.clearStrip}
                </Button>

                {stripPhotos.length > 0 && (
                  <Button
                    onClick={downloadPhoto}
                    disabled={isDownloading}
                    size='lg'
                    className='bg-pink-500 hover:bg-pink-600'>
                    <Download className='mr-2 h-4 w-4' />
                    {isDownloading ? t.downloading : t.download}
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value='gallery' className='p-4'>
              <PhotoGallery
                photos={gallery.galleryPhotos.map((photo) => ({
                  id: photo.id,
                  imageData: photo.src,
                  timestamp: photo.timestamp,
                }))}
                onDeletePhoto={gallery.deleteFromGallery}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
