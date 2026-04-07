import DistanceDisplay from "./DistanceDisplay";

// Mission phase timestamps — sourced from NASA official data & Wikipedia Artemis II
// Launch: 2026-04-01T22:35:12Z (confirmed exact time, Wikipedia infobox)
// Flyby: April 6 confirmed by NASA; 7,600 km closest approach
// Splashdown: NET 2026-04-11T00:21:00Z (Wikipedia Artemis II infobox)
const LAUNCH_TIME    = new Date("2026-04-01T22:35:12Z").getTime();
const FLYBY_START    = new Date("2026-04-06T18:00:00Z").getTime();
const FLYBY_END      = new Date("2026-04-07T06:00:00Z").getTime();
const RETURN_END     = new Date("2026-04-11T00:21:00Z").getTime();

// SVG layout constants
const VB_W = 500;
const VB_H = 120;
const EARTH_X = 32;
const MOON_X  = 468;
const MID_Y   = 60;
const OUT_Y   = 52;   // outbound track y
const RET_Y   = 68;   // return track y

// Compute rocket x,y and rotation from mission time
function getRocketState(now) {
  if (now < LAUNCH_TIME) {
    return { x: EARTH_X + 18, y: OUT_Y, rotate: -45, phase: "Pre-Launch", segment: "outbound", t: 0 };
  }

  if (now < FLYBY_START) {
    // Outbound coast
    const t = (now - LAUNCH_TIME) / (FLYBY_START - LAUNCH_TIME);
    const x = EARTH_X + 18 + t * (MOON_X - 26 - (EARTH_X + 18));
    return { x, y: OUT_Y, rotate: -45, phase: "Outbound", segment: "outbound", t };
  }

  if (now < FLYBY_END) {
    // Flyby arc — orbit around Moon's far side (right side)
    const t = (now - FLYBY_START) / (FLYBY_END - FLYBY_START);
    // Start angle: upper-left of Moon (approaching from outbound track)
    // End angle: lower-left of Moon (departing on return track)
    // Arc goes rightward (through far side) — the long way around
    const startA = Math.atan2(OUT_Y - MID_Y, (MOON_X - 26) - MOON_X); // ≈ upper-left
    const endA   = Math.atan2(RET_Y - MID_Y, (MOON_X - 26) - MOON_X); // ≈ lower-left
    const sweep  = endA - startA; // positive sweep goes through far (right) side
    const R = Math.sqrt(Math.pow((MOON_X - 26) - MOON_X, 2) + Math.pow(OUT_Y - MID_Y, 2));
    const a = startA + t * sweep;
    const x = MOON_X + R * Math.cos(a);
    const y = MID_Y  + R * Math.sin(a);
    const tDx = -Math.sin(a);
    const tDy =  Math.cos(a);
    const rotate = Math.atan2(tDy, tDx) * (180 / Math.PI) - 90;
    return { x, y, rotate, phase: "Lunar Flyby", segment: "flyby", t };
  }

  if (now < RETURN_END) {
    // Return coast
    const t = (now - FLYBY_END) / (RETURN_END - FLYBY_END);
    const x = MOON_X - 26 - t * (MOON_X - 26 - (EARTH_X + 18));
    return { x, y: RET_Y, rotate: 135, phase: "Returning to Earth", segment: "return", t };
  }

  // Splashdown
  return { x: EARTH_X + 18, y: RET_Y, rotate: 135, phase: "Earth Return", segment: "return", t: 1 };
}

const PHASE_COLORS = {
  "Pre-Launch":        "text-muted-foreground",
  "Outbound":          "text-primary",
  "Lunar Flyby":       "text-yellow-400",
  "Returning to Earth":"text-secondary",
  "Earth Return":      "text-green-400",
};

