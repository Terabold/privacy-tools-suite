import { useMemo } from "react";
import { Volume2, Type, Pipette, Video, Layers, Layout, LayoutGrid, Scissors, Music, ShieldX, ImageIcon, ShieldCheck, Wrench, Sparkles, Camera, Code, QrCode, Zap, ClipboardCopy, KeyRound, Binary, Clock, SearchCode, FileText, Palette, Fingerprint, Ruler, FileJson, FileStack, Monitor, RefreshCw, Database, Split, Radio, Hash, Eraser, Dices, Terminal, Dices as DiceIcon } from "lucide-react";
import ToolCard from "./ToolCard";
import { Button } from "@/components/ui/button";
import toolsMetadata from "@/data/toolsMetadata.json";
import { searchTools } from "@/lib/search";
import { motion, Variants } from "framer-motion";

const toolsData = [
  {
    title: "Media Converter",
    description: "Convert video and audio files directly in your browser without uploading to a server.",
    icon: <Video className="h-5 w-5" />,
    to: "/universal-media-converter",
    category: "Video",
    tags: []
  },
  {
    title: "YouTube Thumbnail Preview",
    description: "Preview how your thumbnails look on YouTube to optimize click-through rates.",
    icon: <Layout className="h-5 w-5" />,
    to: "/youtube-thumbnail-hub",
    category: "Video",
    tags: []
  },
  {
    title: "3D Image Tilt",
    description: "Apply 3D angles and perspective distortion to any image.",
    icon: <Layers className="h-5 w-5" />,
    to: "/perspective-tilter",
    category: "Graphics",
    tags: []
  },
  {
    title: "Remove Photo Metadata",
    description: "Erase hidden location data and camera details from photos for privacy.",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/metadata-scrubber",
    category: "Security",
    tags: []
  },
  {
    title: "Split Image into Grid",
    description: "Slice a single image into multiple pieces and download them as a ZIP.",
    icon: <Scissors className="h-5 w-5" />,
    to: "/sprite-studio",
    category: "Graphics",
    tags: []
  },
  {
    title: "Trim Audio",
    description: "Cut your audio files to exact lengths without any server uploads.",
    icon: <Music className="h-5 w-5" />,
    to: "/audio-trimmer",
    category: "Audio",
    tags: []
  },
  {
    title: "Volume Booster",
    description: "Increase or decrease the volume of your audio and video files.",
    icon: <Volume2 className="h-5 w-5" />,
    to: "/universal-volume-booster",
    category: "Audio",
    tags: []
  },
  {
    title: "Get Image Colors",
    description: "Extract the exact color palette from any uploaded image.",
    icon: <Pipette className="h-5 w-5" />,
    to: "/image-color-extractor",
    category: "Graphics",
    tags: []
  },
  {
    title: "Video to GIF",
    description: "Convert your video clips into optimized GIFs locally.",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/video-to-gif",
    category: "Video",
    tags: []
  },
  {
    title: "Save Video Frames",
    description: "Extract high-quality still images from your videos.",
    icon: <Camera className="h-5 w-5" />,
    to: "/frame-extractor",
    category: "Video",
    tags: []
  },
  {
    title: "Change Aspect Ratio",
    description: "Crop or pad your videos to fit different screen sizes like TikTok or YouTube.",
    icon: <Monitor className="h-5 w-5" />,
    to: "/video-aspect-studio",
    category: "Video",
    tags: []
  },
  {
    title: "Format JSON",
    description: "Format and validate complex JSON data easily.",
    icon: <FileJson className="h-5 w-5" />,
    to: "/json-studio",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Convert CSV & JSON",
    description: "Quickly convert data between CSV and JSON formats.",
    icon: <Database className="h-5 w-5" />,
    to: "/data-transformer",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "QR Code Generator",
    description: "Generate custom, offline QR codes securely.",
    icon: <QrCode className="h-5 w-5" />,
    to: "/qr-forge",
    category: "Security",
    tags: []
  },
  {
    title: "Blur & Redact Images",
    description: "Blur faces or sensitive text in images before sharing them.",
    icon: <ShieldX className="h-5 w-5" />,
    to: "/pii-masker",
    category: "Security",
    tags: []
  },
  {
    title: "Optimize SVG",
    description: "Compress your SVG files to make websites load faster.",
    icon: <Zap className="h-5 w-5" />,
    to: "/svg-optimizer",
    category: "Graphics",
    tags: []
  },
  {
    title: "SVG to Image",
    description: "Convert scalable vector graphics into standard PNG or JPG formats.",
    icon: <ImageIcon className="h-5 w-5" />,
    to: "/svg-to-image",
    category: "Graphics",
    tags: []
  },
  {
    "title": "SVG to ICO Icon",
    "description": "Convert SVG files into valid .ico icons. Perfect for high-quality website favicons.",
    "icon": <Sparkles className="h-5 w-5" />,
    "to": "/svg-to-ico",
    "category": "Graphics",
    "tags": ["FAVICON", "ICO"]
  },
  {
    title: "Image to PDF",
    description: "Combine multiple images into a single PDF document.",
    icon: <FileStack className="h-5 w-5" />,
    to: "/image-to-pdf",
    category: "Graphics",
    tags: []
  },
  {
    title: "Change Text Case",
    description: "Convert text into camelCase, UPPERCASE, and other formats instantly.",
    icon: <Type className="h-5 w-5" />,
    to: "/text-case-formatter",
    category: "Editor",
    tags: []
  },
  {
    title: "Clipboard to File",
    description: "Save your copied text or images directly as a file.",
    icon: <ClipboardCopy className="h-5 w-5" />,
    to: "/quick-clipboard",
    category: "Utilities",
    tags: []
  },
  {
    title: "Compare Text",
    description: "Highlight the exact differences between two pieces of text.",
    icon: <Split className="h-5 w-5" />,
    to: "/text-diff-checker",
    category: "Editor",
    tags: []
  },
  {
    title: "JWT Decoder",
    description: "Read the contents of JSON Web Tokens without sending them to a server.",
    icon: <KeyRound className="h-5 w-5" />,
    to: "/jwt-decoder",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Encode / Decode Text",
    description: "Translate text into Base64, Hex, or URL encoding.",
    icon: <Binary className="h-5 w-5" />,
    to: "/encoder-decoder",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Convert Timestamps",
    description: "Turn Unix numbers into readable dates and times.",
    icon: <Clock className="h-5 w-5" />,
    to: "/timestamp-converter",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Test Regular Expressions",
    description: "Test and validate regex patterns securely in your browser.",
    icon: <SearchCode className="h-5 w-5" />,
    to: "/regex-playground",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Placeholder Text Generator",
    description: "Create random Lorem Ipsum text for your design mockups.",
    icon: <FileText className="h-5 w-5" />,
    to: "/lorem-generator",
    category: "Editor",
    tags: []
  },
  {
    title: "Password Generator",
    description: "Generate highly secure random passwords that stay on your device.",
    icon: <ShieldCheck className="h-5 w-5" />,
    to: "/password-generator",
    category: "Security",
    tags: []
  },
  {
    title: "Color Palette Generator",
    description: "Create matching color schemes for your design projects.",
    icon: <Palette className="h-5 w-5" />,
    to: "/palette-studio",
    category: "Graphics",
    tags: []
  },
  {
    title: "File Hash Generator",
    description: "Create MD5, SHA-256, or SHA-512 hashes to verify file integrity.",
    icon: <Fingerprint className="h-5 w-5" />,
    to: "/hash-lab",
    category: "Security",
    tags: []
  },
  {
    title: "Unit Converter",
    description: "Convert measurements like weight, length, and temperature.",
    icon: <Ruler className="h-5 w-5" />,
    to: "/unit-converter",
    category: "Utilities",
    tags: []
  },
  {
    title: "Image to Base64",
    description: "Convert an image into a text string you can use directly in code.",
    icon: <FileStack className="h-5 w-5" />,
    to: "/base64-image",
    category: "Graphics",
    tags: []
  },
  {
    title: "Reverse Audio",
    description: "Play your audio files backward.",
    icon: <RefreshCw className="h-5 w-5" />,
    to: "/reverse-audio",
    category: "Audio",
    tags: []
  },
  {
    title: "Data to Audio",
    description: "Turn any computer file into strange glitchy sounds.",
    icon: <Binary className="h-5 w-5" />,
    to: "/binary-to-audio",
    category: "Audio",
    tags: []
  },
  {
    title: "Convert Audio Channels",
    description: "Change your audio from Mono to Stereo or vice versa.",
    icon: <Layers className="h-5 w-5" />,
    to: "/audio-mono-stereo",
    category: "Audio",
    tags: []
  },
  {
    title: "Boost Audio Bass",
    description: "Enhance the low frequencies of any audio track.",
    icon: <Zap className="h-5 w-5" />,
    to: "/audio-bass-booster",
    category: "Audio",
    tags: []
  },
  {
    title: "Compress Images",
    description: "Reduce the file size of images without losing visible quality.",
    icon: <Zap className="h-5 w-5" />,
    to: "/image-compressor",
    category: "Graphics",
    tags: []
  },
  {
    title: "Morse Code Translator",
    description: "Translate text to Morse code and play it out loud.",
    icon: <Radio className="h-5 w-5" />,
    to: "/morse-code-master",
    category: "Editor",
    tags: []
  },
  {
    title: "URL Slug Generator",
    description: "Create clean, readable web addresses from any text.",
    icon: <Hash className="h-5 w-5" />,
    to: "/slug-forge",
    category: "Dev/Code",
    tags: []
  },
  {
    title: "Clean Text",
    description: "Remove extra spaces and invisible characters from text.",
    icon: <Eraser className="h-5 w-5" />,
    to: "/whitespace-scrubber",
    category: "Editor",
    tags: []
  },
  {
    title: "Dice & Coin Flipper",
    description: "Roll virtual dice or flip coins for true randomization.",
    icon: <Dices className="h-5 w-5" />,
    to: "/dice-lab",
    category: "Utilities",
    tags: []
  },
  {
    title: "Word Counter",
    description: "Count words, characters, and estimate reading time.",
    icon: <FileText className="h-5 w-5" />,
    to: "/word-counter",
    category: "Editor",
    tags: []
  },
];


