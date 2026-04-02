import { useOutletContext } from "react-router-dom";
import { getDataSourceStatus } from "../lib/missionData";
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";
import moment from "moment";

const STATUS_CONFIG = {
  active: { label: "Active", icon: CheckCircle, color: "text-green-400 bg-green-400/10" },
  available: { label: "Available", icon: Wifi, color: "text-blue-400 bg-blue-400/10" },
  simulated: { label: "Simulated", icon: AlertTriangle, color: "text-yellow-400 bg-yellow-400/10" },
  offline: { label: "Offline", icon: WifiOff, color: "text-red-400 bg-red-400/10" },
};

export default function DataStatus() {
  const { mode } = useOutletContext();
  const sources = getDataSourceStatus();

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
            Mode: {mode === "demo" ? "Demo" : "Live"}
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
                <div className="text-[9px] text-muted-foreground/50 mt-1">
                  Last checked: {moment(src.lastCheck).fromNow()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/50 p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Architecture Notes</h3>
        <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p>
            This app uses a modular data service layer. Each data source can be independently connected, 
            replaced, or disabled without affecting the rest of the application.
          </p>
          <p>
            In <strong className="text-foreground/80">Demo Mode</strong>, all data is generated from high-fidelity 
            mock mission parameters, so the app always works and looks realistic.
          </p>
          <p>
            In <strong className="text-foreground/80">Live Mode</strong>, the app is ready to connect to official 
            APIs, RSS feeds, and mission update pages. Data sources can be swapped by updating the service layer.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Data architecture designed for easy source swapping. No rebuild required to add new feeds.
      </div>
    </div>
  );
}