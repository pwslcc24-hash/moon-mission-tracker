import { Rocket } from "lucide-react";
import { formatNumber } from "../lib/missionData";

export default function EarthMoonTracker({ progress }) {
  const percent = progress?.percent || 0;
  const rocketPosition = Math.min(Math.max(percent, 1), 99);

  return (
    <div className="relative w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6 overflow-hidden">
      {/* Data label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Earth → Moon Transit
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
          {progress?.dataLabel === "estimated"
            ? "⏱ Estimated from timeline"
            : progress?.dataLabel === "live"
            ? "🟢 Live telemetry"
            : "🔵 Demo simulation"}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-28 sm:h-32 flex items-center">
        {/* Route line */}
        <div className="absolute left-14 right-14 sm:left-16 sm:right-16 top-1/2 -translate-y-1/2 h-[2px]">
          <div className="w-full h-full bg-border/40 rounded-full" />
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-secondary/80 rounded-full transition-all duration-1000"
            style={{ width: `${rocketPosition}%` }}
          />
          {/* Dashed markings */}
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute top-1/2 -translate-y-1/2 w-[1px] h-3 bg-muted-foreground/30"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>

        {/* Earth */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center text-xs font-bold text-white">
            🌍
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Earth</span>
        </div>

        {/* Rocket */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out"
          style={{ left: `calc(${rocketPosition}% * 0.72 + 11%)` }}
        >
          <div className="relative flex flex-col items-center -translate-x-1/2">
            <div className="relative" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-primary rotate-[-45deg]" />
              {/* Flame */}
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-gradient-to-b from-orange-400 to-transparent rounded-full opacity-70"
                style={{ animation: 'rocket-flame 0.5s ease-in-out infinite', transform: 'translateX(-50%) rotate(45deg)' }}
              />
            </div>
            <span className="text-[10px] font-mono text-primary mt-1 whitespace-nowrap font-semibold">
              {percent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Moon */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 shadow-lg shadow-gray-400/20 flex items-center justify-center text-xs font-bold">
            🌙
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-medium">Moon</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-3 text-xs sm:text-sm">
        <div className="text-muted-foreground">
          <span className="text-foreground font-semibold">{formatNumber(progress?.distanceTraveledKm || 0)}</span> km traveled
        </div>
        <div className="text-muted-foreground text-right">
          <span className="text-foreground font-semibold">{formatNumber(progress?.distanceRemainingKm || 0)}</span> km remaining
        </div>
      </div>
    </div>
  );
}