import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Rocket, MapPin, Clock, Gauge, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";
import moment from "moment";
import { MISSION, calculateMissionProgress, formatNumber } from "../lib/missionData";
import { kmToMiles } from "../components/DistanceDisplay";
import EarthMoonTracker from "../components/EarthMoonTracker";
import MissionStatusBanner from "../components/MissionStatusBanner";
import MissionClockDisplay from "../components/MissionClockDisplay";
import StatCard from "../components/StatCard";
import UpdateCard from "../components/UpdateCard";

export default function Dashboard() {
  const { missionData, loading, error, lastUpdated } = useOutletContext();
  const [progress, setProgress] = useState(() => calculateMissionProgress(missionData || MISSION));
  const [tick, setTick] = useState(0);

  // Recalculate progress every second from live timestamps
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress(calculateMissionProgress(missionData || MISSION));
  }, [missionData, tick]);

  const milestones = missionData?.milestones || [];
  const latestUpdates = (missionData?.updates || []).slice(0, 3);
  const nextMilestone = milestones.find(m => !m.actualTime && new Date(m.scheduledTime) > new Date());

  if (loading && !missionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Fetching live mission data…</p>
      </div>
    );
  }

  const launchMs   = new Date(missionData?.launchTime  || MISSION.launchDate).getTime();
  const arrivalMs  = new Date(missionData?.arrivalTime || MISSION.lunarArrivalDate).getTime();

  return (
    <div className="space-y-6">
      {/* News unavailable — subtle note only if function itself failed completely */}

      {/* Status Banner */}
      <MissionStatusBanner
        missionData={missionData}
        progress={progress}
        lastUpdated={lastUpdated}
      />

      {/* Earth-Moon Tracker */}
      <EarthMoonTracker
        progress={progress}
        positionSource={missionData?.positionSource}
        positionAccuracy={missionData?.positionAccuracy}
      />

      {/* Mission Clocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MissionClockDisplay
          label="Mission Elapsed Time (MET)"
          targetMs={launchMs}
          type="elapsed"
          accent="green"
        />
        <MissionClockDisplay
          label="Countdown to Lunar Flyby"
          targetMs={arrivalMs}
          type="countdown"
          accent="primary"
          note={missionData?.arrivalTimeConfidence === "estimated" ? "Estimated arrival" : null}
        />
        {nextMilestone && (
          <MissionClockDisplay
            label={`Next: ${nextMilestone.name}`}
            targetMs={new Date(nextMilestone.scheduledTime).getTime()}
            type="countdown"
            accent="secondary"
            note={nextMilestone.confidence === "estimated" ? "Estimated" : null}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Progress"
          value={`${progress.percent.toFixed(1)}%`}
          sub={progress.isComplete ? "Flyby complete" : "to lunar flyby"}
          icon={Gauge}
        />
        <StatCard
          label="Distance Traveled"
          value={`${formatNumber(kmToMiles(progress.distanceTraveledKm))} mi`}
          sub={<><span className="block">{formatNumber(progress.distanceTraveledKm)} km</span><span className="block text-[10px]">of {formatNumber(kmToMiles(MISSION.totalDistanceKm))} mi / {formatNumber(MISSION.totalDistanceKm)} km</span></>}
          icon={MapPin}
        />
        <StatCard
          label="Current Phase"
          value={progress.phase}
          sub={MISSION.missionType}
          icon={Rocket}
        />
        <StatCard
          label="Launch"
          value={moment(MISSION.launchDate).format("Apr D")}
          sub={moment(MISSION.launchDate).utc().format("HH:mm UTC")}
          icon={Clock}
        />
      </div>

      {/* Latest Updates + Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Latest Updates</h3>
            <Link to="/updates" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {latestUpdates.length > 0 ? (
            latestUpdates.map((u) => <UpdateCard key={u.id} update={u} />)
          ) : (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No updates loaded yet.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Info</h3>
          <div className="bg-card/60 backdrop-blur-sm rounded-lg border border-border/50 p-4 space-y-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mission</span>
              <p className="text-sm font-semibold">{MISSION.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Vehicle</span>
              <p className="text-sm font-medium text-muted-foreground">{MISSION.vehicle}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Launch Site</span>
              <p className="text-sm font-medium text-muted-foreground">{MISSION.launchSite}</p>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Crew</span>
              <div className="space-y-1 mt-1">
                {MISSION.crew.map((c) => (
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