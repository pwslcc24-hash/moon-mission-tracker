import { ExternalLink, Clock, Shield, Newspaper, Radio, AlertTriangle, Sparkles } from "lucide-react";
import moment from "moment";

const SOURCE_TYPE_CONFIG = {
  official: { label: "Official", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: Shield },
  news: { label: "News", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Newspaper },
  livestream: { label: "Livestream", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: Radio },
  estimated: { label: "Estimated", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", icon: AlertTriangle },
  simulated: { label: "Simulated", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Sparkles },
};

export default function UpdateCard({ update }) {
  const config = SOURCE_TYPE_CONFIG[update.sourceType] || SOURCE_TYPE_CONFIG.news;
  const Icon = config.icon;

  return (
    <div className="group bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug">{update.title}</h4>
        <span className={`shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
          <Icon className="w-2.5 h-2.5" />
          {config.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{update.body}</p>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground/70">{update.source}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {moment(update.timestamp).fromNow()}
          </span>
        </div>
        {update.sourceUrl && (
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
          >
            Source <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}