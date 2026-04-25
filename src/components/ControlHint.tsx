import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ControlHintProps {
  label: string;
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  rows?: Array<{
    label: string;
    description: string;
  }>;
}

const ControlHint = ({ label, children, className, title, description, rows }: ControlHintProps) => (
  <Tooltip delayDuration={450}>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={`Explain ${label}`}
        data-no-global-help="true"
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary/70 transition-theme hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-premium",
          className,
        )}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" align="center" className="max-w-[320px] text-xs leading-relaxed">
      {title || description || rows ? (
        <div className="space-y-2.5">
          {title && <p className="font-black uppercase tracking-widest text-primary">{title}</p>}
          {description && <p className="text-muted-foreground">{description}</p>}
          {rows && rows.length > 0 && (
            <div className="space-y-1.5 border-t border-border/40 pt-2">
              {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[72px_1fr] gap-3">
                  <span className="font-black uppercase tracking-widest text-foreground">{row.label}</span>
                  <span className="text-muted-foreground">{row.description}</span>
                </div>
              ))}
            </div>
          )}
          {children}
        </div>
      ) : (
        children
      )}
    </TooltipContent>
  </Tooltip>
);

export default ControlHint;