export default function EarthMoonTracker({ progress, positionSource, positionAccuracy }) {
  const now = Date.now();
  const rocket = getRocketState(now);

  // Outbound fill progress (0–1)
  const outProgress = rocket.segment === "outbound" ? rocket.t
    : rocket.segment === "flyby" || rocket.segment === "return" ? 1 : 0;

  // Return fill progress (0–1)
  const retProgress = rocket.segment === "return" ? rocket.t : 0;

  // Outbound track length (x distance)
  const trackLen = MOON_X - 26 - (EARTH_X + 18);

  return (
    <div className="relative w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Free-Return Trajectory
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/50 ${PHASE_COLORS[rocket.phase] || "text-muted-foreground"}`}>
          {rocket.phase}
        </span>
      </div>

      {/* SVG track */}
      <div className="w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full"
          style={{ height: "clamp(100px, 22vw, 140px)" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ── Outbound track (background) ── */}
          <line
            x1={EARTH_X + 18} y1={OUT_Y}
            x2={MOON_X - 26}  y2={OUT_Y}
            stroke="hsl(222 30% 22%)" strokeWidth="2" strokeLinecap="round"
          />
          {/* Outbound track fill */}
          <line
            x1={EARTH_X + 18} y1={OUT_Y}
            x2={EARTH_X + 18 + outProgress * trackLen} y2={OUT_Y}
            stroke="hsl(217 91% 60%)" strokeWidth="2" strokeLinecap="round"
            opacity="0.85"
          />

          {/* ── Return track (background) ── */}
          <line
            x1={EARTH_X + 18} y1={RET_Y}
            x2={MOON_X - 26}  y2={RET_Y}
            stroke="hsl(222 30% 22%)" strokeWidth="2" strokeLinecap="round"
          />
          {/* Return track fill — grows right-to-left */}
          {retProgress > 0 && (
            <line
              x1={MOON_X - 26 - retProgress * trackLen} y1={RET_Y}
              x2={MOON_X - 26} y2={RET_Y}
              stroke="hsl(180 60% 45%)" strokeWidth="2" strokeLinecap="round"
              opacity="0.85"
            />
          )}



          {/* ── Tick marks on outbound ── */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={EARTH_X + 18 + f * trackLen} y1={OUT_Y - 4}
              x2={EARTH_X + 18 + f * trackLen} y2={OUT_Y + 4}
              stroke="hsl(222 30% 30%)" strokeWidth="1"
            />
          ))}

          {/* ── Earth ── */}
          <circle cx={EARTH_X} cy={MID_Y} r="18" fill="url(#earthGrad)" />
          <circle cx={EARTH_X} cy={MID_Y} r="18" fill="url(#earthShine)" />
          <text x={EARTH_X} y={MID_Y + 28} textAnchor="middle" fontSize="9" fill="hsl(215 20% 55%)" fontFamily="monospace">Earth</text>

          {/* ── Moon ── */}
          <circle cx={MOON_X} cy={MID_Y} r="18" fill="url(#moonGrad)" />
          <circle cx={MOON_X} cy={MID_Y} r="18" fill="url(#moonShine)" />
          <text x={MOON_X} y={MID_Y + 28} textAnchor="middle" fontSize="9" fill="hsl(215 20% 55%)" fontFamily="monospace">Moon</text>

          {/* ── Rocket ── */}
          <g transform={`translate(${rocket.x}, ${rocket.y}) rotate(${rocket.segment === 'flyby' ? rocket.rotate : rocket.segment === 'return' ? -90 : 90})`}>
            {/* glow */}
            <circle r="10" fill="hsl(217 91% 60% / 0.12)" />
            {/* SLS body */}
            <rect x="-3" y="-10" width="6" height="14" rx="1" fill="hsl(217 91% 72%)" />
            {/* nose */}
            <path d="M 0,-14 L 3,-10 H -3 Z" fill="hsl(217 91% 85%)" />
            {/* left SRB */}
            <rect x="-6" y="-7" width="2.5" height="10" rx="0.7" fill="hsl(217 91% 62%)" />
            <path d="M -4.75,-9 L -3.5,-7 H -6 Z" fill="hsl(217 91% 72%)" />
            {/* right SRB */}
            <rect x="3.5" y="-7" width="2.5" height="10" rx="0.7" fill="hsl(217 91% 62%)" />
            <path d="M 4.75,-9 L 6,-7 H 3.5 Z" fill="hsl(217 91% 72%)" />
            {/* flame */}
            <path d="M -2.5,4 Q 0,8 2.5,4" fill="orange" opacity="0.9" style={{ animation: "rocket-flame 0.4s ease-in-out infinite" }} />
            <path d="M -5,3 Q -4,5.5 -3.5,3" fill="orange" opacity="0.7" />
            <path d="M 3.5,3 Q 4,5.5 5,3" fill="orange" opacity="0.7" />
          </g>
          {/* % label below rocket */}
          <text
            x={rocket.x}
            y={rocket.segment === 'return' ? rocket.y + 22 : rocket.y + 22}
            textAnchor="middle"
            fontSize="8"
            fill="hsl(217 91% 70%)"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {(() => {
              // overall trip percent across all segments
              const outDur   = FLYBY_START - LAUNCH_TIME;
              const flybyDur = FLYBY_END   - FLYBY_START;
              const retDur   = RETURN_END  - FLYBY_END;
              const total    = outDur + flybyDur + retDur;
              const now2     = Date.now();
              const elapsed  = Math.min(Math.max(now2 - LAUNCH_TIME, 0), total);
              return (elapsed / total * 100).toFixed(1) + "%";
            })()}
          </text>

          {/* Defs */}
          <defs>
            <radialGradient id="earthGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(210 80% 60%)" />
              <stop offset="50%" stopColor="hsl(140 50% 40%)" />
              <stop offset="100%" stopColor="hsl(210 70% 30%)" />
            </radialGradient>
            <radialGradient id="earthShine" cx="30%" cy="25%">
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="moonGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="hsl(220 10% 78%)" />
              <stop offset="100%" stopColor="hsl(220 10% 42%)" />
            </radialGradient>
            <radialGradient id="moonShine" cx="30%" cy="25%">
              <stop offset="0%" stopColor="white" stopOpacity="0.12" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-muted-foreground text-xs">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">Traveled</div>
          <DistanceDisplay km={progress?.distanceTraveledKm || 0} />
        </div>
        <div className="text-[10px] text-muted-foreground/50 text-center hidden sm:block">
          {positionAccuracy === "live telemetry" ? "🟢 Live" : "🔵 Timeline-based"}
        </div>
        <div className="text-muted-foreground text-right text-xs">
          <div className="text-[10px] uppercase tracking-wider mb-0.5">Remaining</div>
          <DistanceDisplay km={progress?.distanceRemainingKm || 0} className="items-end" />
        </div>
      </div>
    </div>
  );
}