export type { Tool } from "@/types/tool";
import { Tool } from "@/types/tool";

export const tools = toolsData.map(tool => {
  const meta = toolsMetadata.find(m => m.to === tool.to);
  return {
    ...tool,
    seoTitle: meta?.seoTitle || `${tool.title} | Client-Sided Coding & Media Tools`,
    seoDescription: meta?.seoDescription || tool.description
  } as Tool;
});

import { categoryConfig } from "@/config/categories";

interface ToolsGridProps {
  searchQuery?: string;
  selectedCategory?: string | null;
  onClearFilters?: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const ToolsGrid = ({ searchQuery = "", selectedCategory = null, onClearFilters }: ToolsGridProps) => {
  const filteredTools = useMemo(() => {
    // 1. Filter by category first if selected (treat "All" as no filter)
    const categoryMatched = (selectedCategory && selectedCategory !== "All") 
      ? tools.filter(t => t.category === selectedCategory)
      : tools;

    // 2. Apply Fuzzy Search to the remaining toolset
    if (!searchQuery.trim()) return categoryMatched;
    
    return searchTools(categoryMatched, searchQuery);
  }, [searchQuery, selectedCategory]);

  const isFiltering = searchQuery.length > 0 || selectedCategory !== null;
  const categories = Array.from(new Set(filteredTools.map(t => t.category))) as string[];

  if (filteredTools.length === 0) {
    return (
      <div className="py-32 text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-2xl">
          <Zap className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">No tools found</h3>
        <p className="text-muted-foreground font-medium mb-10 max-w-md mx-auto opacity-60 italic">Nothing matched your search. Try different words or clear the filter.</p>
        <Button onClick={onClearFilters} variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/20 bg-primary/5 hover:bg-primary/20 dark:bg-white/5 dark:hover:bg-white/10 transition-all">
          Clear search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16 relative">
      {isFiltering ? (
        <section id="search-results" className="animate-in fade-in duration-700">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-black/20`}>
              {(!selectedCategory && !searchQuery) ? <LayoutGrid className="h-8 w-8 text-white" /> : <Sparkles className="h-8 w-8 text-white" />}
            </div>
            <div className="flex flex-col">
              <h2 className={`text-2xl md:text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent pr-4 leading-tight`}>
                {searchQuery ? "Search" : (selectedCategory || "All")} <span className="opacity-80 font-display">{searchQuery ? "Results" : (selectedCategory ? "Tools" : "Tools")}</span>
              </h2>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredTools.map((tool) => (
              <motion.div 
                key={tool.to} 
                variants={itemVariants}
                className="relative group/card-wrapper w-full h-full"
              >
                
                <ToolCard {...tool} gradient={categoryConfig[tool.category]?.gradient} themeClass={categoryConfig[tool.category]?.themeClass} />
                <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-none z-50">
                  {(tool.tags || []).map(tag => {
                    const tagColor = categoryConfig[tool.category]?.tagColor || '#a78bfa';
                    return (
                      <span
                        key={tag}
                        className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-1 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
                        style={{ color: tagColor, backgroundColor: `${tagColor}15`, borderWidth: 1, borderStyle: 'solid', borderColor: `${tagColor}30` }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      ) : (
        categories.map(category => {
          const config = categoryConfig[category] || { icon: Sparkles, gradient: "from-primary to-accent", themeClass: "", tagColor: "#a78bfa" };
          const Icon = config.icon;

          return (
            <section key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="animate-in fade-in duration-700">
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md shadow-black/20`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className={`text-2xl md:text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent pr-4 leading-tight`}>
                    {category.split(' ')[0]} <span className="opacity-80 font-display">{category.split(' ')[1]}</span>
                  </h2>
                </div>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {tools
                  .filter(t => t.category === category)
                  .map((tool) => (
                    <motion.div 
                      key={tool.to} 
                      variants={itemVariants}
                      className="relative group/card-wrapper w-full h-full"
                    >
                      
                      <ToolCard {...tool} gradient={config.gradient} themeClass={config.themeClass} />
                      <div className="absolute top-1 right-1 flex gap-1.5 pointer-events-none z-50">
                        {(tool.tags || []).map(tag => {
                          const tagColor = config.tagColor;
                          return (
                            <span
                              key={tag}
                              className="text-[10px] font-black px-2 py-0.5 rounded-2xl shadow-xl opacity-0 translate-y-1 group-hover/card-wrapper:opacity-100 group-hover/card-wrapper:translate-y-0 transition-all duration-500 uppercase tracking-widest whitespace-nowrap backdrop-blur-md"
                              style={{ color: tagColor, backgroundColor: `${tagColor}15`, borderWidth: 1, borderStyle: 'solid', borderColor: `${tagColor}30` }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default ToolsGrid;


