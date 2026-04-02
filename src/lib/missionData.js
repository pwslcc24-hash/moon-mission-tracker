// Moon Mission Tracker - Data Service Layer
// Modular architecture: swap data sources without rebuilding the app
import { base44 } from '@/api/base44Client';

// Fetch live data from the NASA-connected backend function
export async function getLiveData() {
  const response = await base44.functions.invoke('getMissionData', {});
  return response.data;
}

const EARTH_MOON_DISTANCE_KM = 384400;

// ─── Mock Mission Data (Artemis II inspired) ───
export const MOCK_MISSION = {
  id: "artemis-ii",
  name: "Artemis II",
  description: "First crewed mission around the Moon since Apollo 17 in 1972. Four astronauts will fly around the Moon in NASA's Orion spacecraft.",
  agency: "NASA",
  vehicle: "Orion / SLS Block 1",
  crew: [
    { name: "Reid Wiseman", role: "Commander" },
    { name: "Victor Glover", role: "Pilot" },
    { name: "Christina Koch", role: "Mission Specialist" },
    { name: "Jeremy Hansen", role: "Mission Specialist (CSA)" },
  ],
  launchSite: "Kennedy Space Center, LC-39B",
  launchDate: "2025-09-01T16:00:00Z",
  lunarArrivalDate: "2025-09-05T08:00:00Z",
  returnDate: "2025-09-11T14:00:00Z",
  missionDurationDays: 10,
  totalDistanceKm: EARTH_MOON_DISTANCE_KM,
  missionType: "Crewed Lunar Flyby",
};

// Current demo state — simulates mid-mission
const now = new Date();
const DEMO_LAUNCH = new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000); // 2.5 days ago
const DEMO_ARRIVAL = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000); // 1.5 days from now
const DEMO_RETURN = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);

export const DEMO_MISSION = {
  ...MOCK_MISSION,
  launchDate: DEMO_LAUNCH.toISOString(),
  lunarArrivalDate: DEMO_ARRIVAL.toISOString(),
  returnDate: DEMO_RETURN.toISOString(),
};

