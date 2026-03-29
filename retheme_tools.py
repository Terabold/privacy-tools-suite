import os

CATEGORIES = {
    'video': {
        'files': ['UniversalMediaConverter.tsx', 'YouTubeThumbnailHub.tsx', 'FrameGifStudio.tsx'],
        'class': 'theme-video',
        'oldColors': ['blue-600', 'blue-500']
    },
    'image': {
        'files': ['PerspectiveTilter.tsx', 'BatchImageStudio.tsx', 'SpriteStudio.tsx', 'ImageColorExtractor.tsx', 'SvgOptimizer.tsx'],
        'class': 'theme-image',
        'oldColors': ['orange-500', 'orange-600', 'rose-500']
    },
    'audio': {
        'files': ['AudioTrimmer.tsx', 'UniversalVolumeBooster.tsx'],
        'class': 'theme-audio',
        'oldColors': ['emerald-500', 'emerald-600', 'teal-500']
    },
    'privacy': {
        'files': ['MetadataScrubber.tsx', 'QrForge.tsx', 'PIIMasker.tsx', 'PiiMasker.tsx'],
        'class': 'theme-privacy',
        'oldColors': ['purple-600', 'purple-500', 'fuchsia-500']
    },
    'utility': {
        'files': ['JsonForge.tsx', 'TextCaseFormatter.tsx', 'QuickClipboardHub.tsx'],
        'class': 'theme-utility',
        'oldColors': ['amber-400', 'amber-500', 'yellow-600']
    }
}

PAGES_DIR = os.path.join(os.getcwd(), 'src', 'pages')

for cat_name, config in CATEGORIES.items():
    theme_class = config['class']
    for filename in config['files']:
        file_path = os.path.join(PAGES_DIR, filename)
        if not os.path.exists(file_path):
            print(f"Skipping missing file: {filename}")
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Revert hardcoded colors to 'primary'
        for old_color in config['oldColors']:
            content = content.replace(old_color, 'primary')
            
        # 2. Revert indigo components (used as accent) back to 'accent'
        # INDIGO was used for Video Studio accent
        if cat_name == 'video':
            content = content.replace('indigo-500', 'accent')
        elif cat_name == 'image':
            content = content.replace('rose-500', 'accent')
        elif cat_name == 'audio':
            content = content.replace('teal-500', 'accent')
        
        # 3. Inject theme class into root div
        if theme_class not in content:
            content = content.replace('min-h-screen bg-background text-foreground', f'min-h-screen bg-background text-foreground {theme_class}')
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully re-themed {filename}")
