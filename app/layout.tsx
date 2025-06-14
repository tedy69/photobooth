import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/hooks/use-language';
import Header from '@/components/header';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Photo Booth - Capture & Create Amazing Photos',
    template: '%s | Photo Booth',
  },
  description:
    'Professional photo booth web app with real-time camera capture, fun stickers, and instant downloads. Perfect for events, parties, and creating memorable moments.',
  keywords: [
    'photo booth',
    'camera app',
    'photo editing',
    'stickers',
    'instant photos',
    'web camera',
    'photo filters',
    'event photography',
    'party photos',
    'selfie app',
  ],
  authors: [{ name: 'Tedy Fazrin' }],
  creator: 'Tedy Fazrin',
  publisher: 'Tedy Fazrin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://photobooth.tedyfazrin.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
      'fr-FR': '/fr-FR',
      'de-DE': '/de-DE',
      'pt-BR': '/pt-BR',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://photobooth.tedyfazrin.com',
    title: 'Photo Booth - Capture & Create Amazing Photos',
    description:
      'Professional photo booth web app with real-time camera capture, fun stickers, and instant downloads. Perfect for events, parties, and creating memorable moments.',
    siteName: 'Photo Booth',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Photo Booth App - Capture Amazing Photos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo Booth - Capture & Create Amazing Photos',
    description:
      'Professional photo booth web app with real-time camera capture, fun stickers, and instant downloads.',
    images: ['/og-image.svg'],
    creator: '@tedyfazrin',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'photography',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Photo Booth',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#667EEA',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#667EEA',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

        {/* Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Photo Booth',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Web Browser',
              url: 'https://photobooth.tedyfazrin.com',
              description:
                'Professional photo booth web app with real-time camera capture, fun stickers, and instant downloads. Perfect for events, parties, and creating memorable moments.',
              author: {
                '@type': 'Person',
                name: 'Tedy Fazrin',
                url: 'https://tedyfazrin.com',
              },
              creator: {
                '@type': 'Person',
                name: 'Tedy Fazrin',
                url: 'https://tedyfazrin.com',
              },
              dateCreated: '2025-06-13',
              dateModified: '2025-06-13',
              inLanguage: ['en', 'es', 'fr', 'de', 'pt'],
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              featureList: [
                'Real-time camera capture',
                'Photo editing with stickers',
                'Instant photo download',
                'Responsive design',
                'Multi-language support',
                'Professional quality output',
              ],
              image: 'https://photobooth.tedyfazrin.com/og-image.svg',
              softwareVersion: '1.0.0',
              requirements: 'Modern web browser with camera access',
              browserRequirements: 'HTML5, JavaScript, WebRTC',
              permissions: 'Camera access for photo capture',
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange>
          <LanguageProvider>
            <div className='min-h-screen flex flex-col'>
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </div>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
