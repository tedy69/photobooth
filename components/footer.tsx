'use client';

import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';


export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className='bg-gray-900 text-white mt-auto'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0'>
          {/* Left side - Brand */}
          <div className='flex items-center space-x-2'>
            <Sparkles className='h-5 w-5 text-pink-400' />
            <span className='text-sm font-medium'>{t.title}</span>
          </div>

          {/* Center - Made with love */}
          <div className='flex items-center space-x-2 text-sm text-gray-300'>
            <span>Made with</span>
            <Heart className='h-4 w-4 text-red-400 fill-current' />
            <span>by</span>
            <Link href='https://tedyfazrin.com' target='_blank' rel='noopener noreferrer'>
              <span className='text-blue-400'>Tedy Fazrin</span>
            </Link>
          </div>

          {/* Right side - Copyright */}
          <div className='text-sm text-gray-300'>
            <p>&copy; {new Date().getFullYear()} Photo Booth. All rights reserved.</p>
          </div>
        </div>

        {/* Bottom section */}
        <div className='mt-4 pt-4 border-t border-gray-700'>
          <div className='flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0'>
            <p className='text-xs text-gray-400'>Create amazing memories with friends and family</p>
            <div className='flex space-x-4 text-xs text-gray-400'>
              <Link href='/privacy' className='hover:text-white transition-colors'>
                {t.privacyPolicy}
              </Link>
              <span>•</span>
              <Link href='/terms' className='hover:text-white transition-colors'>
                {t.termsOfService}
              </Link>
              <span>•</span>
              <Link href='/support' className='hover:text-white transition-colors'>
                {t.supportCenter}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
