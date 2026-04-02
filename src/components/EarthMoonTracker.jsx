import DistanceDisplay from "./DistanceDisplay";
import { MISSION } from "../lib/missionData";

const LAUNCH_MS     = new Date(MISSION.launchDate).getTime();
const ARRIVAL_MS    = new Date(MISSION.lunarArrivalDate).getTime();
const FLYBY_DUR_MS  = 6 * 60 * 60 * 1000; // 6-hour flyby window
const FLYBY_END_MS  = ARRIVAL_MS + FLYBY_DUR_MS;
const RETURN_MS     = new Date(MISSION.returnDate).getTime();

function getMissionPhase(now = Date.now()) {
  if (now < LAUNCH_MS)    return { phase: "Pre-Launch",      t: 0,   segment: "outbound" };
  if (now < ARRIVAL_MS)   return { phase: "Outbound",        t: (now - LAUNCH_MS) / (ARRIVAL_MS - LAUNCH_MS),   segment: "outbound" };
  if (now < FLYBY_END_MS) return { phase: "Lunar Flyby",     t: (now - ARRIVAL_MS) / FLYBY_DUR_MS,              segment: "flyby" };
  if (now < RETURN_MS)    return { phase: "Return to Earth", t: (now - FLYBY_END_MS) / (RETURN_MS - FLYBY_END_MS), segment: "return" };
  return { phase: "Splashdown", t: 1, segment: "return" };
}

const ACCURACY_LABEL = {
  "live telemetry": { icon: "🟢", text: "Live telemetry" },
  "estimated":      { icon: "🔵", text: "Calculated from mission timeline" },
  "last-known":     { icon: "🟡", text: "Last known position" },
};

