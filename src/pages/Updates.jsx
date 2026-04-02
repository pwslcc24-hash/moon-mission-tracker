import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { RefreshCw, Loader2 } from "lucide-react";
import moment from "moment";
import UpdateCard from "../components/UpdateCard";
import { MISSION } from "../lib/missionData";

export default function Updates() {
  const { missionData, lastUpdated, refresh, refreshing } = useOutletContext();
  const updates = missionData?.updates || [];
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? updates : updates.filter((u) => u.sourceType === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Latest Updates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live articles for {MISSION.name} — every entry has source attribution
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/80 hover:bg-muted/80 transition-colors text-xs text-muted-foreground disabled:opacity-50"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 flex-wrap">
        {[
          { value: "all",      label: "All" },
          { value: "official", label: "Official" },
          { value: "news",     label: "News" },
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
            {updates.length === 0 ? "No live updates loaded yet." : "No updates match this filter."}
          </div>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Live articles from Spaceflight News API — auto-refreshes every 90 seconds
        {lastUpdated && ` • Last updated: ${moment(lastUpdated).fromNow()}`}
      </div>
    </div>
  );
}