export interface Sticker {
  id: string;
  name: string;
  src: string;
  category?: string;
  tags?: string[];
}

// Helper function to create SVG data URLs
function createSVGDataURL(svgContent: string): string {
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
}

// Real SVG sticker data
export const stickerSVGs = {
  sunglasses: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#333;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#000;stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <!-- Frame -->
      <path d="M15 35 Q20 30 30 30 L45 30 Q50 25 55 30 L70 30 Q75 30 80 35 Q85 40 80 50 Q75 55 65 55 L55 55 Q50 60 45 55 L35 55 Q25 55 20 50 Q15 40 15 35 Z" 
            fill="#2c2c2c" stroke="#000" stroke-width="2"/>
      <!-- Left lens -->
      <ellipse cx="32" cy="42" rx="12" ry="8" fill="url(#glassGrad)" opacity="0.8"/>
      <!-- Right lens -->
      <ellipse cx="68" cy="42" rx="12" ry="8" fill="url(#glassGrad)" opacity="0.8"/>
      <!-- Bridge -->
      <rect x="44" y="40" width="12" height="4" rx="2" fill="#2c2c2c"/>
      <!-- Reflection on left lens -->
      <ellipse cx="28" cy="38" rx="3" ry="2" fill="#fff" opacity="0.6"/>
      <!-- Reflection on right lens -->
      <ellipse cx="64" cy="38" rx="3" ry="2" fill="#fff" opacity="0.6"/>
    </svg>
  `),

  mustache: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50 Q25 45 35 47 Q45 48 50 45 Q55 48 65 47 Q75 45 80 50 Q75 55 65 53 Q55 52 50 55 Q45 52 35 53 Q25 55 20 50 Z" 
            fill="#2c1810" stroke="#1a0f08" stroke-width="1"/>
      <!-- Highlight -->
      <path d="M22 48 Q27 46 32 47 Q42 48 48 46" 
            fill="none" stroke="#4a3020" stroke-width="1" opacity="0.6"/>
    </svg>
  `),

  crown: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffb347;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Crown base -->
      <rect x="20" y="60" width="60" height="8" fill="url(#crownGrad)" stroke="#e6b800" stroke-width="1"/>
      <!-- Crown spikes -->
      <polygon points="25,60 35,35 40,60" fill="url(#crownGrad)" stroke="#e6b800" stroke-width="1"/>
      <polygon points="40,60 50,25 60,60" fill="url(#crownGrad)" stroke="#e6b800" stroke-width="1"/>
      <polygon points="60,60 70,35 75,60" fill="url(#crownGrad)" stroke="#e6b800" stroke-width="1"/>
      <!-- Gems -->
      <circle cx="30" cy="45" r="3" fill="#ff6b6b"/>
      <circle cx="50" cy="35" r="4" fill="#4ecdc4"/>
      <circle cx="70" cy="45" r="3" fill="#45b7d1"/>
      <!-- Crown band details -->
      <rect x="22" y="62" width="56" height="2" fill="#ffed4e"/>
    </svg>
  `),

  heart: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff1744;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M50 75 Q35 60 25 45 Q20 35 25 25 Q35 20 45 30 Q50 35 50 35 Q50 35 55 30 Q65 20 75 25 Q80 35 75 45 Q65 60 50 75 Z" 
            fill="url(#heartGrad)" stroke="#d50000" stroke-width="1"/>
      <!-- Highlight -->
      <ellipse cx="42" cy="35" rx="6" ry="4" fill="#ffb3ba" opacity="0.6"/>
    </svg>
  `),

  star: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffc107;stop-opacity:1" />
        </linearGradient>
      </defs>
      <polygon points="50,15 58,35 80,35 62,50 70,70 50,58 30,70 38,50 20,35 42,35" 
               fill="url(#starGrad)" stroke="#ff8f00" stroke-width="1"/>
      <!-- Highlight -->
      <polygon points="50,20 55,32 65,32 57,40 60,52 50,46 40,52 43,40 35,32 45,32" 
               fill="#fff9c4" opacity="0.6"/>
    </svg>
  `),

  bowtie: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="1.5" fill="#fff" opacity="0.7"/>
        </pattern>
      </defs>
      <!-- Left wing -->
      <path d="M20 40 Q15 45 15 50 Q15 55 20 60 Q30 58 35 50 Q30 42 20 40 Z" 
            fill="#8b0000" stroke="#5c0000" stroke-width="1"/>
      <!-- Right wing -->
      <path d="M80 40 Q85 45 85 50 Q85 55 80 60 Q70 58 65 50 Q70 42 80 40 Z" 
            fill="#8b0000" stroke="#5c0000" stroke-width="1"/>
      <!-- Center knot -->
      <rect x="45" y="45" width="10" height="10" rx="2" fill="#2c2c2c" stroke="#000" stroke-width="1"/>
      <!-- Pattern overlay -->
      <path d="M20 40 Q15 45 15 50 Q15 55 20 60 Q30 58 35 50 Q30 42 20 40 Z" fill="url(#dots)"/>
      <path d="M80 40 Q85 45 85 50 Q85 55 80 60 Q70 58 65 50 Q70 42 80 40 Z" fill="url(#dots)"/>
    </svg>
  `),

  speechBubble: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Main bubble -->
      <ellipse cx="50" cy="40" rx="30" ry="20" fill="url(#bubbleGrad)" stroke="#ddd" stroke-width="2"/>
      <!-- Bubble tail -->
      <path d="M35 55 Q30 65 25 70 Q35 65 40 58 Z" fill="url(#bubbleGrad)" stroke="#ddd" stroke-width="2"/>
      <!-- Text lines -->
      <line x1="35" y1="35" x2="65" y2="35" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="35" y1="42" x2="60" y2="42" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="35" y1="49" x2="55" y2="49" stroke="#666" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  hat: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2c2c2c;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Hat brim -->
      <ellipse cx="50" cy="65" rx="35" ry="8" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
      <!-- Hat crown -->
      <path d="M25 65 Q25 40 30 35 Q35 30 50 30 Q65 30 70 35 Q75 40 75 65 Z" 
            fill="url(#hatGrad)" stroke="#000" stroke-width="1"/>
      <!-- Hat band -->
      <rect x="25" y="58" width="50" height="7" fill="#8b0000" stroke="#5c0000" stroke-width="1"/>
      <!-- Highlight -->
      <path d="M30 45 Q35 35 45 35 Q40 40 35 50" fill="#6a6a6a" opacity="0.6"/>
    </svg>
  `),

  glasses: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Frame -->
      <circle cx="30" cy="45" r="15" fill="none" stroke="#2c2c2c" stroke-width="3"/>
      <circle cx="70" cy="45" r="15" fill="none" stroke="#2c2c2c" stroke-width="3"/>
      <!-- Bridge -->
      <line x1="45" y1="45" x2="55" y2="45" stroke="#2c2c2c" stroke-width="3" stroke-linecap="round"/>
      <!-- Temples -->
      <line x1="15" y1="45" x2="10" y2="48" stroke="#2c2c2c" stroke-width="3" stroke-linecap="round"/>
      <line x1="85" y1="45" x2="90" y2="48" stroke="#2c2c2c" stroke-width="3" stroke-linecap="round"/>
      <!-- Lenses reflection -->
      <ellipse cx="25" cy="40" rx="4" ry="3" fill="#fff" opacity="0.3"/>
      <ellipse cx="65" cy="40" rx="4" ry="3" fill="#fff" opacity="0.3"/>
    </svg>
  `),

  wink: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Face outline -->
      <circle cx="50" cy="50" r="35" fill="#ffeb99" stroke="#e6d000" stroke-width="2"/>
      <!-- Left eye (winking) -->
      <path d="M35 45 Q40 42 45 45" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
      <!-- Right eye -->
      <circle cx="65" cy="45" r="4" fill="#333"/>
      <!-- Mouth -->
      <path d="M35 65 Q50 75 65 65" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
      <!-- Blush -->
      <circle cx="25" cy="55" r="5" fill="#ff9999" opacity="0.6"/>
    </svg>
  `),

  rainbow: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Rainbow arcs -->
      <path d="M20 60 Q50 20 80 60" fill="none" stroke="#ff0000" stroke-width="4"/>
      <path d="M22 62 Q50 25 78 62" fill="none" stroke="#ff8000" stroke-width="4"/>
      <path d="M24 64 Q50 30 76 64" fill="none" stroke="#ffff00" stroke-width="4"/>
      <path d="M26 66 Q50 35 74 66" fill="none" stroke="#00ff00" stroke-width="4"/>
      <path d="M28 68 Q50 40 72 68" fill="none" stroke="#0080ff" stroke-width="4"/>
      <path d="M30 70 Q50 45 70 70" fill="none" stroke="#8000ff" stroke-width="4"/>
      <!-- Clouds -->
      <ellipse cx="20" cy="60" rx="8" ry="5" fill="#fff" stroke="#ddd" stroke-width="1"/>
      <ellipse cx="80" cy="60" rx="8" ry="5" fill="#fff" stroke="#ddd" stroke-width="1"/>
    </svg>
  `),

  peace: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="peaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#44a08d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Peace sign circle -->
      <circle cx="50" cy="50" r="25" fill="url(#peaceGrad)" stroke="#2c5530" stroke-width="3"/>
      <!-- Peace sign lines -->
      <line x1="50" y1="25" x2="50" y2="75" stroke="#2c5530" stroke-width="3"/>
      <line x1="50" y1="50" x2="32" y2="68" stroke="#2c5530" stroke-width="3"/>
      <line x1="50" y1="50" x2="68" y2="68" stroke="#2c5530" stroke-width="3"/>
    </svg>
  `),

  lightning: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Lightning bolt -->
      <path d="M45 15 L35 45 L50 45 L40 85 L65 45 L50 45 L60 15 Z" 
            fill="url(#lightningGrad)" stroke="#e65100" stroke-width="2"/>
      <!-- Inner highlight -->
      <path d="M48 20 L42 40 L52 40 L46 70 L58 40 L52 40 L55 20 Z" 
            fill="#fff9c4" opacity="0.7"/>
    </svg>
  `),

  diamond: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#bbdefb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2196f3;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Diamond shape -->
      <polygon points="50,20 35,40 50,80 65,40" 
               fill="url(#diamondGrad)" stroke="#1976d2" stroke-width="2"/>
      <!-- Facets -->
      <line x1="35" y1="40" x2="50" y2="35" stroke="#1976d2" stroke-width="1" opacity="0.7"/>
      <line x1="65" y1="40" x2="50" y2="35" stroke="#1976d2" stroke-width="1" opacity="0.7"/>
      <line x1="42" y1="50" x2="50" y2="35" stroke="#1976d2" stroke-width="1" opacity="0.5"/>
      <line x1="58" y1="50" x2="50" y2="35" stroke="#1976d2" stroke-width="1" opacity="0.5"/>
      <!-- Sparkles -->
      <circle cx="30" cy="30" r="2" fill="#fff" opacity="0.8"/>
      <circle cx="70" cy="35" r="1.5" fill="#fff" opacity="0.8"/>
      <circle cx="45" cy="25" r="1" fill="#fff" opacity="0.8"/>
    </svg>
  `),

  unicorn: createSVGDataURL(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff69b4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Unicorn horn -->
      <polygon points="50,15 45,40 55,40" fill="url(#hornGrad)" stroke="#e91e63" stroke-width="1"/>
      <!-- Horn spiral -->
      <path d="M47 20 Q52 25 47 30 Q52 35 47 38" fill="none" stroke="#ff1493" stroke-width="2"/>
      <!-- Star on horn -->
      <polygon points="50,18 52,22 56,22 53,25 54,29 50,27 46,29 47,25 44,22 48,22" 
               fill="#fff" stroke="#ff69b4" stroke-width="0.5"/>
      <!-- Sparkles around horn -->
      <circle cx="40" cy="25" r="1.5" fill="#ff69b4"/>
      <circle cx="60" cy="30" r="1" fill="#ffd700"/>
      <circle cx="35" cy="35" r="1" fill="#00bcd4"/>
      <circle cx="65" cy="25" r="1.5" fill="#9c27b0"/>
    </svg>
  `),
};

