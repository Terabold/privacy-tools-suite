const fs = require('fs');
const path = require('path');

const toolsGridPath = path.join(__dirname, '../src/components/ToolsGrid.tsx');
const metadataPath = path.join(__dirname, '../src/data/toolsMetadata.json');

// Plain English mapping for tools
const toolUpdates = {
  "/universal-media-converter": { title: "Media Converter", desc: "Convert video and audio files directly in your browser without uploading to a server." },
  "/youtube-thumbnail-hub": { title: "YouTube Thumbnail Preview", desc: "Preview how your thumbnails look on YouTube to optimize click-through rates." },
  "/perspective-tilter": { title: "3D Image Tilt", desc: "Apply 3D angles and perspective distortion to any image." },
  "/metadata-scrubber": { title: "Remove Photo Metadata", desc: "Erase hidden location data and camera details from photos for privacy." },
  "/sprite-studio": { title: "Split Image into Grid", desc: "Slice a single image into multiple pieces and download them as a ZIP." },
  "/audio-trimmer": { title: "Trim Audio", desc: "Cut your audio files to exact lengths without any server uploads." },
  "/universal-volume-booster": { title: "Volume Booster", desc: "Increase or decrease the volume of your audio and video files." },
  "/image-color-extractor": { title: "Get Image Colors", desc: "Extract the exact color palette from any uploaded image." },
  "/video-to-gif": { title: "Video to GIF", desc: "Convert your video clips into optimized GIFs locally." },
  "/frame-extractor": { title: "Save Video Frames", desc: "Extract high-quality still images from your videos." },
  "/video-aspect-studio": { title: "Change Aspect Ratio", desc: "Crop or pad your videos to fit different screen sizes like TikTok or YouTube." },
  "/json-studio": { title: "Format JSON", desc: "Format and validate complex JSON data easily." },
  "/data-transformer": { title: "Convert CSV & JSON", desc: "Quickly convert data between CSV and JSON formats." },
  "/qr-forge": { title: "QR Code Generator", desc: "Generate custom, offline QR codes securely." },
  "/pii-masker": { title: "Blur & Redact Images", desc: "Blur faces or sensitive text in images before sharing them." },
  "/svg-optimizer": { title: "Optimize SVG", desc: "Compress your SVG files to make websites load faster." },
  "/svg-to-image": { title: "SVG to Image", desc: "Convert scalable vector graphics into standard PNG or JPG formats." },
  "/svg-to-ico": { title: "SVG to ICO", desc: "Turn SVG files into website favicon .ico files." },
  "/image-to-pdf": { title: "Image to PDF", desc: "Combine multiple images into a single PDF document." },
  "/text-case-formatter": { title: "Change Text Case", desc: "Convert text into camelCase, UPPERCASE, and other formats instantly." },
  "/quick-clipboard": { title: "Clipboard to File", desc: "Save your copied text or images directly as a file." },
  "/text-diff-checker": { title: "Compare Text", desc: "Highlight the exact differences between two pieces of text." },
  "/jwt-decoder": { title: "JWT Decoder", desc: "Read the contents of JSON Web Tokens without sending them to a server." },
  "/encoder-decoder": { title: "Encode / Decode Text", desc: "Translate text into Base64, Hex, or URL encoding." },
  "/timestamp-converter": { title: "Convert Timestamps", desc: "Turn Unix numbers into readable dates and times." },
  "/regex-playground": { title: "Test Regular Expressions", desc: "Test and validate regex patterns securely in your browser." },
  "/lorem-generator": { title: "Placeholder Text Generator", desc: "Create random Lorem Ipsum text for your design mockups." },
  "/password-generator": { title: "Password Generator", desc: "Generate highly secure random passwords that stay on your device." },
  "/palette-studio": { title: "Color Palette Generator", desc: "Create matching color schemes for your design projects." },
  "/hash-lab": { title: "File Hash Generator", desc: "Create MD5, SHA-256, or SHA-512 hashes to verify file integrity." },
  "/unit-converter": { title: "Unit Converter", desc: "Convert measurements like weight, length, and temperature." },
  "/base64-image": { title: "Image to Base64", desc: "Convert an image into a text string you can use directly in code." },
  "/reverse-audio": { title: "Reverse Audio", desc: "Play your audio files backward." },
  "/binary-to-audio": { title: "Data to Audio", desc: "Turn any computer file into strange glitchy sounds." },
  "/audio-mono-stereo": { title: "Convert Audio Channels", desc: "Change your audio from Mono to Stereo or vice versa." },
  "/audio-bass-booster": { title: "Boost Audio Bass", desc: "Enhance the low frequencies of any audio track." },
  "/image-compressor": { title: "Compress Images", desc: "Reduce the file size of images without losing visible quality." },
  "/morse-code-master": { title: "Morse Code Translator", desc: "Translate text to Morse code and play it out loud." },
  "/slug-forge": { title: "URL Slug Generator", desc: "Create clean, readable web addresses from any text." },
  "/whitespace-scrubber": { title: "Clean Text", desc: "Remove extra spaces and invisible characters from text." },
  "/dice-lab": { title: "Dice & Coin Flipper", desc: "Roll virtual dice or flip coins for true randomization." },
  "/word-counter": { title: "Word Counter", desc: "Count words, characters, and estimate reading time." }
};

// Update ToolsGrid.tsx
let gridContent = fs.readFileSync(toolsGridPath, 'utf8');

for (const [route, info] of Object.entries(toolUpdates)) {
  // Regex to find the tool block based on 'to' property
  const regex = new RegExp(`({\\s*title:\\s*["'][^"']+["'],\\s*description:\\s*["'][^"']+["'],\\s*icon:\\s*<[^>]+>,\\s*to:\\s*["']${route}["'],\\s*category:\\s*["'][^"']+["'],\\s*tags:\\s*\\[.*?\\]\\s*})`, 'gs');
  
  gridContent = gridContent.replace(regex, (match) => {
    return match
      .replace(/title:\s*["'][^"']+["']/, `title: "${info.title}"`)
      .replace(/description:\s*["'][^"']+["']/, `description: "${info.desc}"`)
      .replace(/tags:\s*\[.*?\]/, `tags: []`);
  });
}

// Ensure tags rendering in ToolsGrid is robust against empty arrays
gridContent = gridContent.replace(/tool\.tags\.map/g, '(tool.tags || []).map');
fs.writeFileSync(toolsGridPath, gridContent);

// Update toolsMetadata.json
let metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

metadata = metadata.map(item => {
  const info = toolUpdates[item.to];
  if (info) {
    return {
      ...item,
      seoTitle: `${info.title} - Free & Private Tool`,
      seoDescription: info.desc + " Works entirely in your browser with no file uploads."
    };
  }
  return item;
});

fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log("Updated ToolsGrid.tsx and toolsMetadata.json successfully.");
