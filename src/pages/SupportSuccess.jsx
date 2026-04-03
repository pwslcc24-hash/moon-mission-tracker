import { Link } from "react-router-dom";
import { Heart, Rocket } from "lucide-react";

export default function SupportSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Heart className="w-9 h-9 text-primary" fill="currentColor" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
          <span className="text-green-400 text-xs">✓</span>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Thank you for supporting Moon Mission Tracker
      </h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm">
        Your support helps keep this tracker live, accurate, and improving. The crew appreciates it. 🚀
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary text-sm font-medium transition-all"
      >
        <Rocket className="w-4 h-4" />
        Back to Mission Tracker
      </Link>
    </div>
  );
}