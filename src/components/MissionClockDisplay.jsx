import { useState, useEffect } from "react";
import { formatDurationLong } from "../lib/missionData";

function ClockDigit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-muted/60 border border-border/50 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[40px] sm:min-w-[52px] text-center">
        <span className="text-lg sm:text-2xl font-mono font-bold text-foreground tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

export default function MissionClockDisplay({ label, targetMs, type = "countdown", accent = "primary" }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ms = type === "countdown" ? Math.max(0, targetMs - now) : Math.max(0, now - targetMs);
  const { days, hours, minutes, seconds } = formatDurationLong(ms);

  const accentColors = {
    primary: "border-primary/30",
    secondary: "border-secondary/30",
    accent: "border-accent/30",
    green: "border-green-500/30",
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl border ${accentColors[accent] || accentColors.primary} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground/70">
          {type === "countdown" ? "T−" : "T+"}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <ClockDigit value={days} label="Days" />
        <span className="text-lg sm:text-2xl font-mono text-muted-foreground/50 mb-4">:</span>
        <ClockDigit value={hours} label="Hrs" />
        <span className="text-lg sm:text-2xl font-mono text-muted-foreground/50 mb-4">:</span>
        <ClockDigit value={minutes} label="Min" />
        <span className="text-lg sm:text-2xl font-mono text-muted-foreground/50 mb-4">:</span>
        <ClockDigit value={seconds} label="Sec" />
      </div>
    </div>
  );
}