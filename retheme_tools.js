const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  video: {
    files: ['UniversalMediaConverter.tsx', 'YouTubeThumbnailHub.tsx', 'FrameGifStudio.tsx'],
    class: 'theme-video',
    oldColor: 'blue-600'
  },
  image: {
    files: ['PerspectiveTilter.tsx', 'BatchImageStudio.tsx', 'SpriteStudio.tsx', 'ImageColorExtractor.tsx', 'SvgOptimizer.tsx'],
    class: 'theme-image',
    oldColor: 'orange-500'
  },
  audio: {
    files: ['AudioTrimmer.tsx', 'UniversalVolumeBooster.tsx'],
    class: 'theme-audio',
    oldColor: 'emerald-500'
  },
  privacy: {
    files: ['MetadataScrubber.tsx', 'QrForge.tsx', 'PIIMasker.tsx', 'PiiMasker.tsx'],
    class: 'theme-privacy',
    oldColor: 'purple-600'
  },
  utility: {
    files: ['JsonForge.tsx', 'TextCaseFormatter.tsx', 'QuickClipboardHub.tsx'],
    class: 'theme-utility',
    oldColor: 'amber-500'
  }
};

const PAGES_DIR = path.join(__dirname, 'src', 'pages');

Object.values(CATEGORIES).forEach(category => {
  category.files.forEach(filename => {
    const filePath = path.join(PAGES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping missing file: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Revert hardcoded color strings to 'primary'
    const colorRegex = new RegExp(category.oldColor, 'g');
    content = content.replace(colorRegex, 'primary');
    
    // 2. Inject theme class into root div (ensure we don't double inject)
    if (!content.includes(category.class)) {
      content = content.replace('min-h-screen bg-background text-foreground', `min-h-screen bg-background text-foreground ${category.class}`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Successfully re-themed ${filename}`);
  });
});
