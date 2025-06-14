export interface Background {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string;
  preview: string;
  category: 'solid' | 'gradient' | 'pattern' | 'frame';
}

export interface Frame {
  id: string;
  name: string;
  src: string;
  preview: string;
  category: 'border' | 'decorative' | 'theme';
}

export const backgrounds: Background[] = [
  // Solid Colors
  {
    id: 'white',
    name: 'White',
    type: 'color',
    value: '#ffffff',
    preview: '#ffffff',
    category: 'solid',
  },
  {
    id: 'pink-soft',
    name: 'Soft Pink',
    type: 'color',
    value: '#fce7f3',
    preview: '#fce7f3',
    category: 'solid',
  },
  {
    id: 'blue-soft',
    name: 'Soft Blue',
    type: 'color',
    value: '#dbeafe',
    preview: '#dbeafe',
    category: 'solid',
  },
  {
    id: 'yellow-soft',
    name: 'Soft Yellow',
    type: 'color',
    value: '#fef3c7',
    preview: '#fef3c7',
    category: 'solid',
  },
  {
    id: 'green-soft',
    name: 'Soft Green',
    type: 'color',
    value: '#d1fae5',
    preview: '#d1fae5',
    category: 'solid',
  },
  {
    id: 'purple-soft',
    name: 'Soft Purple',
    type: 'color',
    value: '#e9d5ff',
    preview: '#e9d5ff',
    category: 'solid',
  },

  // Gradients
  {
    id: 'sunset',
    name: 'Sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    category: 'gradient',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'gradient',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    type: 'gradient',
    value:
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #a8edea 75%, #fed6e3 100%)',
    preview:
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #a8edea 75%, #fed6e3 100%)',
    category: 'gradient',
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'gradient',
  },

  // Patterns
  {
    id: 'polka-dots',
    name: 'Polka Dots',
    type: 'pattern',
    value:
      'radial-gradient(circle at 25% 25%, #fce7f3 2px, transparent 2px), radial-gradient(circle at 75% 75%, #fce7f3 2px, transparent 2px)',
    preview:
      'radial-gradient(circle at 25% 25%, #fce7f3 2px, transparent 2px), radial-gradient(circle at 75% 75%, #fce7f3 2px, transparent 2px)',
    category: 'pattern',
  },
  {
    id: 'stripes',
    name: 'Stripes',
    type: 'pattern',
    value:
      'repeating-linear-gradient(45deg, #f8fafc 0px, #f8fafc 10px, #e2e8f0 10px, #e2e8f0 20px)',
    preview:
      'repeating-linear-gradient(45deg, #f8fafc 0px, #f8fafc 10px, #e2e8f0 10px, #e2e8f0 20px)',
    category: 'pattern',
  },
];

export const frames: Frame[] = [
  {
    id: 'none',
    name: 'None',
    src: '',
    preview: '',
    category: 'border',
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    src:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        <rect x="0" y="0" width="400" height="500" fill="white" rx="8" filter="url(#shadow)"/>
        <rect x="20" y="20" width="360" height="360" fill="transparent" stroke="#e5e5e5" stroke-width="1"/>
      </svg>
    `),
    preview:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="60" height="75" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="60" height="75" fill="white" rx="2"/>
        <rect x="3" y="3" width="54" height="54" fill="transparent" stroke="#e5e5e5" stroke-width="1"/>
      </svg>
    `),
    category: 'border',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    src:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="vintagePattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#8b4513"/>
            <rect x="0" y="0" width="10" height="10" fill="#a0522d"/>
            <rect x="10" y="10" width="10" height="10" fill="#a0522d"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="400" fill="url(#vintagePattern)"/>
        <rect x="30" y="30" width="340" height="340" fill="transparent" stroke="#654321" stroke-width="8"/>
        <rect x="20" y="20" width="360" height="360" fill="transparent" stroke="#8b4513" stroke-width="4"/>
      </svg>
    `),
    preview:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="60" height="60" fill="#8b4513"/>
        <rect x="5" y="5" width="50" height="50" fill="transparent" stroke="#654321" stroke-width="2"/>
      </svg>
    `),
    category: 'decorative',
  },
  {
    id: 'gold',
    name: 'Gold Frame',
    src:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="400" fill="url(#goldGrad)" rx="20"/>
        <rect x="30" y="30" width="340" height="340" fill="transparent" stroke="#b8860b" stroke-width="4"/>
        <rect x="20" y="20" width="360" height="360" fill="transparent" stroke="#ffd700" stroke-width="2"/>
      </svg>
    `),
    preview:
      'data:image/svg+xml;base64,' +
      btoa(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#b8860b;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="60" height="60" fill="url(#goldGradSmall)" rx="3"/>
        <rect x="5" y="5" width="50" height="50" fill="transparent" stroke="#b8860b" stroke-width="1"/>
      </svg>
    `),
    category: 'decorative',
  },
];
