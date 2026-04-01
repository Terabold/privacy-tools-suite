import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Zap, Image as ImageIcon, CloudUpload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";
import { toast } from "sonner";

const ImageCompressor = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetFormat, setTargetFormat] = useState<string>("webp");
  const [processing, setProcessing] = useState(false);
  
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Format not supported. Deploy image artifact only.");
      return;
    }
    setFile(f);
    setOriginalSize(f.size);
    setCompressedUrl(null);
    setCompressedSize(0);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setOriginalImage(img);
        toast.success("Image staged for compression.");
      };
    };
    reader.readAsDataURL(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  usePasteFile(handleFile);

  const compressImage = useCallback(async () => {
    if (!originalImage || !file) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(originalImage, 0, 0);

    const mimeMap: Record<string, string> = {
      'webp': 'image/webp',
      'jpg': 'image/jpeg',
      'png': 'image/png'
    };
    const requestedMime = mimeMap[targetFormat] || 'image/webp';

    // PNG is lossless in this generic canvas implementation
    canvas.toBlob((blob) => {
      if (blob) {
        // MIME Check: Ensure browser didn't fallback
        if (blob.type !== requestedMime && targetFormat !== 'png') {
          toast.error(`Engine Fault: Browser forced ${blob.type} instead of ${targetFormat}.`);
          setProcessing(false);
          return;
        }

        // Size Check: Ensure we actually saved space
        if (blob.size > originalSize && targetFormat !== 'png') {
          toast.warning("Optimization Warning: Compressed result is larger than master. Try lower quality.");
        }

        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        const url = URL.createObjectURL(blob);
        setCompressedUrl(url);
        setCompressedSize(blob.size);
      }
      setProcessing(false);
    }, requestedMime, targetFormat === 'png' ? undefined : quality);
  }, [originalImage, quality, targetFormat, compressedUrl, file, originalSize]);

  useEffect(() => {
    if (originalImage) {
      const timer = setTimeout(() => {
        compressImage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [quality, targetFormat, originalImage, compressImage]);

  const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 theme-image overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <main className="container mx-auto max-w-[1400px] px-6 py-4 md:py-8 grow flex flex-col justify-start">
        <div className="flex flex-col gap-4 md:gap-6">
          <header className="flex items-center justify-between flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-primary/10 hover:bg-primary/5 group/back transition-colors">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                   Image <span className="text-primary italic">Compressor</span>
                </h1>
                <p className="text-muted-foreground mt-1 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Native Hardware Optimization Engine</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-4 md:gap-6 items-start">
            {/* WORKBENCH COLUMN */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-primary/5 p-2 px-4 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Studio Workbench</h3>
                  {file && (
                    <Button 
                      onClick={() => { setFile(null); setOriginalImage(null); setCompressedUrl(null); }} 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-2 text-[7.5px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/10 rounded-lg transition-colors"
                    >
                      Purge
                    </Button>
                  )}
                </div>
                <CardContent className="p-3 md:p-4">
                  {!file ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full h-[350px] md:h-[420px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center cursor-pointer bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner transition-all duration-300 group/upload"
                    >
                      <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-all duration-500">
                          <CloudUpload className="h-10 w-10 text-primary" />
                      </div>
                      <div className="px-6 space-y-2">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-50">Drag master or click</p>
                        <div className="pt-2 scale-90">
                          <KbdShortcut />
                        </div>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 w-full py-2">
                      <div className="relative group w-full bg-background/50 p-1.5 rounded-xl border-2 border-primary/10 shadow-2xl overflow-hidden max-h-[300px] flex items-center justify-center studio-gradient">
                         {compressedUrl ? (
                           <img src={compressedUrl} alt="Compressed Artifact" className="w-full h-full max-h-[290px] object-contain rounded-lg shadow-2xl" />
                         ) : (
                           <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                         )}
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-black text-primary truncate italic uppercase opacity-80 bg-primary/5 px-4 py-1 rounded-xl border border-primary/10 w-full max-w-[300px] mx-auto">{file.name}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {file && (
                <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-xl studio-gradient border-b-2 border-r-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-primary/5 p-3 px-4 border-b border-primary/10">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Process Geometry</h2>
                  </div>
                  <CardContent className="p-4 md:p-6 space-y-6">
                    {targetFormat !== 'png' ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none">Yield Quality</label>
                          <span className="text-lg font-black tracking-tighter text-primary italic leading-none">{Math.round(quality * 100)}%</span>
                        </div>
                        <Slider 
                          value={[quality * 100]} 
                          min={1} 
                          max={100} 
                          step={1} 
                          onValueChange={(val) => setQuality(val[0] / 100)}
                          className="py-1"
                        />
                      </div>
                    ) : (
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-center">
                         <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] italic">Lossless Transfer Mode Active</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Output Spec</label>
                          <Select value={targetFormat} onValueChange={(v) => {
                            setTargetFormat(v);
                            if (v !== 'png') setQuality(0.8);
                          }}>
                            <SelectTrigger className="h-10 bg-background border-primary/10 rounded-xl font-black uppercase tracking-tighter text-xs shadow-inner">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-morphism border-primary/20">
                              <SelectItem value="webp" className="font-black py-2 text-[10px]">WEBP (ULTRA)</SelectItem>
                              <SelectItem value="jpg" className="font-black py-2 text-[10px]">JPG (LGCY)</SelectItem>
                              <SelectItem value="png" className="font-black py-2 text-[10px]">PNG (LOSSLESS)</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-1.5 pt-0.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none px-1">Optimization</label>
                          <div className="h-10 flex items-center justify-center bg-background/50 border border-primary/10 rounded-xl shadow-inner px-4 overflow-hidden">
                             <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-primary animate-pulse" />
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest whitespace-nowrap">NATIVE CORE</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* INTEGRITY PANEL COLUMN */}
            <div className="space-y-4">
              {compressedUrl ? (
                <Card className="border-primary/20 bg-primary/5 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 fade-in duration-700 border-b-4 border-r-4 relative group">
                  <div className="bg-primary/5 p-3 px-4 border-b border-primary/10 flex items-center justify-between relative z-10">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">Integrity Analysis</h2>
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  
                  <CardContent className="p-4 md:p-6 flex flex-col items-center relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center mb-6 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 shadow-primary/20">
                       <div className="text-center">
                          <p className="text-2xl font-black italic tracking-tighter text-primary">-{savings}%</p>
                          <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-primary/60 text-shadow-glow">Savings</p>
                       </div>
                    </div>

                    <div className="w-full space-y-3 mb-6">
                       <div className="flex justify-between items-center bg-background/30 p-3 rounded-xl border border-white/5 shadow-inner">
                          <div>
                             <p className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 italic">Source</p>
                             <p className="text-lg font-black tracking-tighter text-foreground uppercase italic leading-none">{(originalSize / 1024 / 1024).toFixed(2)}MB</p>
                          </div>
                          <div className="h-6 w-[1px] bg-primary/10 mx-2" />
                          <div>
                             <p className="text-[7.5px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 text-right italic">Optimized</p>
                             <p className="text-lg font-black tracking-tighter text-primary uppercase italic text-right leading-none">{(compressedSize / 1024 / 1024).toFixed(2)}MB</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-2.5 bg-background/20 border border-primary/5 rounded-xl space-y-0.5 text-center">
                             <span className="text-[7.5px] font-black text-muted-foreground/50 uppercase tracking-widest italic">Binary</span>
                             <p className="text-[9px] font-black text-foreground uppercase truncate">image/{targetFormat}</p>
                          </div>
                          <div className="p-2.5 bg-background/20 border border-primary/5 rounded-xl space-y-0.5 text-center">
                             <span className="text-[7.5px] font-black text-muted-foreground/50 uppercase tracking-widest italic">Enc</span>
                             <p className="text-[8px] font-black text-primary italic uppercase tracking-tighter leading-none">Verified</p>
                          </div>
                       </div>
                    </div>

                    <Button 
                      className="w-full gap-3 h-12 text-xs font-black rounded-xl shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase italic"
                      onClick={() => {
                        if (!compressedUrl) return;
                        const a = document.createElement("a");
                        a.href = compressedUrl;
                        a.download = `${file?.name.replace(/\.[^.]+$/, "")}_optimized.${targetFormat}`;
                        a.click();
                      }}
                      disabled={!compressedUrl}
                    >
                      <Download className="h-4 w-4" /> Export Optimized
                    </Button>
                    
                    <p className="mt-4 text-[6.5px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-40 italic text-center w-full px-4 leading-relaxed">Hardware Bitstream Optimization Engine<br/>Secure Local Forge</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center space-y-6 opacity-20 filter grayscale hover:opacity-40 transition-all duration-1000 p-12 text-center rounded-2xl border-4 border-dashed border-primary/5">
                   <ImageIcon className="h-20 w-20 text-primary" />
                   <div className="space-y-1">
                       <p className="text-lg font-black uppercase italic tracking-tighter">Ready for Scan</p>
                       <p className="text-[7px] font-black uppercase tracking-widest italic leading-relaxed">Deploy primary image master<br/>to trigger production integrity analysis</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ImageCompressor;
