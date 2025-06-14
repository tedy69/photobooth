'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Palette, Image as ImageIcon } from 'lucide-react';
import { backgrounds, frames, type Background, type Frame } from '@/lib/backgrounds';

interface BackgroundFrameSelectorProps {
  readonly selectedBackground?: string;
  readonly selectedFrame?: string;
  readonly onSelectBackground: (background: Background) => void;
  readonly onSelectFrame: (frame: Frame) => void;
}

interface CategorySectionProps {
  readonly title: string;
  readonly items: Background[] | Frame[];
  readonly type: 'background' | 'frame';
  readonly selectedBackground?: string;
  readonly selectedFrame?: string;
  readonly onSelectBackground: (background: Background) => void;
  readonly onSelectFrame: (frame: Frame) => void;
}

function CategorySection({
  title,
  items,
  type,
  selectedBackground,
  selectedFrame,
  onSelectBackground,
  onSelectFrame,
}: CategorySectionProps) {
  return (
    <div className='mb-6'>
      <h4 className='text-sm font-medium text-gray-700 mb-3 capitalize'>{title}</h4>
      <div className='grid grid-cols-4 sm:grid-cols-6 gap-3'>
        {items.map((item) => {
          const isSelected =
            type === 'background' ? selectedBackground === item.id : selectedFrame === item.id;

          const handleClick = () => {
            if (type === 'background') {
              onSelectBackground(item as Background);
            } else {
              onSelectFrame(item as Frame);
            }
          };

          const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleClick();
            }
          };

          return (
            <div
              key={item.id}
              role='button'
              tabIndex={0}
              className={`
                relative border-2 rounded-lg cursor-pointer transition-all h-12 w-12 sm:h-16 sm:w-16 group
                ${
                  isSelected
                    ? 'border-pink-500 ring-2 ring-pink-200'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={handleClick}
              onKeyDown={handleKeyDown}>
              {/* Background Preview */}
              {type === 'background' && (
                <div
                  className='w-full h-full rounded-md border border-gray-300'
                  style={{
                    background: (item as Background).preview,
                    backgroundSize: '20px 20px',
                  }}
                />
              )}

              {/* Frame Preview */}
              {type === 'frame' && (
                <div className='w-full h-full rounded-md border border-gray-300 overflow-hidden'>
                  {item.id === 'none' ? (
                    <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                      <span className='text-xs text-gray-500'>None</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(item as Frame).preview}
                      alt={item.name}
                      className='w-full h-full object-cover'
                    />
                  )}
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className='absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-1'>
                  <Check className='h-3 w-3' />
                </div>
              )}

              {/* Tooltip */}
              <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10'>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BackgroundFrameSelector({
  selectedBackground,
  selectedFrame,
  onSelectBackground,
  onSelectFrame,
}: BackgroundFrameSelectorProps) {
  const [activeTab, setActiveTab] = useState('backgrounds');

  // Group backgrounds by category
  const backgroundsByCategory = backgrounds.reduce((acc, bg) => {
    if (!acc[bg.category]) acc[bg.category] = [];
    acc[bg.category].push(bg);
    return acc;
  }, {} as Record<string, Background[]>);

  // Group frames by category
  const framesByCategory = frames.reduce((acc, frame) => {
    if (!acc[frame.category]) acc[frame.category] = [];
    acc[frame.category].push(frame);
    return acc;
  }, {} as Record<string, Frame[]>);

  return (
    <Card className='w-full'>
      <CardContent className='p-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='backgrounds' className='flex items-center gap-2'>
              <Palette className='h-4 w-4' />
              <span className='hidden sm:inline'>Backgrounds</span>
            </TabsTrigger>
            <TabsTrigger value='frames' className='flex items-center gap-2'>
              <ImageIcon className='h-4 w-4' />
              <span className='hidden sm:inline'>Frames</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='backgrounds' className='mt-4 space-y-4'>
            <div className='max-h-60 overflow-y-auto'>
              {Object.entries(backgroundsByCategory).map(([category, items]) => (
                <CategorySection
                  key={category}
                  title={category}
                  items={items}
                  type='background'
                  selectedBackground={selectedBackground}
                  selectedFrame={selectedFrame}
                  onSelectBackground={onSelectBackground}
                  onSelectFrame={onSelectFrame}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value='frames' className='mt-4 space-y-4'>
            <div className='max-h-60 overflow-y-auto'>
              {Object.entries(framesByCategory).map(([category, items]) => (
                <CategorySection
                  key={category}
                  title={category}
                  items={items}
                  type='frame'
                  selectedBackground={selectedBackground}
                  selectedFrame={selectedFrame}
                  onSelectBackground={onSelectBackground}
                  onSelectFrame={onSelectFrame}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