export const stickers: Sticker[] = [
  {
    id: 'sunglasses',
    name: 'Sunglasses',
    src: stickerSVGs.sunglasses,
    category: 'accessories',
    tags: ['cool', 'summer', 'style'],
  },
  {
    id: 'mustache',
    name: 'Mustache',
    src: stickerSVGs.mustache,
    category: 'facial',
    tags: ['funny', 'vintage', 'gentleman'],
  },
  {
    id: 'crown',
    name: 'Crown',
    src: stickerSVGs.crown,
    category: 'accessories',
    tags: ['royal', 'fancy', 'gold'],
  },
  {
    id: 'heart',
    name: 'Heart',
    src: stickerSVGs.heart,
    category: 'emotions',
    tags: ['love', 'cute', 'pink'],
  },
  {
    id: 'star',
    name: 'Star',
    src: stickerSVGs.star,
    category: 'shapes',
    tags: ['bright', 'yellow', 'sparkle'],
  },
  {
    id: 'bowtie',
    name: 'Bow Tie',
    src: stickerSVGs.bowtie,
    category: 'accessories',
    tags: ['formal', 'classy', 'red'],
  },
  {
    id: 'speechBubble',
    name: 'Speech Bubble',
    src: stickerSVGs.speechBubble,
    category: 'communication',
    tags: ['talk', 'text', 'comic'],
  },
  {
    id: 'hat',
    name: 'Hat',
    src: stickerSVGs.hat,
    category: 'accessories',
    tags: ['classic', 'formal', 'black'],
  },
  {
    id: 'glasses',
    name: 'Glasses',
    src: stickerSVGs.glasses,
    category: 'accessories',
    tags: ['smart', 'nerdy', 'stylish'],
  },
  {
    id: 'wink',
    name: 'Wink Face',
    src: stickerSVGs.wink,
    category: 'emotions',
    tags: ['cute', 'flirty', 'emoji'],
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    src: stickerSVGs.rainbow,
    category: 'nature',
    tags: ['colorful', 'happy', 'bright'],
  },
  {
    id: 'peace',
    name: 'Peace Sign',
    src: stickerSVGs.peace,
    category: 'symbols',
    tags: ['peace', 'harmony', 'hippie'],
  },
  {
    id: 'lightning',
    name: 'Lightning',
    src: stickerSVGs.lightning,
    category: 'nature',
    tags: ['electric', 'power', 'energy'],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    src: stickerSVGs.diamond,
    category: 'shapes',
    tags: ['precious', 'sparkly', 'luxury'],
  },
  {
    id: 'unicorn',
    name: 'Unicorn Horn',
    src: stickerSVGs.unicorn,
    category: 'fantasy',
    tags: ['magical', 'colorful', 'mythical'],
  },
];
