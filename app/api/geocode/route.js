import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const nominatimEndpoint = "https://nominatim.openstreetmap.org/search";
let lastRequestAt = 0;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: "Enter a location between 2 and 120 characters." }, { status: 400 });
  }

  const delay = Math.max(0, 1050 - (Date.now() - lastRequestAt));
  if (delay) await wait(delay);
  lastRequestAt = Date.now();

  const url = new URL(nominatimEndpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "za");
  url.searchParams.set("limit", "5");

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en-ZA,en;q=0.9",
        "User-Agent": "QueueLess-SA-Hackathon-Prototype/1.0",
      },
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error(`Geocoding provider returned ${response.status}`);

    const places = await response.json();
    const results = places.map((place) => {
      const address = place.address || {};
      const label = address.suburb
        || address.city_district
        || address.town
        || address.city
        || address.village
        || place.name
        || place.display_name.split(",")[0];
      const displayParts = place.display_name.split(",").map((part) => part.trim());
      const secondaryParts = displayParts.filter((part) => part.toLowerCase() !== String(label).toLowerCase()).slice(0, 3);
      return {
        id: `osm-${place.osm_type}-${place.osm_id}`,
        label,
        secondary: secondaryParts.join(", ") || "South Africa",
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      };
    }).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));

    return NextResponse.json(
      { results, provider: "OpenStreetMap Nominatim" },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Live location search is temporarily unavailable. Check your internet connection or use a popular area." },
      { status: 502 },
    );
  }
}
