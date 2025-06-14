'use client';

import { useEffect, useState, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';

interface TimerIndicatorProps {
  interval: number;
  isActive: boolean;
  onIntervalComplete: () => void;
  currentPhotoIndex: number;
  totalPhotos: number;
}

export default function TimerIndicator({
  interval,
  isActive,
  onIntervalComplete,
  currentPhotoIndex,
  totalPhotos,
}: TimerIndicatorProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(interval);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);
  const activeRef = useRef(isActive);
  const photoIndexRef = useRef(currentPhotoIndex);
  const intervalCompleteRef = useRef(onIntervalComplete);

  // Update refs when props change to avoid stale closures
  useEffect(() => {
    activeRef.current = isActive;
    photoIndexRef.current = currentPhotoIndex;
    intervalCompleteRef.current = onIntervalComplete;
  }, [isActive, currentPhotoIndex, onIntervalComplete]);

  // Reset and manage timer
  useEffect(() => {
    // Clear any existing timer when component updates
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // If not active, reset state and exit
    if (!isActive) {
      setTimeLeft(interval);
      setProgress(100);
      completedRef.current = false;
      return;
    }

    // Reset state for new timer
    setTimeLeft(interval);
    setProgress(100);
    completedRef.current = false;

    // Start a new timer
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, interval - elapsed);
      const progressValue = (remaining / interval) * 100;

      setTimeLeft(remaining);
      setProgress(progressValue);

      // When timer reaches zero
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;

        // Stop the interval immediately to prevent multiple calls
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Call the completion handler after a small delay
        setTimeout(() => {
          intervalCompleteRef.current();
        }, 10);
      }
    }, 50); // More frequent updates for smoother progress

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [interval, isActive, totalPhotos, currentPhotoIndex]);

  if (!isActive) return null;

  // Calculate the current photo number (1-indexed)
  const currentPhotoNumber = currentPhotoIndex + 1;
  const displayPhotoNumber = Math.min(currentPhotoNumber, totalPhotos);

  return (
    <div className='absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-30 bg-black/20 p-1.5 sm:p-2 rounded-md'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-white font-medium text-xs sm:text-sm'>
          {currentPhotoIndex < totalPhotos
            ? `${t.nextPhotoIn} ${Math.ceil(timeLeft / 1000)}s`
            : t.processing}
        </span>
        <span className='text-white text-xs'>
          {displayPhotoNumber}/{totalPhotos}
        </span>
      </div>
      <Progress value={progress} className='h-1.5 sm:h-2' />
    </div>
  );
}
