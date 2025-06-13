'use client';

import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface PhotoStripProps {
  photos: string[];
  onReset: () => void;
  onDownload: () => void;
}

export default function PhotoStrip({ photos, onReset, onDownload }: PhotoStripProps) {
  const { t } = useLanguage();
  const stripRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    // Reset loading state when photos change
    if (photos.length > 0) {
      setIsLoading(true);
      setLoadProgress(0);

      // Simulate progressive loading for better UX
      const totalSteps = 10;
      const interval = 100;
      let currentStep = 0;

      const progressTimer = setInterval(() => {
        currentStep++;
        setLoadProgress(Math.min(95, (currentStep / totalSteps) * 100));

        if (currentStep >= totalSteps) {
          clearInterval(progressTimer);

          // Complete loading after a final delay
          setTimeout(() => {
            setLoadProgress(100);
            setIsLoading(false);
          }, 300);
        }
      }, interval);

      return () => clearInterval(progressTimer);
    }
  }, [photos]);

  if (photos.length === 0) return null;

  return (
    <div className='flex flex-col items-center gap-3 sm:gap-4'>
      {isLoading ? (
        <div className='flex flex-col items-center justify-center p-4 sm:p-8 w-full'>
          <div className='w-full max-w-xs mb-3 sm:mb-4'>
            <div className='h-2 w-full bg-gray-200 rounded-full'>
              <div
                className='h-full bg-pink-500 rounded-full transition-all duration-300'
                style={{ width: `${loadProgress}%` }}></div>
            </div>
          </div>
          <div className='animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-pink-500 mb-3 sm:mb-4'></div>
          <p className='text-gray-500 text-sm sm:text-base'>{t.processing}</p>
          <p className='text-xs text-gray-400 mt-1'>{t.createMoment}</p>
        </div>
      ) : (
        <div
          ref={stripRef}
          className='bg-white p-2 sm:p-4 shadow-lg rounded-md max-w-full overflow-auto'>
          <div className='border-2 sm:border-4 border-black p-1 sm:p-2 bg-white'>
            {photos.length === 1 ? (
              // Single photo layout with border
              <div className='w-full border border-gray-700 sm:border-2'>
                <img
                  src={photos[0] || '/placeholder.svg'}
                  alt='Photo'
                  className='w-full h-auto object-cover'
                />
              </div>
            ) : photos.length <= 3 && photos.length > 1 ? (
              // Vertical strip layout for 2-3 photos with borders
              <div className='flex flex-col gap-1 sm:gap-2'>
                {photos.map((photo, index) => (
                  <div key={index} className='w-full border border-gray-700 sm:border-2'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Strip photo ${index + 1}`}
                      className='w-full h-auto object-cover'
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Grid layout for 4+ photos with borders
              <div className='grid grid-cols-2 gap-1 sm:gap-2'>
                {photos.map((photo, index) => (
                  <div key={index} className='w-full border border-gray-700 sm:border-2'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Strip photo ${index + 1}`}
                      className='w-full h-auto object-cover'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto'>
        <Button
          onClick={onReset}
          variant='outline'
          size='lg'
          className='w-full sm:w-auto text-sm sm:text-base'>
          <RefreshCw className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
          {t.takeNewStrip}
        </Button>

        <Button
          onClick={onDownload}
          size='lg'
          className='bg-pink-500 hover:bg-pink-600 w-full sm:w-auto text-sm sm:text-base'
          disabled={isLoading}>
          <Download className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
          {t.downloadStrip}
        </Button>
      </div>
    </div>
  );
}
