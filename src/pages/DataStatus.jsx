import { useOutletContext } from "react-router-dom";
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", icon: CheckCircle, color: "text-green-400 bg-green-400/10" },
  available: { label: "Available", icon: Wifi, color: "text-blue-400 bg-blue-400/10" },
  simulated: { label: "Simulated", icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/10" },
  offline: { label: "Offline", icon: WifiOff, color: "text-red-400 bg-red-400/10" },
};

const SOURCES = [
  { id: "ds1", name: "Launch Time", type: "Confirmed", status: "active", description: "Confirmed: April 1, 2026 at 22:35 UTC", note: "Sourced from NASA press release and multiple news agencies." },
  { id: "ds2", name: "Spaceflight News API", type: "REST API", status: "active", description: "Real-time Artemis articles", note: "Free public API. Fetched every 90 seconds. Powers the Updates feed." },
  { id: "ds3", name: "Mission Clocks", type: "Calculated", status: "active", description: "Elapsed / countdown from confirmed launch time", note: "Recalculated from device clock every second. No drift." },
  { id: "ds4", name: "Rocket Position", type: "Estimated", status: "estimated", description: "Linear interpolation from launch→arrival timeline", note: "Estimated from launch time + official mission profile. No real-time telemetry available." },
  { id: "ds5", name: "Milestone Times", type: "Estimated", status: "estimated", description: "Based on official mission planning documents", note: "Actual times may vary. Will be updated as mission progresses." },
];

export default function DataStatus() {
  const { missionData, lastUpdated } = useOutletContext();
  const sources = SOURCES;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Data Source Status</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Current status of all data feeds powering the mission tracker
        </p>
      </div>

      <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Feed Status</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            {lastUpdated ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}` : "Not yet loaded"}
          </span>
        </div>

        <div className="space-y-3">
          {sources.map((src) => {
            const config = STATUS_CONFIG[src.status] || STATUS_CONFIG.offline;
            const Icon = config.icon;

            return (
              <div key={src.id} className="bg-muted/20 rounded-lg p-3 border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{src.name}</h4>
                    <span className="text-[10px] text-muted-foreground">{src.type} • {src.description}</span>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                    <Icon className="w-2.5 h-2.5" />
                    {config.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/80">{src.note}</p>

              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Data Quality Notes</h3>
        <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>
            <strong className="text-foreground/80">Confirmed:</strong> Launch time (April 1, 2026 22:35 UTC) is sourced from NASA press releases and confirmed by multiple news agencies.
          </p>
          <p>
            <strong className="text-foreground/80">Estimated:</strong> Rocket position, milestone times, and arrival/return times are calculated from the confirmed launch time and official NASA Artemis II mission profile. No real-time telemetry is publicly available.
          </p>
          <p>
            <strong className="text-foreground/80">Live articles:</strong> Mission news is fetched in real time from the Spaceflight News API and refreshed every 90 seconds.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Data architecture designed for easy source swapping. No rebuild required to add new feeds.
      </div>
    </div>
  );
}