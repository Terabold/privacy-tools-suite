import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Download, Play, Pause, Music, Zap, CloudUpload, Layers, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdPlaceholder from "@/components/AdPlaceholder";
import { toast } from "sonner";
import { usePasteFile } from "@/hooks/usePasteFile";
import { KbdShortcut } from "@/components/KbdShortcut";

const AudioMonoStereo = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"mono-to-stereo" | "stereo-to-mono">("mono-to-stereo");
  
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
    setProcessedBlob(null);
    toast.success("Channel Artifact Staged");
  };

  usePasteFile(handleFile);

  const processChannels = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      let outBuffer: AudioBuffer;

      if (mode === "mono-to-stereo") {
        outBuffer = ctx.createBuffer(2, audioBuffer.length, audioBuffer.sampleRate);
        const monoData = audioBuffer.getChannelData(0);
        outBuffer.getChannelData(0).set(monoData);
        outBuffer.getChannelData(1).set(monoData);
      } else {
        outBuffer = ctx.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
        const monoChannel = outBuffer.getChannelData(0);
        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;
        
        for (let i = 0; i < audioBuffer.length; i++) {
          monoChannel[i] = (left[i] + right[i]) / 2;
        }
      }

      const wavBlob = bufferToWave(outBuffer, outBuffer.length);
      setProcessedBlob(wavBlob);
      toast.success("Channel Remapping Complete");
    } catch (e) {
      console.error(e);
      toast.error("Channel processing failed.");
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
    if (!processedBlob || !audioContextRef.current) return;
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
    reader.readAsArrayBuffer(processedBlob);
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
                   Mono / <span className="text-primary italic">Stereo</span>
                </h1>
                <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-40 text-[10px]">Professional Channel Remapping Studio</p>
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
                         <Layers className="h-12 w-12 text-primary" />
                      </div>
                      <div className="px-6 space-y-1">
                        <p className="text-3xl font-black text-foreground uppercase tracking-tighter italic leading-none text-shadow-glow">Deploy Hub Artifact</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Drag or click to browse</p>
                        <KbdShortcut />
                        <p className="mt-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-20 text-center">MP3, WAV, OGG Support • Channel Bit-Mapping</p>
                      </div>
                      <input ref={inputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-8">
                    <Card className="glass-morphism border-primary/10 rounded-2xl overflow-hidden shadow-2xl p-0 relative">
                       <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                                <Music className="h-5 w-5 text-primary" />
                             </div>
                             <div>
                                <h3 className="text-xs font-black uppercase tracking-widest">{file.name}</h3>
                                <p className="text-[9px] opacity-40 font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR REMAPPING</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setFile(null); setProcessedBlob(null); }} className="h-10 w-10 text-destructive hover:bg-destructive/10">
                             <RefreshCw className="h-4 w-4" />
                          </Button>
                       </div>
                       <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                          {processing ? (
                            <div className="space-y-4 text-center">
                               <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Mapping Channel Matrix...</p>
                            </div>
                          ) : processedBlob ? (
                            <div className="space-y-10 w-full max-w-md">
                               <div className="flex items-center justify-center gap-10">
                                  <Button onClick={playPreview} variant="outline" className="h-20 w-20 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all scale-110">
                                     {isPlaying ? <Pause className="h-8 w-8 text-primary" /> : <Play className="h-8 w-8 text-primary fill-current" />}
                                  </Button>
                               </div>
                               <Button asChild className="w-full h-20 text-lg font-black rounded-3xl gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tighter hover:scale-[1.02] active:scale-[0.98] transition-all">
                                  <a href={URL.createObjectURL(processedBlob)} download={`remapped_${file.name.split('.')[0]}.wav`}>
                                     <Download className="h-6 w-6" /> Download Artifact
                                  </a>
                               </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center opacity-20 text-center">
                               <Radio className="h-16 w-16 mb-4 animate-in fade-in" />
                               <p className="text-[10px] font-black uppercase tracking-widest uppercase">Select adaptation mode</p>
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
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Channel Strategy</h3>
                   </div>
                   <CardContent className="p-8 space-y-10">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none">Mapping Mode</label>
                         <Select value={mode} onValueChange={(v: any) => { setMode(v); setProcessedBlob(null); }}>
                            <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-tighter italic">
                               <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-white/10 bg-zinc-950/95 backdrop-blur-3xl">
                               <SelectItem value="mono-to-stereo" className="font-black uppercase tracking-tighter text-xs">Mono ➔ Stereo</SelectItem>
                               <SelectItem value="stereo-to-mono" className="font-black uppercase tracking-tighter text-xs">Stereo ➔ Mono</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <Button 
                          onClick={processChannels} 
                          disabled={!file || processing || processedBlob !== null} 
                          className="w-full h-20 text-lg font-black rounded-[28px] gap-3 shadow-2xl shadow-primary/20 italic uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                           <Zap className={`h-6 w-6 ${processing ? 'animate-pulse' : ''}`} />
                           {processing ? "Mapping..." : "Deploy Remapping"}
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

export default AudioMonoStereo;
