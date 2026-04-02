export default function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />}
      </div>
      <div className="text-base sm:text-lg font-bold text-foreground font-mono">{value}</div>
      {sub && <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}