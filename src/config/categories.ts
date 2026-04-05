import { Video, ImageIcon, Music, ShieldCheck, Wrench, Sparkles } from "lucide-react";

export const categoryConfig: Record<string, { icon: any, gradient: string, themeClass: string, tagColor: string, hsl: string }> = {
  "Video Studio": { 
    icon: Video, 
    gradient: "from-blue-600 to-indigo-500", 
    themeClass: "theme-video", 
    tagColor: "#3b82f6",
    hsl: "221.2 83.2% 53.3%"
  },
  "Image Studio": { 
    icon: ImageIcon, 
    gradient: "from-orange-500 to-rose-500", 
    themeClass: "theme-image", 
    tagColor: "#f97316",
    hsl: "24.6 95% 53.1%"
  },
  "Privacy Belt": { 
    icon: ShieldCheck, 
    gradient: "from-violet-500 to-fuchsia-400", 
    themeClass: "theme-privacy", 
    tagColor: "#8b5cf6",
    hsl: "280 85% 60%"
  },
  "Audio Lab": { 
    icon: Music, 
    gradient: "from-emerald-500 to-teal-500", 
    themeClass: "theme-audio", 
    tagColor: "#10b981",
    hsl: "142.1 76.2% 36.3%"
  },
  "Utility Belt": { 
    icon: Wrench, 
    gradient: "from-amber-400 to-yellow-600", 
    themeClass: "theme-utility", 
    tagColor: "#f59e0b",
    hsl: "38 92% 50%"
  },
  "All": {
    icon: Sparkles,
    gradient: "from-primary to-accent",
    themeClass: "theme-all",
    tagColor: "#a78bfa",
    hsl: "250 85% 60%"
  }
};
