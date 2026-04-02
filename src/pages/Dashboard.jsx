import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Rocket, MapPin, Clock, Gauge, ArrowRight } from "lucide-react";
import moment from "moment";
import {
  DEMO_MISSION, MOCK_MISSION,
  calculateMissionProgress, getMilestones, getUpdates,
  formatNumber, formatDuration,
} from "../lib/missionData";
import EarthMoonTracker from "../components/EarthMoonTracker";
import MissionStatusBanner from "../components/MissionStatusBanner";
import MissionClockDisplay from "../components/MissionClockDisplay";
import StatCard from "../components/StatCard";
import UpdateCard from "../components/UpdateCard";

export default function Dashboard() {
  const { mode } = useOutletContext();
  const mission = mode === "demo" ? DEMO_MISSION : MOCK_MISSION;
  const [progress, setProgress] = useState(() => calculateMissionProgress(mission));

  useEffect(() => {
    setProgress(calculateMissionProgress(mission));
    const interval = setInterval(() => {
      setProgress(calculateMissionProgress(mission));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const milestones = getMilestones(mission);
  const updates = getUpdates(mission);
  const latestUpdates = updates.slice(-3).reverse();

  const nextMilestone = milestones.find(
    (m) => !m.actualTime || new Date(m.scheduledTime) > new Date()
  );

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <MissionStatusBanner mission={mission} progress={progress} mode={mode} />

      {/* Earth-Moon Tracker */}
      <EarthMoonTracker progress={progress} />

      {/* Mission Clocks Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MissionClockDisplay
          label="Mission Elapsed Time"
          targetMs={new Date(mission.launchDate).getTime()}
          type="elapsed"
          accent="green"
        />
        <MissionClockDisplay
          label="Lunar Arrival"
          targetMs={new Date(mission.lunarArrivalDate).getTime()}
          type="countdown"
          accent="primary"
        />
        {nextMilestone && (
          <MissionClockDisplay
            label={`Next: ${nextMilestone.name}`}
            targetMs={new Date(nextMilestone.scheduledTime).getTime()}
            type="countdown"
            accent="secondary"
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Progress"
          value={`${progress.percent.toFixed(1)}%`}
          sub="to the Moon"
          icon={Gauge}
        />
        <StatCard
          label="Distance"
          value={`${formatNumber(progress.distanceTraveledKm)} km`}
          sub={`of ${formatNumber(mission.totalDistanceKm)} km`}
          icon={MapPin}
        />
        <StatCard
          label="Mission Phase"
          value={progress.phase}
          sub={mission.missionType}
          icon={Rocket}
        />
        <StatCard
          label="Launch"
          value={moment(mission.launchDate).format("MMM D")}
          sub={moment(mission.launchDate).format("h:mm A")}
          icon={Clock}
        />
      </div>

      {/* Latest Updates + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Latest Updates</h3>
            <Link to="/updates" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {latestUpdates.map((u) => (
            <UpdateCard key={u.id} update={u} />
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Info</h3>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-4 space-y-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mission</span>
              <p className="text-sm font-semibold">{mission.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Vehicle</span>
              <p className="text-sm font-medium text-muted-foreground">{mission.vehicle}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Launch Site</span>
              <p className="text-sm font-medium text-muted-foreground">{mission.launchSite}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Crew</span>
              <div className="space-y-1 mt-1">
                {mission.crew.map((c) => (
                  <p key={c.name} className="text-xs text-muted-foreground">
                    <span className="text-foreground/80 font-medium">{c.name}</span> — {c.role}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/timeline" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              Full Timeline <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/sources" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              Best Sources <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/clocks" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              All Clocks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}