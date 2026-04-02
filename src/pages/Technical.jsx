import { useOutletContext } from "react-router-dom";
import { DEMO_MISSION, MOCK_MISSION } from "../lib/missionData";
import { Rocket, Users, MapPin, Calendar, Globe, Gauge } from "lucide-react";
import moment from "moment";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/20 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Technical() {
  const { mode } = useOutletContext();
  const mission = mode === "demo" ? DEMO_MISSION : MOCK_MISSION;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Technical Details</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spacecraft, crew, and mission parameters for {mission.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard title="Mission Overview" icon={Rocket}>
          <DetailRow label="Mission" value={mission.name} />
          <DetailRow label="Type" value={mission.missionType} />
          <DetailRow label="Agency" value={mission.agency} />
          <DetailRow label="Vehicle" value={mission.vehicle} />
          <DetailRow label="Duration" value={`${mission.missionDurationDays} days`} />
          <DetailRow label="Description" value={mission.description} />
        </SectionCard>

        <SectionCard title="Crew" icon={Users}>
          {mission.crew.map((c) => (
            <DetailRow key={c.name} label={c.role} value={c.name} />
          ))}
        </SectionCard>

        <SectionCard title="Launch Details" icon={MapPin}>
          <DetailRow label="Launch Site" value={mission.launchSite} />
          <DetailRow label="Launch Date" value={moment(mission.launchDate).format("MMMM D, YYYY")} />
          <DetailRow label="Launch Time (UTC)" value={moment(mission.launchDate).utc().format("HH:mm:ss UTC")} />
          <DetailRow label="Launch Time (Local)" value={moment(mission.launchDate).format("h:mm:ss A z")} />
        </SectionCard>

        <SectionCard title="Key Dates" icon={Calendar}>
          <DetailRow label="Launch" value={moment(mission.launchDate).format("MMM D, YYYY HH:mm UTC")} />
          <DetailRow label="Lunar Arrival" value={moment(mission.lunarArrivalDate).format("MMM D, YYYY HH:mm UTC")} />
          <DetailRow label="Return" value={moment(mission.returnDate).format("MMM D, YYYY HH:mm UTC")} />
        </SectionCard>

        <SectionCard title="Trajectory" icon={Globe}>
          <DetailRow label="Earth-Moon Distance" value="384,400 km" />
          <DetailRow label="Transit Time (est.)" value={`~${Math.round((new Date(mission.lunarArrivalDate) - new Date(mission.launchDate)) / 3600000)} hours`} />
          <DetailRow label="Orbit Type" value="Free-return trajectory" />
          <DetailRow label="Lunar Closest Approach" value="~130 km altitude" />
        </SectionCard>

        <SectionCard title="Spacecraft Specs" icon={Gauge}>
          <DetailRow label="Crew Module" value="Orion MPCV" />
          <DetailRow label="Service Module" value="European Service Module (ESA)" />
          <DetailRow label="Launch Vehicle" value="Space Launch System Block 1" />
          <DetailRow label="Total Thrust (SLS)" value="8.8 million lbs" />
          <DetailRow label="Crew Module Mass" value="~26,500 kg" />
        </SectionCard>
      </div>

      <div className="text-[10px] text-muted-foreground/60 text-center">
        Technical data sourced from NASA Artemis Program documentation. {mode === "demo" && "Times are simulated in demo mode."}
      </div>
    </div>
  );
}