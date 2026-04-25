import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("group/slider relative flex w-full touch-none select-none items-center py-2", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/70 shadow-inner transition-theme group-hover/slider:bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary transition-theme shadow-[0_0_14px_hsl(var(--primary)/0.28)]" />
    </SliderPrimitive.Track>
    {props.value ? (
      props.value.map((_, i) => (
        <SliderPrimitive.Thumb key={i} className="premium-slider-thumb block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background focus-premium disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-primary/20 hover:scale-125 active:scale-110 data-[state=dragging]:scale-125 data-[state=dragging]:shadow-lg data-[state=dragging]:shadow-primary/30" />
      ))
    ) : props.defaultValue ? (
      props.defaultValue.map((_, i) => (
        <SliderPrimitive.Thumb key={i} className="premium-slider-thumb block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background focus-premium disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-primary/20 hover:scale-125 active:scale-110 data-[state=dragging]:scale-125 data-[state=dragging]:shadow-lg data-[state=dragging]:shadow-primary/30" />
      ))
    ) : (
      <SliderPrimitive.Thumb className="premium-slider-thumb block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background focus-premium disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-primary/20 hover:scale-125 active:scale-110 data-[state=dragging]:scale-125 data-[state=dragging]:shadow-lg data-[state=dragging]:shadow-primary/30" />
    )}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
