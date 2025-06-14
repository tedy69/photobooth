# Contributing to Advanced PhotoBooth App

Thank you for your interest in contributing to the Advanced PhotoBooth App! We welcome contributions from developers of all skill levels.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/tedy69/photobooth
   cd photobooth
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start development server:**
   ```bash
   npm run dev
   ```
5. **Open http://localhost:3000** to see the app

## 📋 Development Guidelines

### **Code Style**

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Run `npm run format` before committing
- **Linting**: Ensure `npm run lint` passes without errors
- **Type Safety**: Run `npm run type-check` to verify TypeScript compliance

### **Commit Messages**

Use clear, descriptive commit messages following this format:
```
type(scope): description

feat(stickers): add rotation support for SVG stickers
fix(camera): resolve permission error on Safari
docs(readme): update installation instructions
refactor(hooks): simplify camera state management
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### **Branch Naming**

- `feature/description` - New features
- `fix/issue-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/component-name` - Code refactoring

## 🔧 Development Setup

### **Prerequisites**
- Node.js 18+
- npm 8+ (or pnpm/yarn)
- Modern browser with camera support

### **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Add your configuration (optional for development)
WEB3FORMS_ACCESS_KEY=your_key_here
SUPPORT_EMAIL=your_email@example.com
```

### **Testing Your Changes**
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Test the production build
npm run preview
```

## 🎯 Areas for Contribution

### **High Priority**
- 🧪 **Unit Tests**: Add tests for custom hooks and components
- 🌐 **New Languages**: Add translations for additional languages
- 🎨 **New Stickers**: Add SVG sticker collections
- 📱 **PWA Features**: Enhance progressive web app capabilities

### **Medium Priority**
- 🖼️ **New Templates**: Add photo strip layouts
- 🎨 **Themes**: Implement dark/light mode
- 📊 **Analytics**: Add usage analytics (privacy-focused)
- 🔄 **Animations**: Enhance UI transitions

### **Feature Ideas**
- 📤 **Social Sharing**: Direct sharing to social platforms
- 🎵 **Sound Effects**: Camera sounds and UI feedback
- 📋 **Print Support**: Direct printing functionality
- ☁️ **Cloud Storage**: Optional cloud backup

## 📝 Pull Request Process

### **Before Submitting**

1. **Ensure your code follows our guidelines**
2. **Test thoroughly on multiple browsers**
3. **Update documentation if needed**
4. **Add/update translations for new features**

### **PR Description Template**

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested on Chrome/Edge
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile devices
- [ ] All existing features work

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional information or context
```

### **Review Process**

1. **Automated checks** must pass (linting, type checking, build)
2. **Manual review** by maintainers
3. **Testing** on different browsers/devices
4. **Feedback** and requested changes
5. **Approval and merge**

## 🐛 Reporting Bugs

### **Before Reporting**
- Check existing issues for duplicates
- Test on the latest version
- Try reproducing in incognito/private mode

### **Bug Report Should Include**
- **Browser/Device**: Chrome 120, iPhone 15, etc.
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots/Videos**: If applicable
- **Console errors**: Any JavaScript errors

## 💡 Requesting Features

### **Feature Request Guidelines**
- **Use case**: Explain why this feature is needed
- **Proposed solution**: Describe your ideal implementation
- **Alternatives**: Other ways to solve the problem
- **Additional context**: Screenshots, mockups, etc.

## 🏗️ Architecture Guide

### **Project Structure**
```
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   └── *.tsx            # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and data
│   ├── translations/    # i18n translations
│   └── *.ts            # Helper utilities
├── app/                 # Next.js app directory
└── public/              # Static assets
```

### **Key Patterns**
- **Custom Hooks**: Business logic separated into reusable hooks
- **Component Composition**: Small, focused components
- **Type Safety**: TypeScript interfaces for all data structures
- **Internationalization**: All user-facing text must be translatable

## 🤝 Community Guidelines

### **Be Respectful**
- Use inclusive language
- Be patient with newcomers
- Provide constructive feedback
- Help others learn and grow

### **Communication**
- **Issues**: For bug reports and feature requests
- **Discussions**: For questions and general conversation
- **Pull Requests**: For code contributions
- **Email**: For security issues only

## 📚 Learning Resources

### **Technologies Used**
- **Next.js**: [Official Documentation](https://nextjs.org/docs)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Fabric.js**: [Fabric.js Documentation](http://fabricjs.com/docs/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)

### **Getting Help**
- **Documentation**: Start with our comprehensive README
- **Code Comments**: Most complex logic is documented inline
- **Issues**: Ask questions in GitHub issues
- **Community**: Join discussions for broader topics

## 🙏 Recognition

All contributors will be:
- **Listed** in our contributors section
- **Thanked** in release notes for significant contributions
- **Credited** for their specific contributions

Thank you for helping make the Advanced PhotoBooth App better for everyone! 🎉
