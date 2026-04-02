import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { DEMO_MISSION, MOCK_MISSION, getUpdates } from "../lib/missionData";
import UpdateCard from "../components/UpdateCard";

export default function Updates() {
  const { mode } = useOutletContext();
  const mission = mode === "demo" ? DEMO_MISSION : MOCK_MISSION;
  const [updates, setUpdates] = useState(() => getUpdates(mission).reverse());
  const [filter, setFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setUpdates(getUpdates(mission).reverse());
  }, [mode]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates(getUpdates(mission).reverse());
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleRefresh = () => {
    setUpdates(getUpdates(mission).reverse());
    setLastRefresh(new Date());
  };

  const filtered = filter === "all" ? updates : updates.filter((u) => u.sourceType === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Latest Updates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sourced updates for {mission.name} — every entry has attribution
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/80 hover:bg-muted/80 transition-colors text-xs text-muted-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "official", label: "Official" },
          { value: "news", label: "News" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/30 text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((u) => (
          <UpdateCard key={u.id} update={u} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No updates match this filter.
          </div>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Auto-refreshes every 60 seconds. Last refresh: {lastRefresh.toLocaleTimeString()}
        {mode === "demo" && " • Using simulated data in demo mode"}
      </div>
    </div>
  );
}