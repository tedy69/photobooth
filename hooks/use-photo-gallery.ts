"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export interface GalleryPhoto {
  id: string;
  src: string;
  timestamp: number;
  metadata?: { hasStickers?: boolean; stickerCount?: number; sample?: boolean };
}
export function parseGallery(value: string | null): GalleryPhoto[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (photo) =>
        photo &&
        typeof photo.id === "string" &&
        typeof photo.src === "string" &&
        /^data:image\/(png|jpeg);base64,/.test(photo.src) &&
        typeof photo.timestamp === "number" &&
        Number.isFinite(photo.timestamp) &&
        Math.abs(photo.timestamp) <= 8.64e15,
    )
  )
    throw new Error("Invalid gallery");
  return parsed;
}
export function usePhotoGallery() {
  const [galleryPhotos, setPhotos] = useState<GalleryPhoto[]>([]);
  const photosRef = useRef<GalleryPhoto[]>([]);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(() => {
    try {
      const photos = parseGallery(localStorage.getItem("galleryPhotos"));
      photosRef.current = photos;
      setPhotos(photos);
      setError(false);
    } catch {
      setError(true);
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);
  const persist = useCallback((photos: GalleryPhoto[]) => {
    try {
      localStorage.setItem("galleryPhotos", JSON.stringify(photos));
      photosRef.current = photos;
      setPhotos(photos);
      setError(false);
      return true;
    } catch {
      setError(true);
      return false;
    }
  }, []);
  const saveToGallery = useCallback(
    (src: string, metadata?: GalleryPhoto["metadata"]) => {
      if (!loaded || error) return false;
      return persist([
        { id: crypto.randomUUID(), src, timestamp: Date.now(), metadata },
        ...photosRef.current,
      ]);
    },
    [loaded, error, persist],
  );
  const deleteFromGallery = useCallback(
    (id: string) =>
      persist(photosRef.current.filter((photo) => photo.id !== id)),
    [persist],
  );
  const clearGallery = useCallback(() => {
    try {
      localStorage.removeItem("galleryPhotos");
      photosRef.current = [];
      setPhotos([]);
      setError(false);
      return true;
    } catch {
      setError(true);
      return false;
    }
  }, []);
  return {
    galleryPhotos,
    loaded,
    error,
    saveToGallery,
    deleteFromGallery,
    clearGallery,
    load,
  };
}
