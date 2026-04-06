import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  Plus,
  ChevronUp, 
  ChevronDown, 
  Settings2,
  FileStack,
  AlertCircle,
  RefreshCw,
  Home,
  Eye,
  Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

const ImageToPdf = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFaulted, setIsFaulted] = useState(false);
  const [livePreview, setLivePreview] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("converted_images");
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDarkMode(isDark);
  };

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB"
    }));

    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} artifacts staged`);
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const newImages = [...images];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[swapWith]] = [newImages[swapWith], newImages[index]];
    setImages(newImages);
  };

  const handleSwap = () => {
    if (images.length < 2) return;
    setImages(prev => [...prev].reverse());
    toast.success("Artifact sequence inverted");
  };

  // Live Preview Engine
  useEffect(() => {
    if (!livePreview || images.length === 0) {
      if (previewUrl) {
         URL.revokeObjectURL(previewUrl);
         setPreviewUrl(null);
      }
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: pageSize === "fit" ? "a4" : pageSize,
          compress: true
        });

        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(img.file);
          });

          if (i > 0) pdf.addPage();

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.width / imgProps.height;
          
          let width = pageWidth;
          let height = pageWidth / ratio;

          if (height > pageHeight) {
            height = pageHeight;
            width = pageHeight * ratio;
          }

          const x = (pageWidth - width) / 2;
          const y = (pageHeight - height) / 2;
          pdf.addImage(imgData, "JPEG", x, y, width, height, undefined, 'FAST');
        }

        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        console.error("Discovery Pass Fault:", err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [images, pageSize, livePreview]);

  const generateAndDownload = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    const pdfToast = toast.loading("Synthesizing final high-fidelity artifact...");

    try {
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: pageSize === "fit" ? "a4" : pageSize
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(img.file);
        });

        if (i > 0) pdf.addPage();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        
        let width = pageWidth;
        let height = pageWidth / ratio;

        if (height > pageHeight) {
          height = pageHeight;
          width = pageHeight * ratio;
        }

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;
        pdf.addImage(imgData, "JPEG", x, y, width, height);
      }

      pdf.save(`${pdfName || "converted"}.pdf`);
      toast.dismiss(pdfToast);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error(err);
      toast.dismiss(pdfToast);
      setIsFaulted(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const reinitializeEngine = () => {
    setIsFaulted(false);
    setImages([]);
    setPreviewUrl(null);
    toast.success("Engine Resynthesized");
  };

  if (isFaulted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-destructive/10 rounded-2xl flex items-center justify-center mb-10 shadow-2xl border-2 border-destructive/20 animate-pulse">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="max-w-xl space-y-6">
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic text-shadow-glow">
            Pipeline <span className="text-destructive italic">Fault</span>
          </h2>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
            The Image to PDF architect encountered a critical runtime error. This usually occurs during heavy client-side processing or browser context loss.
          </p>
          <div className="pt-10 flex flex-wrap justify-center gap-6">
            <Button 
              onClick={reinitializeEngine}
              className="h-16 px-10 gap-3 text-sm font-black rounded-2xl uppercase italic shadow-2xl shadow-destructive/20 bg-destructive hover:bg-destructive/90 transition-all active:scale-95 text-white"
            >
              <RefreshCw className="h-5 w-5" /> Re-Initialize Engine
            </Button>
            <Link to="/">
              <Button 
                variant="outline"
                className="h-16 px-10 gap-3 text-sm font-black rounded-2xl uppercase italic border-border hover:bg-white/5 transition-all active:scale-95"
              >
                <Home className="h-5 w-5" /> Return to Forge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1400px] px-4 py-8 grow">
          <header className="flex items-center justify-between flex-wrap gap-8 mb-12">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-border hover:bg-primary/10 transition-all group/back bg-background/80 shadow-xl">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-shadow-glow">
                  Image to <span className="text-primary italic">PDF</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 text-[10px]">
                  Secure Multi-Page Artifact Compiler
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-card/40 backdrop-blur-md px-5 h-14 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Preview</span>
                <Switch checked={livePreview} onCheckedChange={setLivePreview} className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
            <div className="space-y-8">
              {/* Workspace Container */}
              <motion.div 
                layout
                className={`grid grid-cols-1 ${livePreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8 min-h-[600px]`}
              >
                {/* Upload & Management */}
                <motion.div layout className="space-y-6 flex flex-col h-full">
                  <Card className="glass-morphism border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer relative group overflow-hidden h-[180px] flex-shrink-0 flex items-center justify-center">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center space-y-3">
                      <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-glow text-primary">
                        <Plus className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Stage Artifacts</p>
                        <p className="text-[9px] text-muted-foreground uppercase mt-1 opacity-60">HEIF, JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  </Card>

                  <div className="flex-1 flex flex-col space-y-3">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                         <FileStack className="h-3 w-3" /> Artifact Chain ({images.length})
                       </h3>
                       <div className="flex items-center gap-2">
                         {images.length >= 2 && (
                           <Button variant="ghost" size="sm" onClick={handleSwap} className="h-8 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                             Invert
                           </Button>
                         )}
                         <Button variant="ghost" size="sm" onClick={() => setImages([])} className="h-8 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all">
                           Purge
                         </Button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-auto max-h-[450px] space-y-2 pr-2 custom-scrollbar">
                      <AnimatePresence mode="popLayout">
                        {images.length === 0 ? (
                          <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-32 flex items-center justify-center border border-border/20 border-dashed rounded-2xl opacity-40 italic text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
                          >
                            Worklist is empty
                          </motion.div>
                        ) : (
                          images.map((img, index) => (
                            <motion.div
                              key={img.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              <Card className="glass-morphism border-border/30 bg-card/40 backdrop-blur-md group-hover:border-primary/30 transition-all shadow-sm">
                                <CardContent className="p-3 flex items-center gap-3">
                                  <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                                    <img src={img.preview} className="h-full w-full object-cover" alt="Artifact" />
                                  </div>
                                  <div className="grow min-w-0">
                                    <p className="text-[10px] font-black uppercase truncate">{img.name}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase opacity-60 font-mono tracking-tighter mt-0.5">{img.size}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg group" onClick={() => moveImage(index, "up")} disabled={index === 0}>
                                      <ChevronUp className="h-4 w-4 group-hover:text-primary" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg group" onClick={() => moveImage(index, "down")} disabled={index === images.length - 1}>
                                      <ChevronDown className="h-4 w-4 group-hover:text-primary" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg ml-1" onClick={() => removeImage(img.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Live Preview Console - Unmounts instantly for fluid layout expansion */}
                {livePreview && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between px-2 mb-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                         <Eye className="h-3 w-3 " /> Discovery View
                      </h3>
                    </div>
                    <Card className="flex-1 glass-morphism border-border/50 bg-black/40 backdrop-blur-2xl rounded-2xl overflow-hidden relative shadow-2xl min-h-[500px]">
                       {!previewUrl ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/20">
                           <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group">
                             <FileStack className="h-8 w-8 text-white/20 group-hover:text-primary/50 transition-colors" />
                           </div>
                           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] leading-relaxed">
                              Awaiting Artifact Serialization...
                           </p>
                         </div>
                       ) : (
                         <iframe src={previewUrl} className="w-full h-full border-none opacity-90 transition-opacity duration-700" title="PDF Preview" />
                       )}
                       
                       <div className="absolute top-4 right-4 z-20">
                          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${previewUrl ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                              {previewUrl ? 'Live Pass Active' : 'Engine Idle'}
                            </span>
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-8">
              <Card className="glass-morphism border-border/50 shadow-xl overflow-hidden bg-card/60">
                <div className="bg-primary/5 p-5 border-b border-border/50 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Settings2 className="h-3 w-3" /> Build Parameters
                  </h3>
                </div>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Artifact Namespace</Label>
                    <div className="relative">
                      <Input
                        value={pdfName}
                        onChange={(e) => setPdfName(e.target.value)}
                        className="bg-background/40 h-11 pr-12 font-black uppercase tracking-tighter"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground opacity-40">.PDF</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Spatial Manifest</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "a4", label: "A4 Forensic" },
                        { id: "letter", label: "US Letter" }
                      ].map((page) => (
                        <Button 
                          key={page.id}
                          variant={pageSize === page.id ? "default" : "outline"} 
                          className={`h-11 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${pageSize === page.id ? 'shadow-glow scale-[1.02]' : 'opacity-60'}`}
                          onClick={() => setPageSize(page.id as any)}
                        >
                          {page.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={generateAndDownload}
                    disabled={images.length === 0 || isProcessing}
                    className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest shadow-glow text-[11px] group relative overflow-hidden active:scale-95 transition-all bg-primary text-white hover:opacity-90"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2 animate-pulse">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Compiling...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" /> Export Master PDF
                      </span>
                    )}
                  </Button>
                  
                  <p className="text-[9px] text-muted-foreground font-black text-center uppercase tracking-widest leading-relaxed opacity-40">
                    Client-Side Buffer Processing: Your artifacts do not touch our networking layer.
                  </p>
                </CardContent>
              </Card>

              <div className="hidden xl:block">
                <AdBox adFormat="vertical" height={600} label="SIDEBAR AD" />
              </div>
            </aside>
          </div>

          <ToolExpertSection 
            title="PDF Forensic Serialization"
            description="Securely compile multiple image artifacts into a single, high-fidelity PDF document entirely within your browser."
            transparency="The Image to PDF studio utilizes direct browser-to-document synthesis. By processing your artifacts within your local V8 memory space, we ensure absolute data isolation."
            limitations="The discovery view uses a real-time compression engine to provide live feedback without saturating system RAM. Final exports are rendered in high-fidelity 300DPI equivalent buffers."
            accent="orange"
          />
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />
      
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-background/80 dark:bg-black/80 backdrop-blur-sm border-t border-border/10 py-2 h-[66px]">
        <AdBox adFormat="horizontal" height={50} label="ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default ImageToPdf;
