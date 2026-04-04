import React from "react";
import AdBox from "./AdBox";
import { cn } from "@/lib/utils";

interface SponsorSidebarsProps {
  position: "left" | "right";
  className?: string;
}

/**
 * Standardized Sponsor Sidebar component for the Privacy Tools Suite.
 * Fixes positioning issues where sidebars were causing horizontal clipping on 1080p.
 * Visible only on 1600px screens and larger.
 */
const SponsorSidebars = ({ position, className }: SponsorSidebarsProps) => {
  return (
    <aside 
      className={cn(
        "hidden min-[1600px]:flex flex-col gap-10 sticky top-24 w-[300px] shrink-0 duration-1000 animate-in fade-in pt-8",
        position === "left" 
            ? "slide-in-from-left-8 ml-8 mr-12" 
            : "slide-in-from-right-8 ml-12 mr-8",
        className
      )}
    >
      {/* Top Ad (300x250) */}
      <AdBox width={300} height={250} label="300x250 AD" />

      {/* Bottom Sticky Ad (300x600) */}
      <div className="pt-20">
        <AdBox width={300} height={600} label="300x600 AD" className="sticky top-40" />
      </div>
    </aside>
  );
};

export default SponsorSidebars;

