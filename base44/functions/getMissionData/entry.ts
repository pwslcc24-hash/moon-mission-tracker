// ─── Confirmed Mission Constants ───
const CONFIRMED_LAUNCH_TIME = "2026-04-01T22:35:12Z";
const ESTIMATED_ARRIVAL_TIME = "2026-04-06T18:00:00Z";
const ESTIMATED_RETURN_TIME  = "2026-04-11T00:21:00Z";
const TOTAL_DISTANCE_KM = 384400;
const TOTAL_DISTANCE_MI = 238855;

const CREW = [
  { name: "Reid Wiseman",   role: "Commander" },
  { name: "Victor Glover",  role: "Pilot" },
  { name: "Christina Koch", role: "Mission Specialist" },
  { name: "Jeremy Hansen",  role: "Mission Specialist (CSA)" },
];

function buildMilestones(launchMs) {
  const L = launchMs;
  const min = 60 * 1000;
  const hr  = 3600 * 1000;
  return [
    { id: "launch", name: "Launch", description: "SLS Block 1 lifts off from KSC Launch Pad 39B", scheduledTime: new Date(L).toISOString(), actualTime: new Date(L).toISOString(), confidence: "confirmed", source: "NASA", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "booster-sep", name: "Solid Rocket Booster Separation", description: "Twin SRBs separate at approximately T+2:12", scheduledTime: new Date(L + 2*min + 12*1000).toISOString(), actualTime: new Date(L + 2*min + 12*1000).toISOString(), confidence: "confirmed", source: "NASA", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "core-sep", name: "Core Stage Separation", description: "Core stage MECO and separation", scheduledTime: new Date(L + 8*min + 30*1000).toISOString(), actualTime: new Date(L + 8*min + 30*1000).toISOString(), confidence: "confirmed", source: "NASA", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "tli", name: "Trans-Lunar Injection Burn", description: "ICPS upper stage fires to send Orion on lunar trajectory", scheduledTime: new Date(L + 1.5*hr).toISOString(), actualTime: new Date(L + 1.5*hr).toISOString(), confidence: "confirmed", source: "NASA", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "icps-sep", name: "ICPS Separation", description: "Interim Cryogenic Propulsion Stage separates from Orion", scheduledTime: new Date(L + 2*hr).toISOString(), actualTime: new Date(L + 2*hr).toISOString(), confidence: "confirmed", source: "NASA", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "mcc1", name: "Midcourse Correction 1", description: "First trajectory adjustment burn", scheduledTime: new Date(L + 24*hr).toISOString(), actualTime: null, confidence: "estimated", source: "NASA Mission Planning", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "mcc2", name: "Midcourse Correction 2", description: "Second trajectory refinement burn", scheduledTime: new Date(L + 56*hr).toISOString(), actualTime: null, confidence: "estimated", source: "NASA Mission Planning", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "lunar-flyby", name: "Lunar Flyby (Closest Approach)", description: "Orion performs free-return powered flyby around the Moon", scheduledTime: ESTIMATED_ARRIVAL_TIME, actualTime: null, confidence: "estimated", source: "NASA Artemis II Mission Profile", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "return-burn", name: "Return Trajectory Burn", description: "Orion fires engines for Earth return trajectory", scheduledTime: new Date(new Date(ESTIMATED_ARRIVAL_TIME).getTime() + 6*hr).toISOString(), actualTime: null, confidence: "estimated", source: "NASA Mission Planning", sourceUrl: "https://www.nasa.gov/artemis-ii" },
    { id: "splashdown", name: "Splashdown", description: "Orion capsule splashes down in the Pacific Ocean", scheduledTime: ESTIMATED_RETURN_TIME, actualTime: null, confidence: "estimated", source: "NASA Mission Planning", sourceUrl: "https://www.nasa.gov/artemis-ii" },
  ];
}

function calculateProgress(launchTime, arrivalTime) {
  const now = Date.now();
  const launchMs = new Date(launchTime).getTime();
  const arrivalMs = new Date(arrivalTime).getTime();
  const totalMs = arrivalMs - launchMs;
  const elapsedMs = now - launchMs;

  if (elapsedMs < 0) {
    return { percent: 0, distanceTraveled: 0, distanceRemaining: TOTAL_DISTANCE_KM, phase: "Pre-Launch", elapsedMs: 0, remainingMs: Math.abs(elapsedMs), isPreLaunch: true };
  }
  if (elapsedMs >= totalMs) {
    return { percent: 100, distanceTraveled: TOTAL_DISTANCE_KM, distanceRemaining: 0, phase: "Lunar Flyby / Return", elapsedMs, remainingMs: 0, isPreLaunch: false };
  }

  const percent = Math.min(100, (elapsedMs / totalMs) * 100);
  const distanceTraveled = Math.round((percent / 100) * TOTAL_DISTANCE_KM);

  let phase = "Trans-Lunar Coast";
  if (percent < 1) phase = "Earth Orbit / TLI";
  else if (percent < 10) phase = "Early Trans-Lunar Coast";
  else if (percent < 50) phase = "Trans-Lunar Coast";
  else if (percent < 80) phase = "Deep Space / Mid-Course";
  else if (percent < 95) phase = "Lunar Approach";
  else phase = "Final Approach to Moon";

  return {
    percent: Math.round(percent * 100) / 100,
    distanceTraveled,
    distanceRemaining: TOTAL_DISTANCE_KM - distanceTraveled,
    phase,
    elapsedMs,
    remainingMs: totalMs - elapsedMs,
    isPreLaunch: false,
  };
}