// ─── Milestones ───
export function getMilestones(mission) {
  const launch = new Date(mission.launchDate);
  const arrival = new Date(mission.lunarArrivalDate);
  const totalMs = arrival.getTime() - launch.getTime();

  return [
    {
      id: "launch",
      name: "Launch",
      description: "SLS lifts off from Kennedy Space Center LC-39B",
      scheduledTime: launch.toISOString(),
      actualTime: launch.toISOString(),
      progressPercent: 0,
      source: "NASA Launch Services",
      sourceType: "official",
    },
    {
      id: "booster-sep",
      name: "Booster Separation",
      description: "Twin solid rocket boosters separate at T+2:12",
      scheduledTime: new Date(launch.getTime() + 132 * 1000).toISOString(),
      actualTime: new Date(launch.getTime() + 132 * 1000).toISOString(),
      progressPercent: 0.1,
      source: "NASA Flight Dynamics",
      sourceType: "official",
    },
    {
      id: "core-sep",
      name: "Core Stage Separation",
      description: "Core stage engine cutoff and separation",
      scheduledTime: new Date(launch.getTime() + 510 * 1000).toISOString(),
      actualTime: new Date(launch.getTime() + 510 * 1000).toISOString(),
      progressPercent: 0.5,
      source: "NASA Flight Dynamics",
      sourceType: "official",
    },
    {
      id: "icps-sep",
      name: "ICPS Separation",
      description: "Interim Cryogenic Propulsion Stage separates after TLI burn",
      scheduledTime: new Date(launch.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      actualTime: new Date(launch.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      progressPercent: 2,
      source: "NASA Mission Control",
      sourceType: "official",
    },
    {
      id: "tli",
      name: "Trans-Lunar Injection",
      description: "ICPS burn sends Orion on trajectory to the Moon",
      scheduledTime: new Date(launch.getTime() + 1.5 * 60 * 60 * 1000).toISOString(),
      actualTime: new Date(launch.getTime() + 1.5 * 60 * 60 * 1000).toISOString(),
      progressPercent: 1.5,
      source: "NASA Flight Dynamics",
      sourceType: "official",
    },
    {
      id: "midcourse-1",
      name: "Midcourse Correction #1",
      description: "First trajectory adjustment burn using Orion's service module engine",
      scheduledTime: new Date(launch.getTime() + totalMs * 0.25).toISOString(),
      actualTime: new Date(launch.getTime() + totalMs * 0.25).toISOString(),
      progressPercent: 25,
      source: "NASA Mission Control",
      sourceType: "official",
    },
    {
      id: "midcourse-2",
      name: "Midcourse Correction #2",
      description: "Second trajectory refinement burn",
      scheduledTime: new Date(launch.getTime() + totalMs * 0.55).toISOString(),
      actualTime: null,
      progressPercent: 55,
      source: "NASA Mission Planning",
      sourceType: "official",
    },
    {
      id: "lunar-flyby",
      name: "Lunar Flyby / Closest Approach",
      description: "Orion performs powered flyby of the Moon at approximately 130 km altitude",
      scheduledTime: arrival.toISOString(),
      actualTime: null,
      progressPercent: 100,
      source: "NASA Artemis Program",
      sourceType: "official",
    },
    {
      id: "return-traj",
      name: "Return Trajectory Burn",
      description: "Orion adjusts course for Earth return",
      scheduledTime: new Date(arrival.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      actualTime: null,
      progressPercent: 100,
      source: "NASA Mission Planning",
      sourceType: "official",
    },
    {
      id: "splashdown",
      name: "Splashdown",
      description: "Orion capsule splashes down in the Pacific Ocean",
      scheduledTime: new Date(mission.returnDate).toISOString(),
      actualTime: null,
      progressPercent: 100,
      source: "NASA Recovery Operations",
      sourceType: "official",
    },
  ];
}

// ─── Updates Feed ───
export function getUpdates(mission) {
  const launch = new Date(mission.launchDate);
  return [
    {
      id: "u1",
      title: "SLS Launch Successful",
      body: "The Space Launch System lifted off successfully from Kennedy Space Center at the scheduled time. All systems nominal during ascent.",
      timestamp: new Date(launch.getTime() + 5 * 60 * 1000).toISOString(),
      source: "NASA",
      sourceType: "official",
      sourceUrl: "https://www.nasa.gov/artemis-ii",
      category: "milestone",
    },
    {
      id: "u2",
      title: "Trans-Lunar Injection Complete",
      body: "The ICPS upper stage completed its trans-lunar injection burn, sending Orion on its journey to the Moon. The burn lasted approximately 18 minutes.",
      timestamp: new Date(launch.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      source: "NASA",
      sourceType: "official",
      sourceUrl: "https://www.nasa.gov/artemis-ii",
      category: "milestone",
    },
    {
      id: "u3",
      title: "Crew Reports All Systems Go",
      body: "Commander Reid Wiseman reported all spacecraft systems are functioning nominally. Crew is in good health and spirits as they begin the coast to the Moon.",
      timestamp: new Date(launch.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      source: "NASA Johnson Space Center",
      sourceType: "official",
      sourceUrl: "https://www.nasa.gov/johnson",
      category: "status",
    },
    {
      id: "u4",
      title: "First Midcourse Correction Burn Executed",
      body: "Orion's European Service Module engine fired for a planned midcourse correction. Trajectory confirmed on target for lunar flyby.",
      timestamp: new Date(launch.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      source: "ESA",
      sourceType: "official",
      sourceUrl: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion",
      category: "milestone",
    },
    {
      id: "u5",
      title: "Artemis II Halfway to the Moon",
      body: "Orion has crossed the halfway point in its journey to the Moon. The crew conducted a live broadcast showing views of Earth receding in the distance.",
      timestamp: new Date(launch.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      source: "NASA",
      sourceType: "official",
      sourceUrl: "https://www.nasa.gov/artemis-ii",
      category: "status",
    },
    {
      id: "u6",
      title: "Navigation Systems Performing Well",
      body: "Deep Space Network tracking confirms Orion's trajectory is nominal. Star trackers and navigation cameras are performing above expectations.",
      timestamp: new Date(launch.getTime() + 55 * 60 * 60 * 1000).toISOString(),
      source: "NASA JPL",
      sourceType: "official",
      sourceUrl: "https://www.jpl.nasa.gov",
      category: "technical",
    },
    {
      id: "u7",
      title: "Experts Explain What to Watch During Lunar Approach",
      body: "As Orion approaches the Moon, mission analysts explain the critical lunar flyby maneuver and what to expect in the coming hours.",
      timestamp: new Date(launch.getTime() + 58 * 60 * 60 * 1000).toISOString(),
      source: "Space.com",
      sourceType: "news",
      sourceUrl: "https://www.space.com",
      category: "analysis",
    },
  ];
}

// ─── Best Sources ───
export function getBestSources() {
  return [
    {
      id: "s1",
      title: "NASA Artemis II Mission Page",
      provider: "NASA",
      description: "Official mission overview, crew bios, spacecraft details, and live updates directly from NASA.",
      url: "https://www.nasa.gov/artemis-ii",
      category: "official",
      trustLevel: 5,
      tags: ["official", "primary"],
    },
    {
      id: "s2",
      title: "NASA Live Stream",
      provider: "NASA TV",
      description: "Official live video coverage of the mission including Mission Control audio and crew communications.",
      url: "https://www.nasa.gov/nasatv",
      category: "livestream",
      trustLevel: 5,
      tags: ["official", "live"],
    },
    {
      id: "s3",
      title: "NASA Artemis Blog",
      provider: "NASA",
      description: "Detailed text updates from NASA's Artemis communications team with technical details and status reports.",
      url: "https://blogs.nasa.gov/artemis",
      category: "official",
      trustLevel: 5,
      tags: ["official", "updates"],
    },
    {
      id: "s4",
      title: "ESA Orion Service Module Updates",
      provider: "European Space Agency",
      description: "Updates on the European Service Module that powers Orion, from the agency that built it.",
      url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion",
      category: "official",
      trustLevel: 5,
      tags: ["official", "technical"],
    },
    {
      id: "s5",
      title: "SpaceflightNow Live Coverage",
      provider: "Spaceflight Now",
      description: "Comprehensive launch and mission coverage with detailed timeline tracking and expert commentary.",
      url: "https://spaceflightnow.com",
      category: "news",
      trustLevel: 4,
      tags: ["news", "live"],
    },
    {
      id: "s6",
      title: "NASASpaceflight.com Forums & Coverage",
      provider: "NASASpaceflight",
      description: "In-depth technical coverage, community discussion, and real-time updates from experienced space journalists.",
      url: "https://www.nasaspaceflight.com",
      category: "news",
      trustLevel: 4,
      tags: ["news", "technical", "community"],
    },
    {
      id: "s7",
      title: "Space.com Artemis Coverage",
      provider: "Space.com",
      description: "Accessible mission explainers, timeline tracking, and breaking news coverage for general audiences.",
      url: "https://www.space.com/artemis-program",
      category: "news",
      trustLevel: 3,
      tags: ["news", "explainers"],
    },
    {
      id: "s8",
      title: "Everyday Astronaut Coverage",
      provider: "Everyday Astronaut",
      description: "YouTube-based technical deep dives and live coverage with visual explanations of mission hardware.",
      url: "https://everydayastronaut.com",
      category: "technical",
      trustLevel: 3,
      tags: ["video", "technical", "educational"],
    },
    {
      id: "s9",
      title: "NASA Press Kit",
      provider: "NASA",
      description: "Official press kit with mission timeline, spacecraft specs, orbital parameters, and crew details.",
      url: "https://www.nasa.gov/artemis-ii/press-kit",
      category: "technical",
      trustLevel: 5,
      tags: ["official", "reference"],
    },
    {
      id: "s10",
      title: "Flight Club Trajectory Visualization",
      provider: "Flight Club",
      description: "Interactive 3D trajectory visualization and telemetry replay for the SLS launch and TLI burn.",
      url: "https://flightclub.io",
      category: "technical",
      trustLevel: 3,
      tags: ["tracking", "visualization"],
    },
  ];
}

// ─── Progress Engine ───
export function calculateMissionProgress(mission) {
  const now = new Date();
  const launch = new Date(mission.launchDate);
  const arrival = new Date(mission.lunarArrivalDate);

  const totalMs = arrival.getTime() - launch.getTime();
  const elapsedMs = now.getTime() - launch.getTime();

  if (elapsedMs < 0) {
    return {
      percent: 0,
      distanceTraveledKm: 0,
      distanceRemainingKm: mission.totalDistanceKm,
      phase: "Pre-Launch",
      dataLabel: "estimated",
      elapsedMs: 0,
      remainingMs: Math.abs(elapsedMs),
      totalMs,
      isPreLaunch: true,
      isComplete: false,
    };
  }

  if (elapsedMs >= totalMs) {
    return {
      percent: 100,
      distanceTraveledKm: mission.totalDistanceKm,
      distanceRemainingKm: 0,
      phase: "Lunar Operations",
      dataLabel: "estimated",
      elapsedMs,
      remainingMs: 0,
      totalMs,
      isPreLaunch: false,
      isComplete: true,
    };
  }

  const rawPercent = (elapsedMs / totalMs) * 100;
  const percent = Math.min(100, Math.max(0, rawPercent));
  const distanceTraveledKm = Math.round((percent / 100) * mission.totalDistanceKm);
  const distanceRemainingKm = mission.totalDistanceKm - distanceTraveledKm;

  let phase = "Coast to Moon";
  if (percent < 1) phase = "Earth Orbit / TLI";
  else if (percent < 15) phase = "Early Trans-Lunar Coast";
  else if (percent < 50) phase = "Trans-Lunar Coast";
  else if (percent < 85) phase = "Deep Space Coast";
  else if (percent < 98) phase = "Lunar Approach";
  else phase = "Final Approach";

  return {
    percent: Math.round(percent * 100) / 100,
    distanceTraveledKm,
    distanceRemainingKm,
    phase,
    dataLabel: "estimated",
    elapsedMs,
    remainingMs: totalMs - elapsedMs,
    totalMs,
    isPreLaunch: false,
    isComplete: false,
  };
}

// ─── Data Source Status ───
export function getDataSourceStatus() {
  return [
    {
      id: "ds1",
      name: "NASA Artemis API",
      type: "API",
      status: "active",
      description: "Official NASA mission data feed",
      lastCheck: new Date().toISOString(),
      note: "Connected via getMissionData backend function using NASA_API_KEY.",
    },
    {
      id: "ds2",
      name: "Spaceflight News API",
      type: "REST API",
      status: "active",
      description: "Real-time Artemis articles from Spaceflight News API",
      lastCheck: new Date().toISOString(),
      note: "Fetching live articles in Live Mode via getMissionData function.",
    },
    {
      id: "ds3",
      name: "Deep Space Network",
      type: "API",
      status: "available",
      description: "NASA DSN Now - real-time antenna status",
      lastCheck: new Date().toISOString(),
      note: "DSN Now API is publicly available at eyes.nasa.gov/dsn",
    },
    {
      id: "ds4",
      name: "Space News Aggregator",
      type: "RSS",
      status: "simulated",
      description: "Aggregated space news from multiple outlets",
      lastCheck: new Date().toISOString(),
      note: "Using mock data. Can connect to SpaceflightNow, Space.com RSS.",
    },
    {
      id: "ds5",
      name: "Mission Clock Sync",
      type: "Internal",
      status: "active",
      description: "Internal clock calculations based on mission parameters",
      lastCheck: new Date().toISOString(),
      note: "Calculating from launch and arrival timestamps. Accuracy depends on data freshness.",
    },
  ];
}

// ─── Format Helpers ───
export function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${String(hours).padStart(2, '0')}h`);
  parts.push(`${String(minutes).padStart(2, '0')}m`);
  parts.push(`${String(seconds).padStart(2, '0')}s`);
  return parts.join(' ');
}

export function formatDurationLong(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getMilestoneStatus(milestone) {
  const now = new Date();
  const scheduled = new Date(milestone.scheduledTime);
  if (milestone.actualTime) return "completed";
  const diff = scheduled.getTime() - now.getTime();
  if (Math.abs(diff) < 30 * 60 * 1000) return "live";
  if (diff > 0) return "upcoming";
  return "completed";
}