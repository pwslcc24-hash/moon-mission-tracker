import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const NASA_API_KEY = Deno.env.get("NASA_API_KEY") || "DEMO_KEY";

// Fallback demo data if all API calls fail
const FALLBACK = {
  missionName: "Artemis II",
  currentStatus: "En Route to Moon",
  timestamp: new Date().toISOString(),
  nextEvent: "Lunar Flyby",
  source: "demo-fallback",
  updates: [],
  nasaApod: null,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await Promise.allSettled([
      // NASA APOD - proves the API key works and gives fresh NASA content
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`).then(r => r.json()),
      // Spaceflight News API - free, no key needed, real Artemis articles
      fetch("https://api.spaceflightnewsapi.net/v4/articles/?search=artemis&limit=5&ordering=-published_at").then(r => r.json()),
    ]);

    const apodData = results[0].status === "fulfilled" ? results[0].value : null;
    const newsData = results[1].status === "fulfilled" ? results[1].value : null;

    // Build structured updates from real news articles
    const updates = (newsData?.results || []).map((article, i) => ({
      id: `live-${i}`,
      title: article.title,
      body: article.summary || article.title,
      timestamp: article.published_at,
      source: article.news_site,
      sourceType: "news",
      sourceUrl: article.url,
      category: "live",
    }));

    // Determine current mission phase based on real date
    // Artemis II was targeted for late 2025 / 2026 — use real date to determine status
    const now = new Date();
    const artemisTargetLaunch = new Date("2026-04-01T00:00:00Z");
    const isPreLaunch = now < artemisTargetLaunch;

    const currentStatus = isPreLaunch
      ? "Pre-Launch Preparations"
      : "Mission Active";

    const nextEvent = isPreLaunch
      ? "Artemis II Launch"
      : "Lunar Flyby";

    return Response.json({
      missionName: "Artemis II",
      currentStatus,
      timestamp: new Date().toISOString(),
      nextEvent,
      source: "nasa-live",
      isPreLaunch,
      updates,
      nasaApod: apodData ? {
        title: apodData.title,
        explanation: apodData.explanation,
        url: apodData.url,
        date: apodData.date,
        mediaType: apodData.media_type,
      } : null,
      apiKeyValid: !!(apodData && !apodData.error),
    });
  } catch (error) {
    // Always return fallback so the frontend never breaks
    return Response.json({ ...FALLBACK, error: error.message, source: "demo-fallback" });
  }
});