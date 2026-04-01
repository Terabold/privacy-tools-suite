import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatTime, cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface VideoTimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  showRange?: boolean;
  range?: [number, number];
  onRangeChange?: (range: [number, number]) => void;
  className?: string;
}

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  videoRef,
  src,
  currentTime,
  duration,
  onSeek,
  showRange = false,
  range = [0, 0],
  onRangeChange,
  className
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

  // Fluid Playhead Logic using requestAnimationFrame for 60fps smoothness
  const [displayTime, setDisplayTime] = useState(currentTime);
  const rAFRef = useRef<number>();

  useEffect(() => {
    const update = () => {
      if (videoRef.current && !videoRef.current.paused) {
        setDisplayTime(videoRef.current.currentTime);
      }
      rAFRef.current = requestAnimationFrame(update);
    };
    rAFRef.current = requestAnimationFrame(update);
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [videoRef]);

  // Sync internal displayTime with external currentTime prop (for seeks/jumps)
  useEffect(() => {
    setDisplayTime(currentTime);
  }, [currentTime]);

  // Filmstrip generation logic
  useEffect(() => {
    if (!src || !duration || duration <= 0 || duration === Infinity) {
      setThumbnails([]);
      return;
    }
    
    let isMounted = true;
    const generate = async () => {
      setIsGenerating(true);
      const count = 12;
      const thumbs: string[] = [];
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      
      try {
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = () => reject(new Error("Video load failed"));
          setTimeout(() => reject(new Error("Load timeout")), 8000);
        });

        if (video.readyState < 2) {
          await new Promise((resolve) => {
             video.oncanplay = resolve;
          });
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        const aspect = video.videoWidth / video.videoHeight || 16/9;
        canvas.width = 300;
        canvas.height = 300 / aspect;
        
        for (let i = 0; i < count; i++) {
          if (!isMounted) break;
          const time = (duration / count) * i;
          
          try {
            video.currentTime = time;
            await new Promise((resolve, reject) => {
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve(null);
              };
              video.addEventListener('seeked', onSeeked);
              setTimeout(() => reject(new Error("Seek timeout")), 2000);
            });

            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
            }
          } catch (itemErr) {
            console.warn(`Frame at ${time}s skipped:`, itemErr);
          }
        }
        
        if (isMounted && thumbs.length > 0) {
          setThumbnails(thumbs);
        }
      } catch (err) {
        console.error("Filmstrip generation aborted:", err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };
    
    generate();
    return () => { isMounted = false; };
  }, [src, duration]);

  const getPercent = (time: number) => (duration > 0 ? (time / duration) * 100 : 0);

  const calculateTimeFromX = (clientX: number) => {
    if (!containerRef.current || duration <= 0) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    return percent * duration;
  };

  const handlePointerDown = (e: React.PointerEvent, handle: 'start' | 'end' | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (handle) {
      setActiveHandle(handle);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } else {
      onSeek(calculateTimeFromX(e.clientX));
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !onRangeChange) return;
    
    const newTime = calculateTimeFromX(e.clientX);
    if (activeHandle === 'start') {
      onRangeChange([Math.min(newTime, range[1] - 0.05), range[1]]);
    } else {
      onRangeChange([range[0], Math.max(newTime, range[0] + 0.05)]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      setActiveHandle(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input/textarea
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, (videoRef.current ? videoRef.current.currentTime : displayTime) - 0.033));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(duration, (videoRef.current ? videoRef.current.currentTime : displayTime) + 0.033));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [displayTime, duration, onSeek]);

  return (
    <div 
      className={cn("relative h-20 w-full select-none focus:outline-none group/timeline px-2 pt-6 pb-2 rounded-2xl bg-black/60 border border-white/5 shadow-2xl", className)}
      tabIndex={0}
    >
      <div 
        ref={containerRef}
        className="absolute inset-x-4 bottom-2 top-6 bg-black/40 rounded-xl border border-white/10 cursor-crosshair shadow-inner"
        onPointerDown={(e) => activeHandle === null && handlePointerDown(e, null)}
        onPointerMove={(e) => {
          if (activeHandle) {
            handlePointerMove(e);
          } else if (e.buttons === 1) {
            onSeek(calculateTimeFromX(e.clientX));
          }
        }}
        onPointerUp={handlePointerUp}
      >
        {/* Filmstrip track - with own overflow hidden */}
        <div className="absolute inset-0 flex rounded-xl overflow-hidden">
          {thumbnails.length > 0 ? (
            thumbnails.map((thumb, i) => (
              <div key={i} className="h-full flex-1 border-r border-white/5 last:border-0 relative">
                <img 
                  src={thumb} 
                  className="w-full h-full object-cover opacity-60 transition-opacity duration-300" 
                  alt=""
                />
              </div>
            ))
          ) : isGenerating ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-0.5 w-1/3 bg-primary/20 rounded-full overflow-hidden">
                 <div className="h-full w-full bg-primary animate-progress-glow" />
              </div>
            </div>
          ) : null}
        </div>

        {/* Range Selection shading */}
        {showRange && (
          <>
            <div 
              className="absolute inset-y-0 left-0 bg-black/60 backdrop-blur-[1px] z-10 border-r border-primary/20 pointer-events-none" 
              style={{ width: `${getPercent(range[0])}%` }}
            />
            <div 
              className="absolute inset-y-0 right-0 bg-black/60 backdrop-blur-[1px] z-10 border-l border-primary/20 pointer-events-none" 
              style={{ width: `${100 - getPercent(range[1])}%` }}
            />
          </>
        )}
        {/* Manual Handles - INSIDE track for perfect sync */}
        {showRange && onRangeChange && (
          <>
            {/* Start Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'start')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              role="slider"
              aria-label="Start Trim Handle"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={range[0]}
              className={cn(
                "absolute inset-y-0 w-10 -ml-5 z-50 cursor-ew-resize group/handle flex items-center justify-center transition-transform",
                activeHandle === 'start' && "scale-110"
              )}
              style={{ left: `${getPercent(range[0])}%` }}
            >
              <div className="h-full w-1 bg-primary relative flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-5 bg-primary rounded-md shadow-2xl border border-white/20 flex items-center justify-center ring-4 ring-primary/10 transition-transform">
                      <GripVertical className="h-3 w-3 text-white opacity-80" />
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg opacity-0 group-hover/handle:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50">
                      {formatTime(range[0])}
                  </div>
                  <div className="absolute top-0 -translate-y-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-primary tracking-widest bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">IN</div>
              </div>
            </div>

            {/* End Handle */}
            <div
              onPointerDown={(e) => handlePointerDown(e, 'end')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              role="slider"
              aria-label="End Trim Handle"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={range[1]}
              className={cn(
                "absolute inset-y-0 w-10 -ml-5 z-50 cursor-ew-resize group/handle flex items-center justify-center transition-transform",
                activeHandle === 'end' && "scale-110"
              )}
              style={{ left: `${getPercent(range[1])}%` }}
            >
              <div className="h-full w-1 bg-primary relative flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-5 bg-primary rounded-md shadow-2xl border border-white/20 flex items-center justify-center ring-4 ring-primary/10 transition-transform">
                      <GripVertical className="h-3 w-3 text-white opacity-80" />
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg opacity-0 group-hover/handle:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50">
                      {formatTime(range[1])}
                  </div>
                  <div className="absolute top-0 -translate-y-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-primary tracking-widest bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">OUT</div>
              </div>
            </div>
          </>
        )}

        {/* Playhead - INSIDE track with subtle glow */}
        <motion.div 
          className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-40 pointer-events-none"
          animate={{ left: `${getPercent(displayTime)}%` }}
          transition={{ type: "tween", ease: "linear", duration: 0.05 }}
        />
      </div>
    </div>
  );
};

export default VideoTimeline;
