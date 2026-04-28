const fs = require('fs');
const path = require('path');

const mappings = {
  "UniversalVolumeBooster.tsx": "/universal-volume-booster",
  "TextCaseFormatter.tsx": "/text-case-formatter",
  "ImageColorExtractor.tsx": "/image-color-extractor",
  "UniversalMediaConverter.tsx": "/universal-media-converter",
  "ImageCompressor.tsx": "/image-compressor",
  "PerspectiveTilter.tsx": "/perspective-tilter",
  "YouTubeThumbnailHub.tsx": "/youtube-thumbnail-hub",
  "SpriteStudio.tsx": "/sprite-studio",
  "AudioTrimmer.tsx": "/audio-trimmer",
  "MetadataScrubber.tsx": "/metadata-scrubber",
  "VideoToGif.tsx": "/video-to-gif",
  "FrameExtractor.tsx": "/frame-extractor",
  "VideoAspectStudio.tsx": "/video-aspect-studio",
  "JsonForge.tsx": "/json-studio",
  "CsvJsonForge.tsx": "/data-transformer",
  "QrForge.tsx": "/qr-forge",
  "PiiMasker.tsx": "/pii-masker",
  "SvgOptimizer.tsx": "/svg-optimizer",
  "SvgToImage.tsx": "/svg-to-image",
  "ImageToPdf.tsx": "/image-to-pdf",
  "TextDiffChecker.tsx": "/text-diff-checker",
  "QuickClipboardHub.tsx": "/quick-clipboard",
  "JwtDecoder.tsx": "/jwt-decoder",
  "EncoderDecoder.tsx": "/encoder-decoder",
  "TimestampConverter.tsx": "/timestamp-converter",
  "RegexPlayground.tsx": "/regex-playground",
  "LoremGenerator.tsx": "/lorem-generator",
  "PasswordGenerator.tsx": "/password-generator",
  "ColorPaletteGenerator.tsx": "/palette-studio",
  "HashLab.tsx": "/hash-lab",
  "UnitConverter.tsx": "/unit-converter",
  "Base64Image.tsx": "/base64-image",
  "ReverseAudio.tsx": "/reverse-audio",
  "BinaryToAudio.tsx": "/binary-to-audio",
  "AudioMonoStereo.tsx": "/audio-mono-stereo",
  "BassBooster.tsx": "/audio-bass-booster",
  "MorseCodeMaster.tsx": "/morse-code-master",
  "SlugForge.tsx": "/slug-forge",
  "WhitespaceScrubber.tsx": "/whitespace-scrubber",
  "SvgToIco.tsx": "/svg-to-ico",
  "DiceLab.tsx": "/dice-lab",
  "WordCounter.tsx": "/word-counter"
};

const pagesDir = path.join(__dirname, '../src/pages');

let modifiedCount = 0;

for (const [file, toolId] of Object.entries(mappings)) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  if (content.includes('import ToolExpertSection')) {
    content = content.replace(/import ToolExpertSection from ['"]@\/components\/ToolExpertSection['"];?/, "import ToolBottomDescription from '@/components/ToolBottomDescription';");
  } else if (!content.includes('ToolBottomDescription')) {
    // Inject at the top if missing
    content = content.replace(/import /, "import ToolBottomDescription from '@/components/ToolBottomDescription';\nimport ");
  }

  // Replace <ToolExpertSection ... /> with <ToolBottomDescription toolId="..." />
  const regex = /<ToolExpertSection[\s\S]*?\/>/g;
  if (regex.test(content)) {
    content = content.replace(regex, `<ToolBottomDescription toolId="${toolId}" />`);
    fs.writeFileSync(filePath, content);
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Successfully refactored ${modifiedCount} tools.`);
