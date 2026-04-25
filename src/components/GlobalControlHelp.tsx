import { useEffect, useRef, useState } from "react";

type HelpState = {
  text: string;
  x: number;
  y: number;
};

const HELP_SELECTOR = "button[title]:not([data-no-global-help]), a[title]:not([data-no-global-help]), [data-control-help], button[aria-label]:not([data-no-global-help])";
const HOVER_DELAY = 520;

const getHelpText = (target: Element) => {
  const explicit = target.getAttribute("data-control-help");
  if (explicit) return explicit;

  const title = target.getAttribute("title");
  if (title) return title;

  const ariaLabel = target.getAttribute("aria-label");
  if (ariaLabel && !/^(close|menu|search|explain\b)/i.test(ariaLabel)) return ariaLabel;

  return "";
};

const GlobalControlHelp = () => {
  const [help, setHelp] = useState<HelpState | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef<Element | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const hide = () => {
      clearTimer();
      setHelp(null);
      activeRef.current = null;
    };

    const showFor = (element: Element) => {
      const text = getHelpText(element);
      if (!text || element.closest("[data-radix-popper-content-wrapper]")) return;

      activeRef.current = element;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (activeRef.current !== element) return;
        const rect = element.getBoundingClientRect();
        setHelp({
          text,
          x: Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140),
          y: Math.max(rect.top - 12, 16),
        });
      }, HOVER_DELAY);
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(HELP_SELECTOR);
      if (target) showFor(target);
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (!activeRef.current) return;
      const next = event.relatedTarget as Node | null;
      if (next && activeRef.current.contains(next)) return;
      hide();
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = (event.target as Element | null)?.closest?.(HELP_SELECTOR);
      if (target) showFor(target);
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", hide);
    document.addEventListener("keydown", hide);
    document.addEventListener("scroll", hide, true);

    return () => {
      clearTimer();
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", hide);
      document.removeEventListener("scroll", hide, true);
    };
  }, []);

  if (!help) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[500] max-w-[280px] -translate-x-1/2 -translate-y-full rounded-xl border border-primary/10 bg-popover/95 px-3 py-2 text-xs font-medium leading-relaxed text-popover-foreground shadow-lg shadow-black/10 backdrop-blur-xl"
      style={{ left: help.x, top: help.y }}
    >
      {help.text}
    </div>
  );
};

export default GlobalControlHelp;