export default function EarthMoonTracker({ progress, positionSource, positionAccuracy }) {
  const now = Date.now();
  const { phase, t, segment } = getMissionPhase(now);
  const accuracy = positionAccuracy || "estimated";
  const label = ACCURACY_LABEL[accuracy] || ACCURACY_LABEL["estimated"];

  // Rocket position: 0–1 along the visual track
  // Outbound: left (Earth) → right (Moon)
  // Flyby: stays near Moon (arc)
  // Return: right (Moon) → left (Earth)
  const clampedT = Math.min(1, Math.max(0, t));

  // SVG layout constants
  const W = 400, H = 110;
  const earthX = 32, moonX = W - 32;
  const outY = 35, retY = 75;
  const moonCY = (outY + retY) / 2;
  const arcR = (retY - outY) / 2; // radius of flyby arc

  // Rocket (x, y, angle) depending on segment
  let rx, ry, rAngle;
  if (segment === "outbound") {
    rx = earthX + clampedT * (moonX - arcR - earthX - 10);
    ry = outY;
    rAngle = -45; // nose toward Moon (right-up)
  } else if (segment === "flyby") {
    // Arc from top of moon circle to bottom
    const arcAngle = -90 + clampedT * 180; // -90° (top) → +90° (bottom)
    const rad = (arcAngle * Math.PI) / 180;
    rx = moonX + Math.sin(rad) * (arcR + 4);
    ry = moonCY - Math.cos(rad) * (arcR + 4);
    // Rocket points tangentially around the arc
    rAngle = arcAngle + 90;
  } else {
    rx = moonX - arcR - 10 - clampedT * (moonX - arcR - earthX - 10);
    ry = retY;
    rAngle = 135; // nose toward Earth (left-up)
  }

  return (
    <div className="relative w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Full Round-Trip Trajectory
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground" title={positionSource || ""}>
          {label.icon} {label.text}
        </span>
      </div>

      {/* Phase badge */}
      <div className="flex justify-center mb-2">
        <span className={`text-[11px] font-mono font-semibold px-3 py-0.5 rounded-full border ${
          segment === "outbound" ? "bg-primary/10 border-primary/30 text-primary" :
          segment === "flyby"    ? "bg-accent/10 border-accent/30 text-accent" :
                                   "bg-secondary/10 border-secondary/30 text-secondary"
        }`}>
          {phase}
        </span>
      </div>

      {/* SVG Track */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "110px" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outbound track */}
          <line x1={earthX + 16} y1={outY} x2={moonX - arcR} y2={outY} stroke="hsl(222,30%,25%)" strokeWidth="2" strokeDasharray="4 3" />
          {/* Outbound progress fill */}
          {segment === "outbound" && (
            <line x1={earthX + 16} y1={outY} x2={rx} y2={outY} stroke="hsl(217,91%,60%)" strokeWidth="2" />
          )}
          {(segment === "flyby" || segment === "return") && (
            <line x1={earthX + 16} y1={outY} x2={moonX - arcR} y2={outY} stroke="hsl(217,91%,60%)" strokeWidth="2" />
          )}

          {/* Moon arc (flyby) */}
          <path
            d={`M ${moonX - arcR} ${outY} A ${arcR} ${arcR} 0 0 1 ${moonX - arcR} ${retY}`}
            fill="none" stroke="hsl(222,30%,25%)" strokeWidth="2" strokeDasharray="4 3"
          />
          {(segment === "flyby" || segment === "return") && (
            <path
              d={`M ${moonX - arcR} ${outY} A ${arcR} ${arcR} 0 0 1 ${moonX - arcR} ${retY}`}
              fill="none" stroke="hsl(265,70%,60%)" strokeWidth="2"
              strokeDashoffset={segment === "flyby" ? String((1 - clampedT) * Math.PI * arcR) : "0"}
              strokeDasharray={String(Math.PI * arcR)}
            />
          )}

          {/* Return track */}
          <line x1={moonX - arcR} y1={retY} x2={earthX + 16} y2={retY} stroke="hsl(222,30%,25%)" strokeWidth="2" strokeDasharray="4 3" />
          {segment === "return" && (
            <line x1={moonX - arcR} y1={retY} x2={rx} y2={retY} stroke="hsl(180,60%,45%)" strokeWidth="2" />
          )}

          {/* Distance markers on outbound track */}
          {[25, 50, 75].map(pct => (
            <line key={pct} x1={earthX + 16 + (pct / 100) * (moonX - arcR - earthX - 16)} y1={outY - 4} x2={earthX + 16 + (pct / 100) * (moonX - arcR - earthX - 16)} y2={outY + 4} stroke="hsl(215,20%,35%)" strokeWidth="1" />
          ))}

          {/* Earth */}
          <circle cx={earthX} cy={moonCY} r="14" fill="url(#earthGrad)" />
          <defs>
            <radialGradient id="earthGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(200,80%,70%)" />
              <stop offset="50%" stopColor="hsl(140,60%,45%)" />
              <stop offset="100%" stopColor="hsl(210,70%,35%)" />
            </radialGradient>
          </defs>
          <text x={earthX} y={moonCY + 22} textAnchor="middle" fontSize="8" fill="hsl(215,20%,55%)">Earth</text>

          {/* Moon */}
          <circle cx={moonX} cy={moonCY} r="14" fill="url(#moonGrad)" />
          <defs>
            <radialGradient id="moonGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(0,0%,85%)" />
              <stop offset="100%" stopColor="hsl(0,0%,50%)" />
            </radialGradient>
          </defs>
          <text x={moonX} y={moonCY + 22} textAnchor="middle" fontSize="8" fill="hsl(215,20%,55%)">Moon</text>

          {/* Rocket */}
          <g transform={`translate(${rx}, ${ry}) rotate(${rAngle})`}>
            {/* Core stage */}
            <rect x="-3" y="-8" width="6" height="12" rx="1" fill="hsl(217,91%,75%)" />
            {/* Nose */}
            <path d="M0 -11 L3 -8 H-3 Z" fill="hsl(217,91%,85%)" />
            {/* Left SRB */}
            <rect x="-6" y="-5" width="2.5" height="9" rx="0.8" fill="hsl(217,91%,60%)" />
            {/* Right SRB */}
            <rect x="3.5" y="-5" width="2.5" height="9" rx="0.8" fill="hsl(217,91%,60%)" />
            {/* Flame */}
            <path d="M-2.5 4 Q0 8 2.5 4" fill="orange" opacity="0.9" />
            <path d="M-5 4 Q-4.5 6.5 -3.5 4" fill="orange" opacity="0.7" />
            <path d="M3.5 4 Q4.5 6.5 5 4" fill="orange" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-1">
        <div className="text-muted-foreground text-xs">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">Traveled</div>
          <DistanceDisplay km={progress?.distanceTraveledKm || 0} />
        </div>
        {positionSource && (
          <div className="text-[10px] text-muted-foreground/50 hidden sm:block text-center px-2">
            {positionSource}
          </div>
        )}
        <div className="text-muted-foreground text-right text-xs">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">Remaining</div>
          <DistanceDisplay km={progress?.distanceRemainingKm || 0} className="items-end" />
        </div>
      </div>
    </div>
  );
}