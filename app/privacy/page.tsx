'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/'>
          <Button variant='ghost' className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            {t.backToPhotoBooth}
          </Button>
        </Link>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t.privacyPolicy}</h1>
        <p className='text-gray-600'>{t.privacyLastUpdated.replace('{date}', 'June 13, 2025')}</p>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>{t.privacyInfoCollection}</CardTitle>
            <CardDescription>
              {t.privacyIntro}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyInfoCollectionText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyInfoUse}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyInfoUseText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyDataStorage}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyDataStorageText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyThirdParty}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyThirdPartyText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyUserRights}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyUserRightsText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyChanges}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>
              {t.privacyChangesText}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.privacyContact}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-700'>
              {t.privacyContactText}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
