# Photo Booth Web App

A fully responsive photo booth web application with internationalization, real-time camera capture, sticker overlay, and contact form functionality.

## Features

- 📸 Real-time camera capture with preview
- 🎨 Drag-and-drop SVG stickers with resizing
- 🌍 Multi-language support (English, Spanish, French, German, Portuguese)
- 📱 Fully responsive design for mobile and desktop
- 📧 Contact form with email delivery
- 🎯 Professional UI with modern design
- ♿ Accessibility features and keyboard navigation

## Setup

### Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Configure Web3Forms for email delivery:
   - Sign up for a free account at [web3forms.com](https://web3forms.com/)
   - Create a new form
   - Copy your access key and update `.env`:
     ```
     WEB3FORMS_ACCESS_KEY=your_actual_access_key_here
     SUPPORT_EMAIL=your_email@example.com
     ```

### Installation

1. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

2. Run the development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Email Configuration

The support form uses Web3Forms API for email delivery with a fallback to mailto links. When properly configured with your Web3Forms access key:

1. Form submissions are sent via Web3Forms API
2. If the API fails, the form falls back to opening the user's default email client
3. All form data is validated both client-side and server-side

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/support/       # API route for form submission
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms of service page
│   └── support/           # Support/contact page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── photo-booth.tsx   # Main photo booth component
│   ├── sticker-selector.tsx # Sticker selection interface
│   └── ...
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and data
└── public/              # Static assets
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Web3Forms** - Form submission and email delivery service

## License

This project is private and proprietary.
