'use client';

import { useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  initializeCamera,
  capturePhotoFromVideo,
  createFlashEffect,
  stopMediaStream,
} from '@/lib/camera-utils';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImageState] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Wrapper function with logging
  const setCapturedImage = useCallback((imageUrl: string) => {
    setCapturedImageState(imageUrl);
  }, []);
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (cameraStreamRef.current) {
        stopMediaStream(cameraStreamRef.current);
      }

      const mediaStream = await initializeCamera({
        facingMode: 'user',
      });

      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        cameraStreamRef.current = mediaStream;
        setIsCameraReady(true);
        setError('');
      }
    } catch {
      setError('Failed to access camera. Please check permissions.');

      // For testing stickers, set a mock captured image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 300);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#4ecdc4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Add some text
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test Photo for Stickers', 200, 150);

        const testImage = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(testImage);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return null;

    setIsCapturing(true);

    try {
      // Create flash effect
      createFlashEffect(document.body);

      // Small delay for flash effect
      await new Promise((resolve) => setTimeout(resolve, 100));

      const imageDataUrl = capturePhotoFromVideo(videoRef.current, {
        format: 'image/jpeg',
        quality: 0.9,
      });

      if (imageDataUrl) {
        setCapturedImage(imageDataUrl);
        toast({
          title: 'Photo captured!',
          description: 'Your photo has been captured successfully.',
        });
        return imageDataUrl; // Return the captured image URL
      }

      return null;
    } catch {
      toast({
        title: 'Capture failed',
        description: 'There was a problem capturing your photo. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCapturing(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapturing]);

  const retakePhoto = useCallback(() => {
    setCapturedImage('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCapturedImageImmediately = useCallback((imageUrl: string) => {
    setCapturedImageState(imageUrl);
    // Force a state update by using a functional update
    setCapturedImageState(() => {
      return imageUrl;
    });
    return imageUrl;
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      stopMediaStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
      setIsCameraReady(false);
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraReady,
    isCapturing,
    capturedImage,
    error,
    startCamera,
    capturePhoto,
    retakePhoto,
    stopCamera,
    setCapturedImage,
    setCapturedImageImmediately,
  };
}
