import { useState, useEffect, useCallback } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Clock, Newspaper, Link2, Timer, Settings2, Database,
  Menu, X, Rocket, Wifi, WifiOff, RefreshCw
} from "lucide-react";
import StarsBackground from "./StarsBackground";
import { getLiveData, MISSION } from "../lib/missionData";
import moment from "moment";

const NAV_ITEMS = [
  { path: "/",            label: "Dashboard",   icon: LayoutDashboard },
  { path: "/timeline",    label: "Timeline",    icon: Clock },
  { path: "/updates",     label: "Updates",     icon: Newspaper },
  { path: "/sources",     label: "Sources",     icon: Link2 },
  { path: "/clocks",      label: "Clocks",      icon: Timer },
  { path: "/technical",   label: "Technical",   icon: Settings2 },
  { path: "/data-status", label: "Data Status", icon: Database },
];

const REFRESH_INTERVAL_MS = 90 * 1000; // 90 seconds

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [missionData, setMissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    const data = await getLiveData();
    setMissionData(data);
    setLastUpdated(new Date());
    setError(data?.liveDataAvailable === false ? data.liveDataError : null);
    setLoading(false);
    if (isManual) setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const context = { missionData, loading, error, lastUpdated, refresh: () => fetchData(true), refreshing };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <StarsBackground />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">Moon Mission Tracker</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs">
              {error
                ? <WifiOff className="w-3 h-3 text-yellow-400" />
                : <Wifi className="w-3 h-3 text-green-400" />}
              <span className={error ? "text-yellow-400" : "text-green-400"}>
                {error ? "Stale" : "Live"}
              </span>
            </div>
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
        {/* Live status + last updated */}
        <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {error
                ? <WifiOff className="w-3 h-3 text-yellow-400" />
                : <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
              <span className={`text-xs font-medium ${error ? "text-yellow-400" : "text-green-400"}`}>
                {error ? "Stale Data" : "Live Data"}
              </span>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground/60">
              Updated {moment(lastUpdated).fromNow()}
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-56 min-h-screen pt-14 lg:pt-0 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Outlet context={context} />
        </div>
      </main>
    </div>
  );
}