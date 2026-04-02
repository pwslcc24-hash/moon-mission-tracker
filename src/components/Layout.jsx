import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Clock, Newspaper, Link2, Timer, Settings2, Database, 
  Menu, X, Rocket 
} from "lucide-react";
import StarsBackground from "./StarsBackground";
import ModeToggle from "./ModeToggle";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/timeline", label: "Timeline", icon: Clock },
  { path: "/updates", label: "Updates", icon: Newspaper },
  { path: "/sources", label: "Sources", icon: Link2 },
  { path: "/clocks", label: "Clocks", icon: Timer },
  { path: "/technical", label: "Technical", icon: Settings2 },
  { path: "/data-status", label: "Data Status", icon: Database },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState("demo");

  const toggleMode = () => setMode((m) => (m === "demo" ? "live" : "demo"));

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarsBackground />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Moon Mission Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle mode={mode} onToggle={toggleMode} />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted/50">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="border-t border-border/50 py-2 px-2 bg-card/95 backdrop-blur-lg">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-sidebar border-r border-sidebar-border z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm tracking-tight">Moon Mission Tracker</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-sidebar-border">
          <ModeToggle mode={mode} onToggle={toggleMode} />
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-56 min-h-screen pt-14 lg:pt-0 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet context={{ mode }} />
        </div>
      </main>
    </div>
  );
}