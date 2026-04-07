// Moon Mission Tracker – Data Service Layer (Live Only)
import { base44 } from '@/api/base44Client';

// ─── Full free-return mission distances ───
const LAUNCH_MS    = new Date("2026-04-01T22:35:12Z").getTime();
const FLYBY_START_MS = new Date("2026-04-06T18:00:00Z").getTime();
const FLYBY_END_MS   = new Date("2026-04-07T06:00:00Z").getTime();
const RETURN_END_MS  = new Date("2026-04-11T00:21:00Z").getTime();

export const FULL_MISSION_KM = 384400 + 20000 + 384400; // 788,800 km
export const FULL_MISSION_MI = Math.round(FULL_MISSION_KM * 0.621371); // ~490,007 mi

export function getMissionFullDistances(now = Date.now()) {
  if (now <= LAUNCH_MS) return { traveled: 0, remaining: FULL_MISSION_KM };
  if (now < FLYBY_START_MS) {
    const t = (now - LAUNCH_MS) / (FLYBY_START_MS - LAUNCH_MS);
    const traveled = Math.round(t * 384400);
    return { traveled, remaining: FULL_MISSION_KM - traveled };
  }
  if (now < FLYBY_END_MS) {
    const t = (now - FLYBY_START_MS) / (FLYBY_END_MS - FLYBY_START_MS);
    const traveled = Math.round(384400 + t * 20000);
    return { traveled, remaining: FULL_MISSION_KM - traveled };
  }
  if (now < RETURN_END_MS) {
    const t = (now - FLYBY_END_MS) / (RETURN_END_MS - FLYBY_END_MS);
    const traveled = Math.round(384400 + 20000 + t * 384400);
    return { traveled, remaining: FULL_MISSION_KM - traveled };
  }
  return { traveled: FULL_MISSION_KM, remaining: 0 };
}

// ─── Static confirmed mission constants (used as fallback / reference) ───
export const MISSION = {
  name: "Artemis II",
  agency: "NASA / CSA",
  vehicle: "Orion MPCV / SLS Block 1",
  launchSite: "Kennedy Space Center, LC-39B",
  launchDate: "2026-04-01T22:35:12Z",         // CONFIRMED — exact seconds from Wikipedia/NASA
  lunarArrivalDate: "2026-04-06T18:00:00Z",    // ESTIMATED — April 6 confirmed by NASA
  returnDate: "2026-04-11T00:21:00Z",          // NET CONFIRMED — Wikipedia Artemis II infobox
  missionDurationDays: 10,
  totalDistanceKm: 384400,   // Average Earth–Moon distance (IAU: 238,855 mi / 384,400 km)
  totalDistanceMi: 238855,
  missionType: "Crewed Lunar Free-Return Flyby",
  description: "First crewed mission beyond Earth orbit since Apollo 17 in 1972. Four astronauts fly a free-return trajectory around the Moon aboard NASA's Orion spacecraft.",
  crew: [
    { name: "Reid Wiseman",   role: "Commander" },
    { name: "Victor Glover",  role: "Pilot" },
    { name: "Christina Koch", role: "Mission Specialist" },
    { name: "Jeremy Hansen",  role: "Mission Specialist (CSA)" },
  ],
};

// ─── Live data fetch ───
export async function getLiveData() {
  const response = await base44.functions.invoke('getMissionData', {});
  return response.data;
}

