import { NextRequest } from "next/server";

const DEFAULT_ADM4 = "64.09.04.1005"; // Sepaku (IKN)
const LATEST_URL = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
const RECENT_URL = "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json";
const FELT_URL = "https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json";

async function getJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) {
    throw new Error(`BMKG responded with status ${response.status} for ${url}`);
  }
  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adm4 = searchParams.get("adm4") || DEFAULT_ADM4;
    const weatherUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

    const [weatherResult, latestResult, recentResult, feltResult] = await Promise.allSettled([
      getJson(weatherUrl),
      getJson(LATEST_URL),
      getJson(RECENT_URL),
      getJson(FELT_URL),
    ]);

    const weatherData = weatherResult.status === "fulfilled" ? weatherResult.value : null;
    const latestData = latestResult.status === "fulfilled" ? latestResult.value : null;
    const recentData = recentResult.status === "fulfilled" ? recentResult.value : null;
    const feltData = feltResult.status === "fulfilled" ? feltResult.value : null;

    // Flatten weather periods across data array
    const periods = weatherData?.data?.[0]?.cuaca?.flat() ?? [];

    return Response.json({
      weather: {
        location: weatherData?.lokasi ?? null,
        periods: periods,
      },
      earthquakes: {
        latest: latestData?.Infogempa?.gempa ?? null,
        recent: recentData?.Infogempa?.gempa ?? [],
        felt: feltData?.Infogempa?.gempa ?? [],
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("BMKG dashboard fetch failed", error);
    return Response.json(
      { message: "Gagal mengambil data dari BMKG.", error: String(error) },
      { status: 502 }
    );
  }
}
