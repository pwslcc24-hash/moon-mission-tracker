import { useOutletContext } from "react-router-dom";
import { getBestSources } from "../lib/missionData";
import SourceCard from "../components/SourceCard";

const CATEGORY_ORDER = ["official", "livestream", "news", "technical"];
const CATEGORY_META = {
  official: { label: "Official Sources", desc: "Primary mission agencies and their direct communications" },
  livestream: { label: "Live Tracking & Livestream", desc: "Real-time video and tracking tools" },
  news: { label: "Reliable News Coverage", desc: "Trusted space journalism with proven track records" },
  technical: { label: "Technical & Background", desc: "Deep dives, visualizations, and educational content" },
};

export default function Sources() {
  const { mode } = useOutletContext();
  const sources = getBestSources();

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = sources.filter((s) => s.category === cat).sort((a, b) => b.trustLevel - a.trustLevel);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Best Mission Sources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated and ranked sources for mission tracking — separated by trust and type
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const items = grouped[cat];
        if (!items?.length) return null;

        return (
          <div key={cat} className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">{meta.label}</h2>
              <p className="text-xs text-muted-foreground">{meta.desc}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Sources ranked by editorial trust level (★). Official = direct from mission agencies.
      </div>
    </div>
  );
}