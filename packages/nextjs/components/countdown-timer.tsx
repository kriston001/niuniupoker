"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  className?: string;
}

export function CountdownTimer({ initialSeconds, onComplete, className }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  // 👇 加这段：当 props 改变时更新秒数
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onComplete]);

  // Format seconds as MM:SS
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate color based on remaining time
  const getColor = () => {
    if (seconds < 10) return "text-red-500";
    if (seconds < 30) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn("font-mono font-bold text-4xl", getColor())}>{formatTime()}</div>
      <div className="text-xs text-zinc-400 mt-1">Time Remaining</div>
    </div>
  );
}
