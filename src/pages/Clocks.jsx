import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MISSION, getMilestoneStatus, formatDuration } from "../lib/missionData";
import MissionClockDisplay from "../components/MissionClockDisplay";

export default function Clocks() {
  const { missionData } = useOutletContext();
  const mission = MISSION;
  const milestones = missionData?.milestones || [];
  const [, setTick] = useState(0);
  const [timeFormat, setTimeFormat] = useState("local");

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (timeFormat === "utc") return d.toUTCString().replace("GMT", "UTC");
    return d.toLocaleString();
  };

  const upcomingMilestones = milestones.filter((m) => getMilestoneStatus(m) === "upcoming");
  const nextEvent = upcomingMilestones[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mission Clocks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time countdowns and elapsed timers for {mission.name}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {[
            { value: "local", label: "Local" },
            { value: "utc", label: "UTC" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFormat(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                timeFormat === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Clocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MissionClockDisplay
          label="Mission Elapsed Time"
          targetMs={new Date(mission.launchDate).getTime()}
          type="elapsed"
          accent="green"
        />
        <MissionClockDisplay
          label="Countdown to Lunar Flyby"
          targetMs={new Date(missionData?.arrivalTime || mission.lunarArrivalDate).getTime()}
          note="Estimated arrival"
          type="countdown"
          accent="primary"
        />
      </div>

      {nextEvent && (
        <MissionClockDisplay
          label={`Next Event: ${nextEvent.name}`}
          targetMs={new Date(nextEvent.scheduledTime).getTime()}
          type="countdown"
          accent="secondary"
        />
      )}

      {/* Milestone Clocks Table */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">All Event Clocks</h2>
        <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">Scheduled Time</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Countdown / Elapsed</th>
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {milestones.map((m) => {
                  const status = getMilestoneStatus(m);
                  const scheduled = new Date(m.scheduledTime);
                  const now = Date.now();
                  const diff = scheduled.getTime() - now;

                  return (
                    <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{m.name}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">{formatTime(m.scheduledTime)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          status === "completed" ? "bg-green-400/10 text-green-400" :
                          status === "live" ? "bg-yellow-400/10 text-yellow-400 animate-pulse" :
                          "bg-muted/50 text-muted-foreground"
                        }`}>
                          {status === "completed" ? "✓ Completed" : status === "live" ? "⚡ Live Now" : "○ Upcoming"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {diff > 0 ? `T−${formatDuration(diff)}` : `T+${formatDuration(Math.abs(diff))}`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground/70 italic">{m.source}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Clocks update every second from your device clock. Launch time confirmed. All other times are estimated from official NASA mission planning.
      </div>
    </div>
  );
}