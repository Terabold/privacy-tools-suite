import { cn } from "@/lib/utils";

interface KbdShortcutProps {
  className?: string;
}

export const KbdShortcut = ({ className }: KbdShortcutProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-3 mt-6 animate-in fade-in zoom-in-95 duration-700", className)}>
      <div className="flex items-center gap-2">
        {/* Ctrl Key */}
        <div className="relative group/kbd">
           <div className="absolute inset-0 bg-zinc-400 dark:bg-black rounded-lg translate-y-[4px] blur-[2px] opacity-20 group-hover/kbd:opacity-30 transition-opacity" />
           <div className="relative px-3 py-1.5 min-w-[3.2rem] bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 border-b-[4px] border-b-zinc-300 dark:border-b-black rounded-lg shadow-sm flex items-center justify-center transition-all group-active/kbd:translate-y-[2px] group-active/kbd:border-b-[2px]">
              <span className="text-[10px] font-black uppercase tracking-tight text-foreground/70 dark:text-foreground/50">Ctrl</span>
           </div>
        </div>

        {/* Plus Sign */}
        <span className="text-muted-foreground/30 font-black text-sm">+</span>

        {/* V Key */}
        <div className="relative group/kbd">
           <div className="absolute inset-0 bg-primary/30 rounded-lg translate-y-[4px] blur-[2px] opacity-10 group-hover/kbd:opacity-20 transition-opacity" />
           <div className="relative px-4 py-1.5 min-w-[2.5rem] bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 border-b-[4px] border-b-zinc-300 dark:border-b-black rounded-lg shadow-sm flex items-center justify-center transition-all group-active/kbd:translate-y-[2px] group-active/kbd:border-b-[2px]">
              <span className="text-[11px] font-black uppercase tracking-tight text-primary italic">V</span>
           </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40 italic">Paste Artifact</span>
        <div className="h-[1px] w-8 bg-primary/20" />
      </div>
    </div>
  );
};
