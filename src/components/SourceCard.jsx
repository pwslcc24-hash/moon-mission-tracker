import { ExternalLink, Star } from "lucide-react";

const CATEGORY_LABELS = {
  official: "Official",
  livestream: "Live Tracking",
  news: "News Coverage",
  technical: "Technical / Background",
};

export default function SourceCard({ source }) {
  return (
    <div className="group bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-4 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{source.title}</h4>
          <span className="text-xs text-muted-foreground">{source.provider}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < source.trustLevel ? 'text-yellow-400 fill-yellow-400' : 'text-muted/50'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{source.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {source.tags?.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground capitalize">
              {tag}
            </span>
          ))}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}