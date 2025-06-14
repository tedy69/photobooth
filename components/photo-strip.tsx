'use client';

import { useRef, useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface PhotoStripProps {
  readonly photos: readonly string[];
  readonly selectedTemplate?: string;
}

export default function PhotoStrip({ photos, selectedTemplate = '4x1' }: PhotoStripProps) {
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
          className='bg-white p-2 sm:p-4 shadow-lg rounded-md max-w-sm mx-auto overflow-auto'>
          <div className='border-2 sm:border-4 border-black p-1 sm:p-2 bg-white'>
            {selectedTemplate === '1x1' ? (
              // Single photo layout
              <div className='w-full border border-gray-700 sm:border-2 aspect-square'>
                <img
                  src={photos[0] || '/placeholder.svg'}
                  alt='Captured moment'
                  className='w-full h-full object-cover'
                />
              </div>
            ) : selectedTemplate === '4x1' ? (
              // Vertical strip layout for 4 photos
              <div className='flex flex-col gap-1 sm:gap-2 aspect-[1/3]'>
                {photos.slice(0, 4).map((photo, index) => (
                  <div key={`photo-${index}`} className='flex-1 border border-gray-700 sm:border-2'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Moment ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
            ) : selectedTemplate === '3x1' ? (
              // Vertical strip layout for 3 photos
              <div className='flex flex-col gap-1 sm:gap-2 aspect-[1/2.25]'>
                {photos.slice(0, 3).map((photo, index) => (
                  <div key={`photo-${index}`} className='flex-1 border border-gray-700 sm:border-2'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Moment ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
            ) : selectedTemplate === '2x2' ? (
              // 2x2 grid layout
              <div className='grid grid-cols-2 gap-1 sm:gap-2 aspect-square'>
                {photos.slice(0, 4).map((photo, index) => (
                  <div
                    key={`photo-${index}`}
                    className='border border-gray-700 sm:border-2 aspect-square'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Moment ${index + 1}`}
                      className='w-full h-full object-cover'
                    />
                  </div>
                ))}
              </div>
            ) : selectedTemplate === '3x3' ? (
              // 3x3 layout (triangular arrangement)
              <div className='flex flex-col gap-1 sm:gap-2 aspect-square'>
                {/* Top row - single photo centered */}
                <div className='flex justify-center flex-1'>
                  <div className='w-1/2 border border-gray-700 sm:border-2 aspect-square'>
                    <img
                      src={photos[0] || '/placeholder.svg'}
                      alt='Moment 1'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
                {/* Bottom row - two photos */}
                <div className='grid grid-cols-2 gap-1 sm:gap-2 flex-1'>
                  {photos.slice(1, 3).map((photo, index) => (
                    <div
                      key={`photo-${index + 1}`}
                      className='border border-gray-700 sm:border-2 aspect-square'>
                      <img
                        src={photo || '/placeholder.svg'}
                        alt={`Moment ${index + 2}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Default vertical layout
              <div className='flex flex-col gap-1 sm:gap-2'>
                {photos.map((photo, index) => (
                  <div key={`photo-${index}`} className='w-full border border-gray-700 sm:border-2'>
                    <img
                      src={photo || '/placeholder.svg'}
                      alt={`Moment ${index + 1}`}
                      className='w-full h-auto object-cover'
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
