'use client';
import { Check } from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  size: string;
  aspectRatio: number;
  orientation: 'portrait' | 'landscape';
  photoCount: number;
  layout: 'vertical' | 'grid' | 'single';
  hasBorders?: boolean;
  flattened?: boolean;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3'>
      {templates.map((template) => (
        <div
          key={template.id}
          className={`
            relative border-2 rounded-md p-2 sm:p-3 cursor-pointer transition-all min-h-[120px] sm:min-h-auto
            ${
              selectedTemplate === template.id
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            }
          `}
          onClick={() => onSelectTemplate(template.id)}>
          <div className='flex flex-col items-center'>
            <div
              className={`
                w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 border border-gray-300 mb-1 sm:mb-2 flex items-center justify-center
                ${template.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}
              `}>
              {template.layout === 'vertical' && (
                <div className='flex flex-col gap-1 w-full h-full p-1'>
                  {Array.from({ length: template.photoCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-full h-full bg-gray-300 rounded-sm ${
                        template.hasBorders ? 'border border-gray-500' : ''
                      }`}></div>
                  ))}
                </div>
              )}

              {template.layout === 'grid' && (
                <div
                  className={`grid ${
                    template.photoCount === 4 
                      ? 'grid-cols-2' 
                      : template.photoCount === 6 
                      ? 'grid-cols-2 grid-rows-3' 
                      : 'grid-cols-2'
                  } gap-1 w-full h-full p-1`}>
                  {Array.from({ length: template.photoCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`bg-gray-300 rounded-sm ${
                        template.hasBorders ? 'border border-gray-500' : ''
                      }`}></div>
                  ))}
                </div>
              )}

              {template.layout === 'single' && (
                <div
                  className={`w-full h-full bg-gray-300 rounded-sm ${
                    template.hasBorders ? 'border border-gray-500' : ''
                  }`}></div>
              )}
            </div>
            <span className='font-medium text-xs sm:text-sm text-center'>{template.name}</span>
            <span className='text-xs text-gray-500'>{template.size}</span>
            <span className='text-xs text-gray-400 mt-1'>
              {template.photoCount} photo{template.photoCount > 1 ? 's' : ''}
            </span>
          </div>
          {selectedTemplate === template.id && (
            <div className='absolute top-1 right-1 sm:top-2 sm:right-2 bg-pink-500 rounded-full p-0.5'>
              <Check className='h-3 w-3 text-white' />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
