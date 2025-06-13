'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export interface GalleryPhoto {
  id: string;
  imageData: string;
  timestamp: number;
}

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  onDeletePhoto: (id: string) => void;
}

export default function PhotoGallery({ photos, onDeletePhoto }: PhotoGalleryProps) {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = useCallback((photo: GalleryPhoto) => {
    setIsDownloading(photo.id);

    try {
      const link = document.createElement('a');
      link.download = `photobooth-${photo.timestamp}.png`;
      link.href = photo.imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading photo:', error);
    } finally {
      setIsDownloading(null);
    }
  }, []);

  if (photos.length === 0) {
    return (
      <div className='text-center p-6 bg-gray-50 rounded-lg'>
        <p className='text-gray-500'>{t.galleryEmpty}</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='gallery-grid'>
        {photos.map((photo) => (
          <Dialog key={photo.id}>
            <DialogTrigger asChild>
              <div className='gallery-item shadow-md'>
                <img
                  src={photo.imageData || '/placeholder.svg'}
                  alt={`Photo taken at ${new Date(photo.timestamp).toLocaleString()}`}
                  className='w-full h-full object-cover'
                />
                <div className='gallery-item-overlay'>
                  <Button variant='secondary' size='sm' className='rounded-full'>
                    {t.view}
                  </Button>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>{new Date(photo.timestamp).toLocaleString()}</DialogTitle>
              </DialogHeader>
              <div className='flex flex-col items-center gap-4'>
                <img
                  src={photo.imageData || '/placeholder.svg'}
                  alt={new Date(photo.timestamp).toLocaleString()}
                  className='max-h-[60vh] object-contain rounded-lg'
                />
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDownload(photo)}
                    disabled={isDownloading === photo.id}>
                    <Download className='h-4 w-4 mr-2' />
                    {isDownloading === photo.id ? t.downloading : t.download}
                  </Button>
                  <Button variant='destructive' size='sm' onClick={() => onDeletePhoto(photo.id)}>
                    <Trash2 className='h-4 w-4 mr-2' />
                    {t.delete}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
