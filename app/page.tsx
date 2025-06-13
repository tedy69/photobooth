'use client';

import PhotoBooth from '@/components/photo-booth';
import { useLanguage } from '@/hooks/use-language';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className='w-full flex flex-col items-center justify-start p-2 sm:p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 min-h-full'>
      <div className='w-full max-w-4xl flex flex-col items-center'>
        <div className='text-center mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent px-2'>
            {t.createMoment ?? 'Create Beautiful Moments'}
          </h1>
          <p className='text-center text-gray-600 max-w-md text-sm sm:text-base px-4'>
            {t.description}
          </p>
        </div>
        <PhotoBooth />
      </div>
    </div>
  );
}