// ─── Progress calculator (recalculates from timestamps every second) ───
export function calculateMissionProgress(missionData) {
  const launchTime = missionData?.launchTime || MISSION.launchDate;
  const arrivalTime = missionData?.arrivalTime || MISSION.lunarArrivalDate;
  const totalDistanceKm = missionData?.totalDistanceKm || MISSION.totalDistanceKm;

  const now = Date.now();
  const launchMs = new Date(launchTime).getTime();
  const arrivalMs = new Date(arrivalTime).getTime();
  const totalMs = arrivalMs - launchMs;
  const elapsedMs = now - launchMs;

  if (elapsedMs < 0) {
    return {
      percent: 0,
      distanceTraveledKm: 0,
      distanceRemainingKm: totalDistanceKm,
      phase: "Pre-Launch",
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
      distanceTraveledKm: totalDistanceKm,
      distanceRemainingKm: 0,
      phase: "Lunar Flyby / Return",
      elapsedMs,
      remainingMs: 0,
      totalMs,
      isPreLaunch: false,
      isComplete: true,
    };
  }

  const percent = Math.min(100, (elapsedMs / totalMs) * 100);
  const distanceTraveledKm = Math.round((percent / 100) * totalDistanceKm);

  let phase = "Trans-Lunar Coast";
  if (percent < 1) phase = "Earth Orbit / TLI";
  else if (percent < 10) phase = "Early Trans-Lunar Coast";
  else if (percent < 50) phase = "Trans-Lunar Coast";
  else if (percent < 80) phase = "Deep Space / Mid-Course";
  else if (percent < 95) phase = "Lunar Approach";
  else phase = "Final Approach to Moon";

  return {
    percent: Math.round(percent * 100) / 100,
    distanceTraveledKm,
    distanceRemainingKm: totalDistanceKm - distanceTraveledKm,
    phase,
    elapsedMs,
    remainingMs: totalMs - elapsedMs,
    totalMs,
    isPreLaunch: false,
    isComplete: false,
  };
}

// ─── Curated sources (static, always valid) ───
export function getBestSources() {
  return [
    {
      id: "s1",
      title: "NASA Artemis II Mission Page",
      provider: "NASA",
      description: "Official mission overview, crew bios, spacecraft details, and live updates from NASA.",
      url: "https://www.nasa.gov/artemis-ii",
      category: "official",
      trustLevel: 5,
      tags: ["official", "primary"],
    },
    {
      id: "s2",
      title: "NASA Live Stream",
      provider: "NASA TV",
      description: "Official live video coverage including Mission Control audio and crew communications.",
      url: "https://www.nasa.gov/nasatv",
      category: "livestream",
      trustLevel: 5,
      tags: ["official", "live"],
    },
    {
      id: "s3",
      title: "NASA Artemis Blog",
      provider: "NASA",
      description: "Detailed text updates from NASA's Artemis team with technical details and status reports.",
      url: "https://blogs.nasa.gov/artemis",
      category: "official",
      trustLevel: 5,
      tags: ["official", "updates"],
    },
    {
      id: "s4",
      title: "ESA Orion Service Module Updates",
      provider: "European Space Agency",
      description: "Updates on the European Service Module that powers Orion.",
      url: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion",
      category: "official",
      trustLevel: 5,
      tags: ["official", "technical"],
    },
    {
      id: "s5",
      title: "SpaceflightNow Live Coverage",
      provider: "Spaceflight Now",
      description: "Comprehensive launch and mission coverage with expert commentary.",
      url: "https://spaceflightnow.com",
      category: "news",
      trustLevel: 4,
      tags: ["news", "live"],
    },
    {
      id: "s6",
      title: "NASASpaceflight.com Coverage",
      provider: "NASASpaceflight",
      description: "In-depth technical coverage and real-time updates from experienced space journalists.",
      url: "https://www.nasaspaceflight.com",
      category: "news",
      trustLevel: 4,
      tags: ["news", "technical"],
    },
    {
      id: "s7",
      title: "Space.com Artemis Coverage",
      provider: "Space.com",
      description: "Mission explainers, timeline tracking, and breaking news.",
      url: "https://www.space.com/artemis-program",
      category: "news",
      trustLevel: 3,
      tags: ["news", "explainers"],
    },
    {
      id: "s8",
      title: "NASA Press Kit",
      provider: "NASA",
      description: "Official press kit with mission timeline, spacecraft specs, and orbital parameters.",
      url: "https://www.nasa.gov/artemis-ii/press-kit",
      category: "technical",
      trustLevel: 5,
      tags: ["official", "reference"],
    },
  ];
}

// ─── Format helpers ───
export function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
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
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getMilestoneStatus(milestone) {
  if (milestone.actualTime) return "completed";
  const now = new Date();
  const scheduled = new Date(milestone.scheduledTime);
  const diff = scheduled.getTime() - now.getTime();
  if (Math.abs(diff) < 30 * 60 * 1000) return "live";
  if (diff > 0) return "upcoming";
  return "completed";
}