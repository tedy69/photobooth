'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  initialCount: number;
  onCountdownComplete: () => void;
  onCountChange?: (count: number) => void;
  isActive: boolean;
}

export default function CountdownTimer({
  initialCount,
  onCountdownComplete,
  onCountChange,
  isActive,
}: CountdownTimerProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!isActive) {
      setCount(initialCount);
      return;
    }

    if (count <= 0) {
      onCountdownComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
      if (onCountChange) {
        onCountChange(count - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, initialCount, isActive, onCountdownComplete, onCountChange]);

  if (!isActive) return null;

  return (
    <div className='absolute inset-0 flex items-center justify-center z-30 bg-black/50'>
      <div className='text-6xl sm:text-8xl md:text-9xl font-bold text-white animate-pulse'>
        {count}
      </div>
    </div>
  );
}
