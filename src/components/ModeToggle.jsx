import { Radio, Play } from "lucide-react";

export default function ModeToggle({ mode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/80 hover:bg-muted/80 transition-colors text-xs font-medium"
    >
      {mode === "live" ? (
        <>
          <Radio className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Live</span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">Demo</span>
        </>
      )}
    </button>
  );
}