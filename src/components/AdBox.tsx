import React, { useEffect } from 'react';
import { cn } from "@/lib/utils";

interface AdBoxProps {
  width?: number | string;
  height?: number | string;
  label?: string;
  className?: string;
  isSticky?: boolean;
}

const AdBox = ({ width, height, label = "AD SPACE", className, isSticky }: AdBoxProps) => {
  // Vite מזהה אוטומטית: true כשאתה על המחשב שלך, false כשהאתר באוויר
  const isLocalDev = import.meta.env.DEV;

  useEffect(() => {
    // טוען את המודעה של גוגל רק כשהאתר חי באוויר
    if (!isLocalDev) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, [isLocalDev]);

  const styleParams = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  // מצב 1: פיתוח מקומי (מה שאתה רואה עכשיו על המחשב/בטלפון בבית)
  if (isLocalDev) {
    return (
      <div
        className={cn(
          "bg-black text-white flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em] border border-white/10 shrink-0",
          isSticky && "sticky top-24",
          className
        )}
        style={styleParams}
      >
        {label}
      </div>
    );
  }

  // מצב 2: פרודקשן (מה שהמשתמשים יראו כשהאתר יהיה באוויר)
  return (
    <div
      className={cn(
        "bg-transparent flex items-center justify-center shrink-0 overflow-hidden",
        isSticky && "sticky top-24",
        className
      )}
      style={styleParams}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" /* עליך להחליף את זה במספר הלקוח שלך מגוגל */
        data-ad-slot="YYYYYYYYYY"               /* עליך להחליף את זה במספר המודעה שלך מגוגל */
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBox;