# 📸 Advanced Photo Booth Web App

A sophisticated, fully-featured photo booth web application with real-time camera capture, professional photo strips, advanced sticker system, custom backgrounds/frames, and comprehensive internationalization support.

## ✨ Features

### 📸 Camera & Photo Capture

- **Real-time camera access** with high-quality photo capture
- **Multiple photo strip templates** (1-photo, 2-photo, 4-photo strips)
- **Professional photo layouts** (vertical strips, grid layouts, single photos)
- **Automatic photo strip composition** with proper spacing and borders
- **Flash effect** and smooth capture animations

### 🎨 Advanced Editing System

- **Custom backgrounds** (solid colors, gradients, patterns)
- **Professional frames** with various styles and effects
- **SVG sticker support** with PNG conversion for optimal rendering
- **Drag-and-drop sticker placement** with resize and rotation
- **Layered composition** (background → photo → stickers)
- **Real-time preview** with Fabric.js canvas integration

### 🖼️ Photo Management

- **Local photo gallery** with persistent storage
- **High-quality photo export** (JPEG with optimized compression)
- **Instant download functionality**
- **Photo strip creation** with multiple layouts
- **Background/frame application** before photo capture

### 🌍 Internationalization

- **7 language support**: English, Spanish, French, German, Japanese, Chinese, Portuguese
- **Dynamic language switching** with persistent preference
- **Localized UI elements** and user feedback messages
- **Right-to-left (RTL) text support** for applicable languages

### 📱 User Experience

- **Fully responsive design** optimized for mobile, tablet, and desktop
- **Progressive Web App (PWA) ready**
- **Accessibility compliant** with keyboard navigation and screen reader support
- **Modern Material Design** with smooth animations
- **Toast notifications** for user feedback
- **Loading states** and error handling

### 🔧 Technical Features

- **Modular architecture** with custom React hooks
- **TypeScript throughout** for type safety
- **Optimized performance** with lazy loading and code splitting
- **Professional build pipeline** with Next.js 14
- **Clean console output** (production-ready, no debug logs)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, pnpm, or yarn package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd photobooth
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
   SUPPORT_EMAIL=your_email@example.com
   ```

4. **Start development server:**

   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## 📋 How to Use

### 1. **Camera Setup**

- Grant camera permissions when prompted
- Position yourself in the camera view
- Select your preferred photo template (single photo or strip)

### 2. **Choose Background & Frame**

- Browse available backgrounds (colors, gradients, patterns)
- Select a decorative frame style
- Preview your selection in real-time

### 3. **Capture Photos**

- **Single Photo**: Click "Take Photo" for instant capture
- **Photo Strip**: Click "Take Photo" to start the timer sequence
  - Multiple photos captured automatically (every 5 seconds)
  - Timer shows progress and countdown
  - Complete strip created automatically

### 4. **Edit & Enhance**

- Add stickers by dragging from the sticker panel
- Resize stickers using corner handles
- Rotate stickers by dragging
- Remove stickers with delete key or remove button
- Change backgrounds/frames anytime

### 5. **Save & Share**

- Download high-quality images instantly
- Save to local gallery for later access
- Photos persist between sessions

## 🏗️ Architecture

### **Modular Design**

The app uses a clean, modular architecture with specialized hooks:

```typescript
// Custom Hooks
useCamera(); // Camera access, photo capture
useFabricStickers(); // Canvas management, stickers, backgrounds
usePhotoGallery(); // Local storage, photo management
useLanguage(); // Internationalization
```

### **Component Structure**

```
components/
├── photo-booth.tsx           # Main application logic
├── background-frame-selector.tsx  # Background/frame selection
├── sticker-selector.tsx      # Sticker browsing and selection
├── photo-gallery.tsx         # Gallery view and management
├── timer-indicator.tsx       # Photo strip countdown timer
└── ui/                      # Reusable UI components
```

### **State Management**

- **React hooks** for local component state
- **Context providers** for shared state (language, theme)
- **Local storage** for persistence (photos, preferences)
- **Canvas state** managed through Fabric.js integration

## 🛠️ Tech Stack

### **Frontend Framework**

- **Next.js 14** - React framework with App Router and server-side rendering
- **TypeScript** - Full type safety throughout the application
- **React 18** - Modern React with hooks and concurrent features

### **UI & Styling**

- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Headless, accessible component primitives
- **Lucide React** - Beautiful, customizable icon library
- **Fabric.js** - Powerful canvas library for image manipulation

### **Image Processing**

- **Canvas API** - Native browser image capture and processing
- **File API** - Handle image uploads and downloads
- **Base64 encoding** - Efficient image data management

### **Internationalization**

- **Custom i18n system** - Lightweight, type-safe translations
- **Dynamic imports** - Language bundles loaded on demand
- **Locale persistence** - User language preference storage

### **Development Tools**

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality
- **VS Code integration** - Optimized developer experience

## 🔧 Configuration

### **Environment Variables**

```env
# Email service configuration (optional)
WEB3FORMS_ACCESS_KEY=your_web3forms_key
SUPPORT_EMAIL=support@yoursite.com

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Browser Support**