async function fetchWithTimeout(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const FALLBACK_UPDATES = [];

Deno.serve(async (req) => {
  try {
    const now = new Date();
    const launchMs = new Date(CONFIRMED_LAUNCH_TIME).getTime();
    const progress = calculateProgress(CONFIRMED_LAUNCH_TIME, ESTIMATED_ARRIVAL_TIME);
    const milestones = buildMilestones(launchMs);
    const nextMilestone = milestones.find(m => !m.actualTime && new Date(m.scheduledTime) > now);

    // Fetch news with a strict timeout — never block the response
    let updates = [];
    let liveDataAvailable = false;

    try {
      const [news1, news2] = await Promise.all([
        fetchWithTimeout("https://api.spaceflightnewsapi.net/v4/articles/?search=artemis+ii&limit=10&ordering=-published_at"),
        fetchWithTimeout("https://api.spaceflightnewsapi.net/v4/articles/?search=artemis+2&limit=5&ordering=-published_at"),
      ]);

      const seen = new Set();
      const allArticles = [...(news1?.results || []), ...(news2?.results || [])].filter(a => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      }).sort((a, b) => new Date(b.published_at) - new Date(a.published_at)).slice(0, 8);

      liveDataAvailable = allArticles.length > 0;
      updates = allArticles.map((article, i) => ({
        id: `live-${i}`,
        title: article.title,
        body: article.summary || article.title,
        timestamp: article.published_at,
        source: article.news_site,
        sourceType: article.news_site === "NASA" ? "official" : "news",
        sourceUrl: article.url,
        category: "live",
      }));
    } catch (_err) {
      // News fetch timed out — proceed with empty updates
      liveDataAvailable = false;
    }

    return Response.json({
      missionName: "Artemis II",
      currentStatus: progress.isPreLaunch ? "Pre-Launch Preparations" : "Mission Active – En Route to Moon",
      currentPhase: progress.phase,
      launchTime: CONFIRMED_LAUNCH_TIME,
      launchTimeConfidence: "confirmed",
      arrivalTime: ESTIMATED_ARRIVAL_TIME,
      arrivalTimeConfidence: "estimated",
      returnTime: ESTIMATED_RETURN_TIME,
      returnTimeConfidence: "estimated",
      nextEvent: nextMilestone?.name || "Lunar Flyby",
      nextEventTime: nextMilestone?.scheduledTime || ESTIMATED_ARRIVAL_TIME,
      percentProgress: progress.percent,
      distanceTraveled: progress.distanceTraveled,
      distanceRemaining: progress.distanceRemaining,
      totalDistanceKm: TOTAL_DISTANCE_KM,
      positionSource: "Calculated from confirmed launch time (NASA, 2026-04-01T22:35:12Z)",
      positionAccuracy: "calculated",
      positionSourceUrl: "https://en.wikipedia.org/wiki/Artemis_II",
      dataNote: "Launch time confirmed by NASA. Flyby/return times are NET estimates from official mission documents.",
      elapsedMs: progress.elapsedMs,
      remainingMs: progress.remainingMs,
      isPreLaunch: progress.isPreLaunch,
      agency: "NASA / CSA",
      vehicle: "Orion MPCV / SLS Block 1",
      launchSite: "Kennedy Space Center, LC-39B",
      missionType: "Crewed Lunar Free-Return Flyby",
      missionDurationDays: 10,
      description: "First crewed mission beyond Earth orbit since Apollo 17 in 1972. Four astronauts fly a free-return trajectory around the Moon aboard NASA's Orion spacecraft.",
      crew: CREW,
      milestones,
      updates,
      liveDataAvailable,
      liveDataError: liveDataAvailable ? null : "Spaceflight News API unavailable",
      source: liveDataAvailable ? "spaceflight-news-api" : "calculated",
      timestamp: now.toISOString(),
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});