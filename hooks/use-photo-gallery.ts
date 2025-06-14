'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface GalleryPhoto {
  id: string;
  src: string;
  timestamp: number;
  metadata?: {
    hasStickers?: boolean;
    stickerCount?: number;
  };
}

export function usePhotoGallery() {
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load gallery photos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('galleryPhotos');
      if (saved) {
        const parsed = JSON.parse(saved);
        setGalleryPhotos(parsed);
      }
    } catch {
      // Failed to load from storage
      toast({
        title: 'Error loading gallery',
        description: 'Failed to load gallery photos from storage.',
        variant: 'destructive',
      });
    }
  }, []);

  // Save photo to gallery
  const saveToGallery = useCallback(
    async (imageDataUrl: string, metadata?: GalleryPhoto['metadata']) => {
      if (!imageDataUrl || isSaving) return;

      setIsSaving(true);

      try {
        const newPhoto: GalleryPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          src: imageDataUrl,
          timestamp: Date.now(),
          metadata,
        };

        const updatedGallery = [newPhoto, ...galleryPhotos];
        setGalleryPhotos(updatedGallery);
        localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));

        toast({
          title: 'Photo saved',
          description: 'Your photo has been saved to the gallery.',
        });

        return newPhoto;
      } catch {
        toast({
          title: 'Save failed',
          description: 'There was a problem saving your photo. Please try again.',
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [galleryPhotos, isSaving],
  );

  // Delete photo from gallery
  const deleteFromGallery = useCallback(
    (photoId: string) => {
      const updatedGallery = galleryPhotos.filter((photo) => photo.id !== photoId);
      setGalleryPhotos(updatedGallery);
      localStorage.setItem('galleryPhotos', JSON.stringify(updatedGallery));

      toast({
        title: 'Photo deleted',
        description: 'The photo has been removed from your gallery.',
      });
    },
    [galleryPhotos],
  );

  // Clear entire gallery
  const clearGallery = useCallback(() => {
    setGalleryPhotos([]);
    localStorage.removeItem('galleryPhotos');

    toast({
      title: 'Gallery cleared',
      description: 'All photos have been removed from the gallery.',
    });
  }, []);

  // Get gallery stats
  const getGalleryStats = useCallback(() => {
    const totalPhotos = galleryPhotos.length;
    const photosWithStickers = galleryPhotos.filter((photo) => photo.metadata?.hasStickers).length;
    const totalStickers = galleryPhotos.reduce(
      (sum, photo) => sum + (photo.metadata?.stickerCount ?? 0),
      0,
    );

    return {
      totalPhotos,
      photosWithStickers,
      totalStickers,
    };
  }, [galleryPhotos]);

  return {
    galleryPhotos,
    isSaving,
    saveToGallery,
    deleteFromGallery,
    clearGallery,
    getGalleryStats,
  };
}
