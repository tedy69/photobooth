'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Sticker } from '@/lib/frames';
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';

interface StickerSelectorProps {
  readonly stickers: Sticker[];
  readonly onSelectSticker: (sticker: Sticker) => void;
}

export default function StickerSelector({ stickers, onSelectSticker }: StickerSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter stickers based on search and category
  const filteredStickers = useMemo(() => {
    return stickers.filter((sticker) => {
      const matchesCategory = selectedCategory === 'all' || sticker.category === selectedCategory;
      return matchesCategory;
    });
  }, [stickers, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(stickers.map((s) => s.category).filter((cat): cat is string => Boolean(cat))),
    );
    return ['all', ...cats];
  }, [stickers]);

  // Check scroll position to show/hide arrow buttons
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition, filteredStickers]);

  const handleScrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const handleScrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className='space-y-4'>
      {/* Search and filters */}
      <div className='space-y-3'>
        {/* Category filter */}
        <div className='relative'>
          {/* Mobile: Horizontal scroll with better styling */}
          <div className='flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size='sm'
                className='whitespace-nowrap flex-shrink-0 min-w-fit px-3 py-2 text-xs sm:text-sm snap-start
                           border-2 transition-all duration-200
                           hover:border-pink-300 focus:border-pink-400
                           active:scale-95'
                onClick={() => setSelectedCategory(category)}>
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
          {/* Mobile scroll indicators */}
          <div className='flex justify-center mt-2 gap-1 sm:hidden'>
            {categories.map((category, index) => (
              <div
                key={`indicator-${category}-${index}`}
                className='w-1.5 h-1.5 rounded-full bg-gray-300'
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stickers with native horizontal scrolling */}
      <div className='relative'>
        {/* Left scroll button */}
        {canScrollLeft && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute left-0 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 top-1/2 transform -translate-y-1/2'
            onClick={handleScrollLeft}
            aria-label='Scroll left'>
            <ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
          </Button>
        )}

        {/* Scrollable container - Native scroll with touch support */}
        <div ref={scrollContainerRef} className='mobile-scroll scrollbar-hide sm:overflow-x-auto'>
          <div className='flex gap-2 sm:gap-4 py-2 min-w-max'>
            {filteredStickers.length > 0 ? (
              filteredStickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type='button'
                  className='sticker-item relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-pink-300 hover:scale-105 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:border-pink-400 active:scale-95'
                  onClick={() => onSelectSticker(sticker)}
                  title={sticker.name}>
                  <img
                    src={sticker.src ?? '/placeholder.svg'}
                    alt={sticker.name}
                    className='w-full h-full object-contain p-1'
                    draggable={false}
                  />
                </button>
              ))
            ) : (
              <div className='flex items-center justify-center w-full py-8 text-gray-500'>
                <p>No stickers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-0 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 top-1/2 transform -translate-y-1/2'
            onClick={handleScrollRight}
            aria-label='Scroll right'>
            <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5' />
          </Button>
        )}
      </div>
    </div>
  );
}
