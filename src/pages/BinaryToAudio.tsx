import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download, Play, Pause, Binary, Zap, CloudUpload, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const BinaryToAudio = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampleRate, setSampleRate] = useState(8000);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setAudioBlob(null);
    toast.success("Structural Artifact Staged");
  };

  usePasteFile(handleFile);

  const processBinary = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Float32Array(arrayBuffer.byteLength / 2);
      const dataView = new DataView(arrayBuffer);
      
      // Interpret bytes as 16-bit PCM and normalize to -1.0 to 1.0
      for (let i = 0; i < bytes.length; i++) {
        if (i * 2 + 1 < arrayBuffer.byteLength) {
          const s = dataView.getInt16(i * 2, true);
          bytes[i] = s / 32768;
        }
      }

      const audioBuffer = ctx.createBuffer(1, bytes.length, sampleRate);
      audioBuffer.getChannelData(0).set(bytes);

      const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);
      setAudioBlob(wavBlob);
      toast.success("Bitstream Encoded to PCM");
    } catch (e) {
      console.error(e);
      toast.error("Data interpretation failed.");
    } finally {
      setProcessing(false);
    }
  };

  const bufferToWave = (abuf: AudioBuffer, len: number) => {
    const numOfChan = abuf.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample, offset = 0, pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuf.sampleRate);
    setUint32(abuf.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for(i=0; i<abuf.numberOfChannels; i++) channels.push(abuf.getChannelData(i));

    while(pos < length) {
      for(i=0; i<numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }
    return new Blob([buffer], {type: "audio/wav"});
  };

  const playPreview = () => {
    if (!audioBlob || !audioContextRef.current) return;
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    const ctx = audioContextRef.current;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = await ctx.decodeAudioData(e.target?.result as ArrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    };
    reader.readAsArrayBuffer(audioBlob);
  };

  return (
    <div className="min-h-screen bg-background text-foreground theme-audio transition-all duration-500 overflow-x-hidden">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      
      <div className="flex justify-center items-start w-full relative">
        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-left-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale border-border/50" />
        </aside>

        <main className="container mx-auto max-w-[1400px] px-6 py-12 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center gap-6">
              <Link to="/">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border/50 hover:bg-primary/5 transition-all group/back">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-shadow-glow">
                   Binary To <span className="text-primary italic">Audio</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Experimental Data-Bending Laboratory</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-8">
                {!file ? (
                  <Card className="glass-morphism border-primary/10 overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-muted/5 rounded-2xl shadow-inner p-10 select-none">
                     <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                      onClick={() => !processing && inputRef.current?.click()}
                      className="relative w-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 text-center transition-all cursor-pointer py-32 bg-background/50 hover:border-primary/40 hover:bg-primary/5 shadow-inner"
                    >
                      <div className="h-24 w-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform">
                         <Binary className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Load Byte-Stream</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag any file to hear its structure</p>
                        <KbdShortcut />
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 text-center">Interprets 16-bit Signed Integers as PCM Waves</p>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl p-0 relative">
                       <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                                <Radio className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                                <h3 className="text-xs font-black uppercase tracking-widest">{file.name}</h3>
                                <p className="text-[9px] opacity-40 font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR BENDING</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setFile(null); setAudioBlob(null); }} className="h-10 w-10 text-destructive hover:bg-destructive/10">
                             <RefreshCw className="h-4 w-4" />
                          </Button>
                       </div>
                       <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                          {processing ? (
                            <div className="space-y-4 text-center">
                               <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Decoding Artifact Structure...</p>
                            </div>
                          ) : audioBlob ? (
                            <div className="space-y-10 w-full max-w-md">
                               <div className="flex items-center justify-center gap-10">
                                  <Button onClick={playPreview} variant="outline" className="h-20 w-20 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all scale-110">
                                     {isPlaying ? <Pause className="h-8 w-8 text-primary" /> : <Play className="h-8 w-8 text-primary fill-current" />}
                                  </Button>
                               </div>
                               <Button asChild className="w-full h-20 text-lg font-black rounded-3xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tighter hover:scale-[1.02] active:scale-[0.98] transition-all">
                                  <a href={URL.createObjectURL(audioBlob)} download={`glitch_${file.name.split('.')[0]}.wav`}>
                                     <Download className="h-6 w-6" /> Download Glitch-Track
                                  </a>
                               </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center opacity-20">
                               <Radio className="h-16 w-16 mb-4 animate-in fade-in" />
                               <p className="text-[10px] font-black uppercase tracking-widest uppercase">Select Sample Rate to begin</p>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
                <Card className="glass-morphism border-primary/10 rounded-3xl overflow-hidden shadow-xl">
                   <div className="bg-primary/5 p-5 border-b border-primary/10 flex items-center gap-3">
                      <Zap className="h-4 w-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">PCM Configuration</h3>
                   </div>
                   <CardContent className="p-8 space-y-10">
                      <div className="space-y-6">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground/60">Sample Rate</span>
                            <span className="text-primary italic">{sampleRate} Hz</span>
                         </div>
                         <Slider 
                           min={1000} max={48000} step={1000}
                           value={[sampleRate]}
                           onValueChange={([v]) => { setSampleRate(v); setAudioBlob(null); }}
                         />
                         <p className="text-[8px] opacity-40 leading-relaxed uppercase font-black tracking-tighter">Lower rates result in industrial/drone textures. Higher rates reveal high-frequency structural noise.</p>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <Button 
                          onClick={processBinary} 
                          disabled={!file || processing || audioBlob !== null} 
                          className="w-full h-20 text-lg font-black rounded-[28px] gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                           <Zap className={`h-6 w-6 ${processing ? 'animate-pulse' : ''}`} />
                           {processing ? "Bending..." : "Interpret Bitstream"}
                        </Button>
                      </div>
                   </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </main>

        <aside className="hidden min-[1850px]:flex flex-col gap-10 sticky top-32 w-[300px] shrink-0 px-6 py-8 animate-in fade-in slide-in-from-right-8 duration-1000">
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale border-border/50" />
           <AdPlaceholder format="rectangle" className="opacity-40 grayscale border-border/50" />
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default BinaryToAudio;
