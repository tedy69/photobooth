import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate the form data
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Get environment variables
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
    const supportEmail = process.env.SUPPORT_EMAIL ?? 'gmail@tedyfazrin.com';

    if (!accessKey) {
      console.error('WEB3FORMS_ACCESS_KEY is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // Prepare the email data for Web3Forms
    const emailData = {
      access_key: accessKey,
      name: name,
      email: email,
      subject: `Photo Booth Support: ${subject}`,
      message: `
Support Request from Photo Booth App

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from Photo Booth App Support Form
Date: ${new Date().toLocaleString()}
User Agent: ${request.headers.get('user-agent')}
      `.trim(),
      to: supportEmail,
      from_name: 'Photo Booth App',
      reply_to: email,
    };

    // Send email via Web3Forms API
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: result.message ?? 'Unknown error',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Support form submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
