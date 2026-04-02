import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { MISSION } from "../lib/missionData";
import TimelineEvent from "../components/TimelineEvent";

export default function Timeline() {
  const { missionData } = useOutletContext();
  const milestones = missionData?.milestones || [];
  const [timeFormat, setTimeFormat] = useState("local");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mission Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All key milestones for {MISSION.name} in chronological order
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {[
            { value: "local", label: "Local" },
            { value: "utc", label: "UTC" },
            { value: "met", label: "MET" },
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

      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-6">
        <div className="space-y-0">
          {milestones.map((milestone) => (
            <TimelineEvent key={milestone.id} milestone={milestone} timeFormat={timeFormat} />
          ))}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Launch time confirmed. Milestone times are estimated from official NASA mission planning documents. Actual times may vary.
      </div>
    </div>
  );
}