'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/'>
          <Button variant='ghost' className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            {t.backToPhotoBooth}
          </Button>
        </Link>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t.termsOfService}</h1>
        <p className='text-gray-600'>{t.termsLastUpdated.replace('{date}', 'June 13, 2025')}</p>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{t.termsAcceptance}</CardTitle>
            <CardDescription>{t.termsIntro}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsAcceptanceText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsUse}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsUseText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsContent}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsContentText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsPrivacy}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsPrivacyText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsLimitations}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsLimitationsText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsModifications}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsModificationsText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsGoverning}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t.termsGoverningText}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.termsContactInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-700'>{t.termsContactInfoText}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
