import { useState } from "react";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PRESET_AMOUNTS = [3, 5, 10, 25];

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(5);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const effectiveAmount = custom ? parseFloat(custom) : selected;

  const handleSupport = async () => {
    if (!effectiveAmount || effectiveAmount < 1) return;
    setLoading(true);
    const origin = window.location.origin;
    const res = await base44.functions.invoke("createCheckoutSession", {
      amount: effectiveAmount,
      successUrl: `${origin}/support-success`,
      cancelUrl: `${origin}${window.location.pathname}`,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
    setLoading(false);
  };

  return (
    <div className="px-3 pb-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary transition-all duration-150 group"
        >
          <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-xs font-semibold leading-tight">Support this project</div>
            <div className="text-[10px] text-primary/60 leading-tight">Help keep this tracker live</div>
          </div>
        </button>
      ) : (
        <div className="rounded-lg border border-primary/20 bg-sidebar-accent/50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary" /> Support
            </span>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-1">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(""); }}
                className={`py-1.5 rounded-md text-xs font-bold transition-all ${
                  selected === amt && !custom
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
            <input
              type="number"
              min="1"
              placeholder="Custom"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
              className="w-full pl-6 pr-3 py-1.5 rounded-md bg-muted/60 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <button
            onClick={handleSupport}
            disabled={loading || !effectiveAmount || effectiveAmount < 1}
            className="w-full py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting…" : `Support with $${effectiveAmount || "—"}`}
          </button>
        </div>
      )}
    </div>
  );
}