- **Chrome/Edge** 90+ (full features)
- **Firefox** 88+ (full features)
- **Safari** 14+ (full features)
- **Mobile browsers** iOS 14+, Android 10+

### **Camera Requirements**

- HTTPS required for camera access (or localhost for development)
- User permission required for camera and microphone
- Fallback UI for devices without camera access

## 🤝 Contributing

We welcome contributions! This project is designed to be developer-friendly and extensible.

### **Development Workflow**

1. **Fork and clone:**

   ```bash
   git clone https://github.com/yourusername/photobooth.git
   cd photobooth
   ```

2. **Create feature branch:**

   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Install and develop:**

   ```bash
   npm install
   npm run dev
   ```

4. **Test your changes:**

   ```bash
   npm run build    # Ensure production build works
   npm run lint     # Check code style
   npm run type-check  # Verify TypeScript
   ```

5. **Submit pull request:**
   - Write clear commit messages
   - Include screenshots for UI changes
   - Update documentation as needed

### **Adding New Features**

#### **New Stickers**

Add SVG files to `/public/stickers/` and they'll be automatically available.

#### **New Languages**

1. Create translation file in `/lib/translations/[locale].ts`
2. Export from `/lib/translations/index.ts`
3. Follow existing translation key structure

#### **New Photo Templates**

Add templates to `/lib/frames.ts` with layout specifications.

#### **New Backgrounds**

Add background definitions to `/lib/backgrounds.ts` with type and properties.

### **Code Style**

- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include accessibility features
- Write meaningful comments for complex logic

## 🐛 Troubleshooting

### **Camera Issues**

- **Permission denied**: Ensure HTTPS or localhost
- **No camera detected**: Check browser permissions
- **Poor quality**: Verify camera resolution settings

### **Performance Issues**

- **Slow sticker rendering**: Check browser Canvas API support
- **Memory usage**: Clear gallery periodically on mobile devices
- **Build issues**: Ensure Node.js 18+ is installed

### **Language Issues**

- **Missing translations**: Check translation file completeness
- **Incorrect locale**: Verify browser language settings

## 📄 License

**MIT License** - Feel free to use this project for personal or commercial purposes.

### Quick License Summary:

✅ **Commercial use allowed**  
✅ **Modification allowed**  
✅ **Distribution allowed**  
✅ **Private use allowed**

📋 **License text must be included**  
📋 **Copyright notice must be preserved**

See [LICENSE](LICENSE) file for full details.

## 👨‍💻 Author & Support

**Created by [Tedy Fazrin](https://tedyfazrin.com)**

### **Get Help:**

- 🐛 **Bug reports**: [Create an issue](../../issues/new)
- 💡 **Feature requests**: [Start a discussion](../../discussions)
- 📧 **Direct contact**: Use the app's contact form
- 📚 **Documentation**: Check this README and code comments

### **Stay Updated:**

- ⭐ **Star this repo** to get notifications
- 👀 **Watch releases** for new features
- 🍴 **Fork for your own customizations**

---

**Made with ❤️ for the developer community**
