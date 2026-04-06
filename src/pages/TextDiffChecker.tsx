import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Copy, History, Split, Type, Zap, Check, ClipboardCheck, Sparkles, Layout, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"; // assuming you have this from shadcn
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolExpertSection from "@/components/ToolExpertSection";
import SponsorSidebars from "@/components/SponsorSidebars";
import AdBox from "@/components/AdBox";
import { toast } from "sonner";
import * as Diff from "diff";

const TextDiffChecker = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffMode, setDiffMode] = useState<"lines" | "words" | "chars">("lines");
  const [liveMode, setLiveMode] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const toggleDark = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  // Debounced diff for live mode
  const diffResult = useMemo(() => {
    if (!original && !modified) return [];

    if (diffMode === "lines") {
      return Diff.diffLines(original, modified, { newlineIsToken: true });
    } else if (diffMode === "words") {
      return Diff.diffWords(original, modified);
    } else {
      return Diff.diffChars(original, modified);
    }
  }, [original, modified, diffMode]);

  // Improved stats: count actual changes
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;

    diffResult.forEach((part) => {
      if (part.added) {
        additions += diffMode === "lines"
          ? (part.value.match(/\n/g) || []).length + 1
          : part.value.length;
      }
      if (part.removed) {
        deletions += diffMode === "lines"
          ? (part.value.match(/\n/g) || []).length + 1
          : part.value.length;
      }
    });

    return { additions, deletions };
  }, [diffResult, diffMode]);

  const handleCopy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const handleReset = () => {
    setOriginal("");
    setModified("");
    setShowResult(false);
    toast.success("Workspace Purged");
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
    toast.success("Artifacts Swapped");
  };

  const handleRunDiff = () => {
    if (!original.trim() && !modified.trim()) {
      toast.error("No Artifacts Detected");
      return;
    }
    setShowResult(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Auto-run in live mode
  useEffect(() => {
    if (liveMode && (original || modified)) {
      setShowResult(true);
    }
  }, [original, modified, liveMode, diffMode]);

  const totalOriginalLines = original.split(/\r\n|\r|\n/).length;
  const totalModifiedLines = modified.split(/\r\n|\r|\n/).length;

  return (
    <div className="min-h-screen bg-background text-foreground theme-image transition-all duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="flex justify-center items-start w-full relative">
        <SponsorSidebars position="left" />

        <main className="container mx-auto max-w-[1600px] px-4 py-8 grow">
          <div className="flex flex-col gap-10">
            <header className="flex items-center justify-between flex-wrap gap-8">
              <div className="flex items-center gap-6">
                <Link to="/">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border border-border dark:border-white/20 hover:bg-primary/10 dark:hover:bg-primary/20 transition-all group/back bg-background/80 dark:bg-black/60 shadow-xl dark:shadow-2xl">
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter font-display uppercase italic text-foreground dark:text-white text-shadow-glow">
                    Forensic <span className="text-primary italic">Diff Studio</span>
                  </h1>
                  <p className="text-muted-foreground mt-2 font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40 text-[10px]">Private Side-by-Side Content Analysis</p>
                </div>
              </div>
            </header>

            {/* Mobile Inline Ad */}
            <div className="flex min-[1600px]:hidden justify-center mb-8 w-full">
              <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
            </div>

            <div className="flex flex-col gap-12 w-full">
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="glass-morphism border-border dark:border-primary/10 overflow-x-clip relative bg-zinc-100 dark:bg-[#0a0a0a] shadow-lg dark:shadow-2xl rounded-2xl group flex flex-col min-h-[550px]">
                  {/* Header */}
                  <div className="px-4 pt-3 border-b border-border dark:border-white/5 flex items-end justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5 items-center bg-white dark:bg-[#111111] px-4 py-2 rounded-t-lg border-x border-t border-border dark:border-white/5 relative z-10 -mb-[1px]">
                        <History className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-zinc-400">Forensic Workspace</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-muted-foreground">Live</span>
                        <Switch checked={liveMode} onCheckedChange={setLiveMode} />
                      </div>

                      <Button onClick={handleRunDiff} disabled={liveMode} className="h-9 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest italic rounded-xl">
                        Run Forensic Diff
                      </Button>

                      <Button size="icon" variant="ghost" onClick={handleSwap} title="Swap">
                        <Layout className="h-4 w-4" />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => handleCopy(original + "\n\n" + modified, "Full Source Copied")}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={handleReset} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row bg-white dark:bg-black min-h-[550px]">
                    {/* Original */}
                    <div className="flex-1 border-b md:border-b-0 md:border-r border-border dark:border-white/5 flex flex-col">
                      <div className="px-6 pt-4 pb-2 flex justify-between items-center border-b border-border dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ORIGINAL ARTIFACT</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{totalOriginalLines} lines</span>
                      </div>
                      <textarea
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        placeholder="Paste original text here..."
                        className="flex-1 w-full p-6 font-mono text-sm bg-transparent resize-none outline-none selection:bg-primary/20 leading-relaxed custom-scrollbar"
                        spellCheck={false}
                      />
                    </div>

                    {/* Modified */}
                    <div className="flex-1 flex flex-col">
                      <div className="px-6 pt-4 pb-2 flex justify-between items-center border-b border-border dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">MODIFIED VERSION</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{totalModifiedLines} lines</span>
                      </div>
                      <textarea
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        placeholder="Paste modified version here..."
                        className="flex-1 w-full p-6 font-mono text-sm bg-transparent resize-none outline-none selection:bg-primary/20 leading-relaxed custom-scrollbar"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </Card>

                {/* Diff Result */}
                {showResult && (
                  <Card ref={resultRef} className="glass-morphism border-border dark:border-primary/10 overflow-hidden shadow-lg dark:shadow-2xl rounded-2xl">
                    <div className="px-6 py-5 border-b border-border dark:border-white/5 bg-background/70 backdrop-blur flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Split className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black uppercase tracking-widest text-sm">Diff Result</h3>
                          <p className="text-[10px] text-muted-foreground">Forensic Comparison</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> +{stats.additions}
                          </span>
                          <span className="flex items-center gap-1.5 text-destructive">
                            <div className="w-2 h-2 rounded-full bg-destructive" /> -{stats.deletions}
                          </span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="capitalize text-xs font-bold px-4">
                              {diffMode} <ChevronDown className="ml-2 h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {["lines", "words", "chars"].map((mode) => (
                              <DropdownMenuItem key={mode} onClick={() => setDiffMode(mode as any)}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          onClick={() => handleCopy(diffResult.map(p => p.value).join(""), "Diff Result Copied")}
                          variant="outline"
                          className="gap-2 text-xs"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          Copy Diff
                        </Button>

                        <Button onClick={handleReset} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-8 font-mono text-[14px] leading-[1.75] bg-white dark:bg-black min-h-[320px] max-h-[720px] overflow-auto custom-scrollbar">
                      {diffResult.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          No differences detected
                        </div>
                      ) : (
                        diffResult.map((part, index) => {
                          let className = "transition-all duration-200";

                          if (part.added) {
                            className += " bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1 rounded";
                          } else if (part.removed) {
                            className += " bg-red-500/15 text-red-700 dark:text-red-400 line-through decoration-wavy px-1 rounded";
                          } else {
                            className += " text-foreground/80 dark:text-zinc-300";
                          }

                          return (
                            <span key={index} className={className}>
                              {part.value}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <ToolExpertSection
              title="Forensic Text Comparison Studio"
              description="The Text Diff Checker is a professional-grade analysis suite designed for developers, legal content reviewers, and writers who need to perform private 1:1 artifact comparisons."
              transparency="Our engine utilizes the high-precision 'diff' computation library, running entirely within your browser's local sandbox."
              limitations="Very large texts (over 100,000 characters) may cause slight lag in Live mode. For best performance, use Line mode."
              accent="violet"
            />
          </div>
        </main>

        <SponsorSidebars position="right" />
      </div>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-background/80 dark:bg-black/80 backdrop-blur-sm border-t border-border dark:border-white/10 py-2 h-[66px]">
        <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
      </div>
    </div>
  );
};

export default TextDiffChecker;