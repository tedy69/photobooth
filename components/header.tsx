'use client';

import { useLanguage } from '@/hooks/use-language';
import LanguageSelector from './language-selector';
import Image from 'next/image';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className='bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 sm:h-20'>
          {/* Logo and Title */}
          <div className='flex items-center space-x-3'>
            <div className='relative'>
              <Image
                src='/logo.svg'
                alt='Photo Booth Logo'
                width={40}
                height={40}
                className='h-8 w-8 sm:h-10 sm:w-10'
                priority
              />
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight'>
                {t.title ?? 'Photo Booth'}
              </h1>
              <p className='text-xs sm:text-sm text-white/80 hidden sm:block'>
                {t.description ?? 'Capture memories with style'}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className='flex items-center space-x-4'>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
