'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Position {
  x: number;
  y: number;
}

interface DraggableStickerProps {
  readonly id: string;
  readonly src: string;
  readonly name: string;
  readonly onRemove: (id: string) => void;
  readonly initialPosition?: Position;
  readonly initialSize?: number;
}

export default function DraggableSticker({
  id,
  src,
  name,
  onRemove,
  initialPosition = { x: 50, y: 50 },
  initialSize = 80,
}: DraggableStickerProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [isMobile, setIsMobile] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  useEffect(() => {
    // Simple mobile detection
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (stickerRef.current) {
      const rect = stickerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling during drag
    if (stickerRef.current && e.touches[0]) {
      const touch = e.touches[0];
      const rect = stickerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
      setIsDragging(true);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onRemove(id);
      }
    },
    [id, onRemove],
  );

  const resetSize = useCallback(() => {
    setSize(initialSize);
  }, [initialSize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && stickerRef.current) {
        const containerRect = stickerRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const newX = e.clientX - containerRect.left - dragOffset.current.x;
          const newY = e.clientY - containerRect.top - dragOffset.current.y;

          // Constrain to container bounds
          const maxX = containerRect.width - size;
          const maxY = containerRect.height - size;

          setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && stickerRef.current && e.touches[0]) {
        const touch = e.touches[0];
        const containerRect = stickerRef.current.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const newX = touch.clientX - containerRect.left - dragOffset.current.x;
          const newY = touch.clientY - containerRect.top - dragOffset.current.y;

          // Constrain to container bounds
          const maxX = containerRect.width - size;
          const maxY = containerRect.height - size;

          setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY)),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, size]);

  // Handle wheel for resizing
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 5 : -5;
    setSize((prevSize) => Math.max(40, Math.min(200, prevSize + delta)));
  }, []);

  return (
    <div
      className='sticker-positioned'
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}>
      <div
        ref={stickerRef}
        className='sticker'
        role='button'
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => isMobile && setShowControls(!showControls)}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}>
        <img
          src={src ?? '/placeholder.svg'}
          alt={name}
          className='object-contain select-none'
          draggable='false'
          width={size}
          height={size}
        />

        {showControls && (
          <div className='sticker-controls'>
            <Button
              variant='destructive'
              size='icon'
              className='h-5 w-5 sm:h-6 sm:w-6 rounded-full mr-1'
              onClick={() => onRemove(id)}>
              <X className='h-3 w-3' />
            </Button>
            <Button
              variant='secondary'
              size='icon'
              className='h-5 w-5 sm:h-6 sm:w-6 rounded-full'
              onClick={resetSize}
              title='Reset size'>
              <RotateCcw className='h-3 w-3' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
