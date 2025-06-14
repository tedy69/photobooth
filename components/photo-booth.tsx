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
import TemplateSelector from './template-selector';
import PhotoStrip from './photo-strip';
import { stickers } from '@/lib/frames';
import { backgrounds } from '@/lib/backgrounds';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { downloadImage } from '@/lib/composite-image-utils';
import { createPhotoStrip } from '@/lib/photo-strip-utils';

// Import our custom hooks
import { useCamera } from '@/hooks/use-camera';
import { useFabricStickers } from '@/hooks/use-fabric-stickers';
import { usePhotoGallery } from '@/hooks/use-photo-gallery';
import { templates } from '@/lib/templates';

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

    // If switching away from preview, reset Fabric canvas
    if (activeTab !== 'preview') {
      fabricStickers.resetFabricCanvas();
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

  // Create composite strip image for editing using the proper layout
  const createCompositeStripImage = useCallback(
    async (photos: string[]) => {
      try {
        if (photos.length === 0) return null;

        // Use the proper photo strip creation function that handles different layouts
        const stripImage = await createPhotoStrip({
          template: {
            ...currentTemplate,
            hasBorders: currentTemplate.hasBorders ?? true, // Ensure hasBorders is boolean
            flattened: currentTemplate.flattened ?? true, // Ensure flattened is boolean
          },
          photos,
        });

        return stripImage;
      } catch {
        return null;
      }
    },
    [currentTemplate],
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
                  <div className='absolute inset-0 flex items-center justify-center '>
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
                      <div className='absolute -inset-4 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-xl blur-lg opacity-30'></div>
                      <div className='relative bg-white p-2 rounded-xl shadow-xl border border-gray-100'>
                        <canvas
                          ref={fabricStickers.fabricCanvasElementRef}
                          className='border border-gray-200 rounded-lg shadow-sm max-w-full'
                        />
                        <div className='absolute top-1 right-1 bg-green-500 w-3 h-3 rounded-full animate-pulse'></div>
                        <div className='absolute bottom-1 left-1 px-2 py-1 bg-black/70 text-white text-xs rounded-md font-medium'>
                          LIVE EDIT
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticker Selector */}
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg -z-10'></div>
                    <div className='border border-pink-200 rounded-lg p-4 bg-white/80 backdrop-blur-sm'>
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse'></div>
                        <h3 className='text-lg font-medium text-gray-800'>
                          ✨ {t.stickers}
                        </h3>
                        <div className='px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium'>
                          NEW
                        </div>
                      </div>
                      <StickerSelector
                        stickers={stickers}
                        onSelectSticker={fabricStickers.addSticker}
                      />
                    </div>
                  </div>

                  {/* Background & Frame Selector */}
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg -z-10'></div>
                    <div className='border border-blue-200 rounded-lg p-4 bg-white/80 backdrop-blur-sm'>
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                        <h3 className='text-lg font-medium text-gray-800'>
                          🎨 {t.backgroundsFrames}
                        </h3>
                        <div className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium'>
                          PRO
                        </div>
                      </div>
                      <BackgroundFrameSelector
                        selectedBackground={fabricStickers.selectedBackground}
                        selectedFrame={fabricStickers.selectedFrame}
                        onSelectBackground={fabricStickers.applyBackground}
                        onSelectFrame={fabricStickers.applyFrame}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='relative'>
                    <div className='absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg -z-10'></div>
                    <div className='border border-green-200 rounded-lg p-4 bg-white/80 backdrop-blur-sm'>
                      <div className='flex items-center gap-2 mb-4'>
                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                        <h3 className='text-lg font-medium text-gray-800'>
                          🚀 Actions
                        </h3>
                      </div>
                      <div className='flex flex-wrap gap-3 justify-center'>
                        <Button 
                          onClick={resetPhoto} 
                          variant='outline' 
                          size='lg'
                          className='border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200'>
                          <RefreshCw className='mr-2 h-4 w-4' />
                          {t.retake}
                        </Button>

                        <Button
                          onClick={downloadPhoto}
                          disabled={isDownloading}
                          size='lg'
                          className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                          <Download className='mr-2 h-4 w-4' />
                          {isDownloading ? t.downloading : t.download}
                        </Button>

                        <Button
                          onClick={savePhotoToGallery}
                          disabled={gallery.isSaving}
                          size='lg'
                          className='bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                          <ImageIcon className='mr-2 h-4 w-4' />
                          {gallery.isSaving ? t.saving : t.saveToGallery}
                        </Button>

                        {fabricStickers.appliedStickers.length > 0 && (
                          <Button 
                            onClick={fabricStickers.clearAllStickers} 
                            variant='outline'
                            className='border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200'>
                            {t.clearStickers}
                          </Button>
                        )}
                      </div>
                    </div>
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
