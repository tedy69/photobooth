'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Camera,
  Download,
  Smartphone,
  HelpCircle,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

export default function SupportPage() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit function that uses Web3Forms API with fallback to mailto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Try to submit via API first (Web3Forms)
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('API submission failed');
      }
    } catch {
      // Fallback to mailto
      const mailtoLink = `mailto:${t.directEmail}?subject=${encodeURIComponent(
        formData.subject,
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
      )}`;

      window.location.href = mailtoLink;
      setSubmitStatus('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-6'>
        <Link href='/'>
          <Button variant='ghost' className='mb-4'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            {t.backToPhotoBooth}
          </Button>
        </Link>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>{t.supportCenter}</h1>
        <p className='text-gray-600'>{t.supportDescription}</p>
      </div>

      <div className='space-y-8'>
        {/* FAQ Section */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <HelpCircle className='h-5 w-5' />
                {t.faqTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Camera className='h-4 w-4' />
                  {t.faqQuestion1}
                </h3>
                <p className='text-gray-700 text-sm'>{t.faqAnswer1}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  {t.faqQuestion2}
                </h3>
                <p className='text-gray-700 text-sm'>{t.faqAnswer2}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2 flex items-center gap-2'>
                  <Smartphone className='h-4 w-4' />
                  {t.faqQuestion3}
                </h3>
                <p className='text-gray-700 text-sm'>{t.faqAnswer3}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>{t.faqQuestion4}</h3>
                <p className='text-gray-700 text-sm'>{t.faqAnswer4}</p>
              </div>
              <div>
                <h3 className='font-semibold mb-2'>{t.faqQuestion5}</h3>
                <p className='text-gray-700 text-sm'>{t.faqAnswer5}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5' />
                {t.contactForm}
              </CardTitle>
              <CardDescription>{t.contactFormDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <Label htmlFor='name'>{t.yourName}</Label>
                  <Input
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='email'>{t.yourEmail}</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='subject'>{t.subject}</Label>
                  <Input
                    id='subject'
                    name='subject'
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='message'>{t.message}</Label>
                  <Textarea
                    id='message'
                    name='message'
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className='flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md'>
                    <CheckCircle className='h-4 w-4' />
                    <span className='text-sm'>{t.emailSent}</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className='flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md'>
                    <AlertCircle className='h-4 w-4' />
                    <span className='text-sm'>{t.emailError}</span>
                  </div>
                )}

                <Button type='submit' disabled={isSubmitting} className='w-full'>
                  {isSubmitting ? t.sending : t.send}
                </Button>
              </form>

              {/* Direct Contact Option */}
              <div className='mt-6 pt-6 border-t'>
                <div className='flex items-center gap-2 mb-2'>
                  <Mail className='h-4 w-4' />
                  <h3 className='font-semibold'>{t.contactDirect}</h3>
                </div>
                <p className='text-sm text-gray-600 mb-2'>{t.contactDirectDescription}</p>
                <a
                  href={`mailto:${t.directEmail}`}
                  className='text-blue-600 hover:underline text-sm'>
                  {t.directEmail}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
