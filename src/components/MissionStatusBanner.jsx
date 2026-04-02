import { Activity, Wifi, WifiOff } from "lucide-react";
import moment from "moment";
import { MISSION } from "../lib/missionData";

export default function MissionStatusBanner({ missionData, progress, lastUpdated }) {
  const isLive = missionData?.liveDataAvailable !== false;
  const status = missionData?.currentStatus || (progress?.isPreLaunch ? "Pre-Launch" : "Mission Active");

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-r from-primary/10 via-card to-secondary/10 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Activity className="w-4 h-4 text-green-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              {progress?.isPreLaunch ? "Pre-Launch" : "Active"}
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">{MISSION.name}</h2>
          <span className="hidden sm:inline text-xs text-muted-foreground">— {MISSION.agency}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground">
            {progress?.phase || "—"}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {isLive
              ? <Wifi className="w-3 h-3 text-green-400" />
              : <WifiOff className="w-3 h-3 text-yellow-400" />}
            <span className={isLive ? "text-green-400" : "text-yellow-400"}>
              {isLive ? "Live" : "Stale"}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground/60">
              {moment(lastUpdated).fromNow()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}