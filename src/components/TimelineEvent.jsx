import { Check, Clock, Zap, Circle } from "lucide-react";
import moment from "moment";
import { getMilestoneStatus, formatDuration } from "../lib/missionData";

const STATUS_CONFIG = {
  completed: { icon: Check, color: "text-green-400", bg: "bg-green-400", label: "Completed" },
  live: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400", label: "Live Now" },
  upcoming: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted-foreground/50", label: "Upcoming" },
};

export default function TimelineEvent({ milestone, timeFormat = "local" }) {
  const status = getMilestoneStatus(milestone);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  const Icon = config.icon;
  const now = new Date();
  const scheduled = new Date(milestone.scheduledTime);
  const diff = scheduled.getTime() - now.getTime();

  const formatTime = (iso) => {
    if (!iso) return "—";
    if (timeFormat === "utc") return moment(iso).utc().format("MMM D, HH:mm:ss") + " UTC";
    if (timeFormat === "met") {
      return "MET " + formatDuration(new Date(iso).getTime() - new Date(milestone.scheduledTime).getTime());
    }
    return moment(iso).format("MMM D, h:mm:ss A");
  };

  return (
    <div className={`relative flex gap-3 sm:gap-4 ${status === "live" ? "scale-[1.02]" : ""}`}>
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
          status === "completed" ? "border-green-400 bg-green-400/10" :
          status === "live" ? "border-yellow-400 bg-yellow-400/10 animate-pulse" :
          "border-muted-foreground/30 bg-muted/30"
        }`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <div className="w-px flex-1 bg-border/30 mt-1" />
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${status === "live" ? "bg-yellow-400/5 -mx-2 px-2 rounded-lg border border-yellow-400/20" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`text-sm font-semibold ${status === "completed" ? "text-foreground" : status === "live" ? "text-yellow-400" : "text-muted-foreground"}`}>
            {milestone.name}
          </h4>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            status === "completed" ? "bg-green-400/10 text-green-400" :
            status === "live" ? "bg-yellow-400/10 text-yellow-400" :
            "bg-muted/50 text-muted-foreground"
          }`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatTime(milestone.scheduledTime)}
          </span>
          {milestone.actualTime && (
            <span className="text-green-400">
              Actual: {formatTime(milestone.actualTime)}
            </span>
          )}
          {status === "upcoming" && diff > 0 && (
            <span className="text-primary font-mono">
              T−{formatDuration(diff)}
            </span>
          )}
          {milestone.source && (
            <span className="italic">via {milestone.source}</span>
          )}
        </div>
      </div>
    </div>
  );
}