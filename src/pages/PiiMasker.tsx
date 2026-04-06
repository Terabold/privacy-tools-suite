import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, Download, Shield, ShieldAlert, FileText, Image as ImageIcon, Check, Copy, Trash2, Undo2, MousePointer2, Move, ZoomIn, ZoomOut, Maximize2, RefreshCw, Grid3X3, ShieldX, Eraser, Square, Layers, Sparkles, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";

import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

interface RedactionRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  strength: number;
  style: "blur" | "black";
}

const PiiMasker = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [regions, setRegions] = useState<RedactionRegion[]>([]);
  const [redactionStyle, setRedactionStyle] = useState<"blur" | "black">("blur");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currPos, setCurrPos] = useState({ x: 0, y: 0 });
  const [blurStrength, setBlurStrength] = useState(50);
  const [processing, setProcessing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    
    if (f.type === "image/gif") {
      toast.error("GIF artifacts are not natively supported by the masking engine. Please use static masters.");
      return;
    }

    setFile(f);
    setRegions([]);
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const isImage = f.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setTextContent(null);
          toast.success("Identity Scrubber Initialized");
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(f);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string);
        setImage(null);
        toast.success("Document Redaction Mode");
      };
      reader.readAsText(f);
    }
  };

  const autoFit = useCallback(() => {
    const container = containerRef.current;
    if (container && image) {
      const pad = 80;
      const availableW = container.clientWidth - pad;
      const availableH = container.clientHeight - pad;
      
      if (availableW <= 0 || availableH <= 0) return;

      const fitZoom = Math.min(availableW / image.width, availableH / image.height, 1);
      setZoom(fitZoom);
      setOffset({ x: 0, y: 0 });
    }
  }, [image]);

  useEffect(() => {
    if (image) {
      // Fire it immediately and also after a tiny delay for layout settlement
      autoFit();
      const timer = setTimeout(autoFit, 100);
      return () => clearTimeout(timer);
    }
  }, [image, autoFit]);

  usePasteFile(handleFile);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !image) return;

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    if (showGrid || zoom > 8) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.5 / zoom;
      
      // Major grid (50px)
      for (let x = 0; x <= canvas.width; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Pixel grid (1px) - only at extreme zoom
      if (zoom > 15) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 0.2 / zoom;
        for (let x = 0; x <= canvas.width; x += 1) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 1) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
      }
      ctx.restore();
    }

    regions.forEach(r => {
      ctx.save();
      if (r.style === "blur") {
        ctx.beginPath();
        ctx.rect(r.x, r.y, r.width, r.height);
        ctx.clip();
        ctx.filter = `blur(${r.strength / 4}px)`;
        ctx.drawImage(image, 0, 0);
      } else {
        ctx.fillStyle = "black";
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
      ctx.restore();
      
    });

  }, [image, regions, isDrawing, startPos, currPos, zoom]);

  useEffect(() => {
    if (image) drawCanvas();
  }, [drawCanvas, image]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !image) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(50, Math.max(0.1, prev * factor)));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [image]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    if (e.button === 2) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      return;
    }
    if (e.button === 0) {
      const pos = getMousePos(e);
      setIsDrawing(true);
      setStartPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
      setCurrPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrPos({ x: Math.round(pos.x), y: Math.round(pos.y) });
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    const x = Math.min(startPos.x, currPos.x);
    const y = Math.min(startPos.y, currPos.y);
    const w = Math.abs(startPos.x - currPos.x);
    const h = Math.abs(startPos.y - currPos.y);

    if (w >= 1 && h >= 1) {
      let adjustedStrength = blurStrength;
      if (Math.max(w, h) < 20) adjustedStrength = Math.max(2, blurStrength / 4);
      setRegions([...regions, { 
        id: Math.random().toString(36).substr(2, 9),
        x, y, width: w, height: h, 
        strength: adjustedStrength,
        style: redactionStyle
      }]);
      toast.success("Partition Redacted");
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `redacted_${file?.name || "image"}.png`;
    a.click();
    toast.success("Artifact Dispatched");
  };

  const redactSelectedText = () => {
    const sel = window.getSelection()?.toString();
    if (sel && textContent) {
      setTextContent(textContent.replace(sel, "█".repeat(sel.length)));
      toast.success("Identity String Redacted");
    } else {
      toast.error("Highlight text to redact");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-privacy transition-all duration-500 overflow-x-clip">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1100px] px-6 py-6 grow overflow-visible">
        <div className="flex flex-col gap-10">
          <header className="flex items-center justify-between flex-wrap gap-8">
            <div className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow leading-none">
                   PII <span className="text-primary italic">Masker</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[9px]">Neural-Grade Privacy Redaction</p>
              </div>
            </div>
          </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Horizontal Studio Toolbar - Compact Single Row */}
            <AnimatePresence>
              {(image || textContent) && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="glass-morphism border-primary/20 rounded-2xl overflow-hidden shadow-2xl bg-card/60 backdrop-blur-xl p-2 px-6 flex items-center justify-between gap-4 flex-nowrap">
                    <div className="flex items-center gap-4 divide-x divide-white/10">
                      {image && (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="flex bg-zinc-950/50 p-1 rounded-2xl border border-white/5">
                              <Button
                                size="sm"
                                variant={redactionStyle === "blur" ? "default" : "ghost"}
                                onClick={() => setRedactionStyle("blur")}
                                className={`h-9 px-5 text-[9px] font-black uppercase rounded-xl transition-all ${redactionStyle === "blur" ? "shadow-glow bg-primary text-white" : "opacity-40"}`}
                              >
                                Gaussian Blur
                              </Button>
                              <Button
                                size="sm"
                                variant={redactionStyle === "black" ? "default" : "ghost"}
                                onClick={() => setRedactionStyle("black")}
                                className={`h-9 px-5 text-[9px] font-black uppercase rounded-xl transition-all ${redactionStyle === "black" ? "bg-black text-white shadow-glow" : "opacity-40"}`}
                              >
                                Blackout
                              </Button>
                            </div>
                          </div>

                          <div className="pl-4 flex items-center gap-4 min-w-[180px]">
                            <Slider
                              min={0} max={100} step={1}
                              disabled={redactionStyle === "black"}
                              value={[blurStrength]}
                              onValueChange={([v]) => setBlurStrength(v)}
                              className="w-32"
                            />
                            <span className="text-[10px] font-black text-primary italic w-12">{blurStrength}% Intensity</span>
                          </div>
                        </>
                      )}

                      {textContent && (
                        <div className="flex items-center gap-4 pr-6">
                          <Shield className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Document Stream Cipher Active</span>
                        </div>
                      )}

                      <div className="pl-4 flex items-center gap-2">
                         <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setZoom(z => Math.max(0.1, z * 0.9)); }}
                          className="h-9 w-9 rounded-xl hover:bg-white/10"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-[10px] font-black text-foreground italic min-w-[32px] text-center">{Math.round(zoom * 100)}%</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setZoom(z => Math.min(50, z * 1.1)); }}
                          className="h-9 w-9 rounded-xl hover:bg-white/10"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                          className="h-9 w-9 rounded-xl hover:bg-white/10"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowGrid(!showGrid)}
                          className={`h-9 w-9 rounded-xl transition-all ${showGrid ? "text-primary bg-primary/10" : "opacity-40 hover:bg-white/10"}`}
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => { setImage(null); setTextContent(null); setRegions([]); }}
                        variant="ghost"
                        className="h-10 px-5 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                         Reset Stage
                      </Button>
                      <Button
                        onClick={() => {
                          if (textContent) {
                            const blob = new Blob([textContent], { type: "text/plain" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `redacted_${file?.name || "document"}.txt`;
                            a.click();
                            toast.success("Artifact Dispatched");
                          } else {
                            exportImage();
                          }
                        }}
                        className="h-10 px-8 text-[10px] font-black rounded-xl gap-2 shadow-glow shadow-primary/20 italic uppercase tracking-tighter bg-primary text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                         <Download className="h-3.5 w-3.5" /> Export Artifact
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {!image && !textContent ? (
              <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full">
                <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10">
                 <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => !processing && inputRef.current?.click()}
                  className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner group/dropzone"
                >
                  <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-10 shadow-inner group-hover/dropzone:scale-110 transition-transform">
                     <CloudUpload className="h-12 w-12 text-primary" />
                  </div>
                  <div className="px-6 space-y-2">
                    <p className="text-4xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-40">Drag or click to browse</p>
                    <KbdShortcut />
                  </div>
                  <input ref={inputRef} type="file" className="hidden" accept="image/*,text/plain,.md,.log" onChange={(e) => handleFile(e.target.files?.[0])} />
                </div>
              </Card>
            </motion.div>
          ) : textContent !== null ? (
            <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-0 relative min-h-[660px] flex flex-col group">
                <div className="bg-primary/5 p-5 px-10 border-b border-primary/10 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Document Stream</h3>
                   </div>
                   <p className="text-[9px] font-black opacity-30 uppercase tracking-widest italic">Select text to redact from forensic stream</p>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="flex-1 bg-transparent p-12 px-16 font-mono text-base leading-relaxed focus:outline-none custom-scrollbar min-h-[400px] text-foreground/80 selection:bg-primary/40 resize-none"
                  spellCheck={false}
                />
                <div className="p-6 px-10 border-t border-border/10 bg-black/40 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                   <Button
                     variant="ghost"
                     size="lg"
                     onClick={redactSelectedText}
                     className="h-14 px-10 text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 hover:bg-primary/20 transition-all text-primary rounded-2xl"
                    >
                     Redact Active Selection
                   </Button>
                   <p className="text-[11px] font-black opacity-20 uppercase tracking-[0.4em] italic">Manual Block-Cipher Active</p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 w-full max-w-full">
              <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 p-4 relative group lg:h-[660px] flex flex-col items-center justify-center w-full max-w-full">
                      <div
                        ref={containerRef}
                        className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#050505] rounded-xl select-none shadow-2xl group/canvas"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onContextMenu={(e) => e.preventDefault()}
                        style={{
                          cursor: isPanning ? 'grabbing' : 'crosshair',
                        }}
                      >
                        <div
                            className="relative shadow-2xl ring-1 ring-white/10 pointer-events-none origin-center"
                            style={{
                              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                              imageRendering: zoom > 2 ? 'pixelated' : 'auto',
                              width: image?.width || 'auto',
                              height: image?.height || 'auto',
                              transition: isPanning ? 'none' : 'transform 75ms ease-out'
                            }}
                          >
                          <canvas
                            ref={canvasRef}
                            className="block"
                          />
                          <svg 
                            viewBox={`0 0 ${image?.width || 0} ${image?.height || 0}`}
                            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                            shapeRendering="crispEdges"
                          >
                            {showGrid && zoom > 4 && (
                              <defs>
                                <pattern id="pixel-grid-pii" width="1" height="1" patternUnits="userSpaceOnUse">
                                  <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.1" />
                                </pattern>
                              </defs>
                            )}
                            {showGrid && zoom > 4 && <rect width="100%" height="100%" fill="url(#pixel-grid-pii)" />}
                            
                            {/* Static Regions Outlines (Razor Sharp) */}
                            {regions.map(r => (
                              <rect
                                key={r.id}
                                x={r.x}
                                y={r.y}
                                width={r.width}
                                height={r.height}
                                fill="transparent"
                                stroke="rgba(124, 58, 237, 0.8)"
                                strokeWidth={1.8 / zoom}
                                vectorEffect="non-scaling-stroke"
                              />
                            ))}
                            
                            {/* Pixel-Perfect Screenwise Selection Box */}
                            {isDrawing && (
                              <g>
                                <rect
                                  x={Math.min(startPos.x, currPos.x)}
                                  y={Math.min(startPos.y, currPos.y)}
                                  width={Math.abs(startPos.x - currPos.x)}
                                  height={Math.abs(startPos.y - currPos.y)}
                                  fill="rgba(59, 130, 246, 0.2)"
                                  stroke="white"
                                  strokeWidth={1.5 / zoom}
                                  strokeDasharray={`${4/zoom} ${2/zoom}`}
                                  vectorEffect="non-scaling-stroke"
                                  className="drop-shadow-[0_0_2px_rgba(0,0,0,1)]"
                                />
                                <text
                                  x={Math.min(startPos.x, currPos.x)}
                                  y={Math.min(startPos.y, currPos.y) - 5 / zoom}
                                  fontSize={Math.max(8, 12 / zoom)}
                                  fill="white"
                                  className="font-mono font-black italic drop-shadow-[0_1px_2px_rgba(0,0,0,1)] pointer-events-none select-none"
                                >
                                  [{Math.round(Math.abs(startPos.x - currPos.x))}x{Math.round(Math.abs(startPos.y - currPos.y))} PX]
                                </text>
                              </g>
                            )}
                          </svg>
                        </div>
                      </div>
                </Card>
              </motion.div>
            )}
          </div>
            {/* SEO & Tool Guide Section */}
            <ToolExpertSection
              title="Identity & PII Masker Studio"
              description="The Identity Masker is a forensic-grade redaction suite designed to permanently obscure Personally Identifiable Information (PII) from images and text documents."
              transparency="Our masker operates with 'Neural-Grade' privacy by using local Gaussian blur and solid block-cipher algorithms. Unlike cloud-based redaction tools that might store a copy of your unmasked original for 'training' purposes, our tool never uploads your raw data. Every mask is applied locally in your browser's V8 thread, ensuring your sensitive credentials stay safe."
              limitations="While the Gaussian blur is mathematically complex, extraordinarily high-resolution 8K masters may experience minor frame-drops during real-time dragging of redaction regions. For the most secure redaction, we recommend using 'Blackout' mode for sensitive passwords or numeric data."
              accent="rose"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>
      <Footer />
    
      {/* Mobile Sticky Anchor Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] overflow-x-clip">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
      </div>
  );
};

export default PiiMasker;
