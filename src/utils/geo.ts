import { RegionOption } from "../data/regions";

/**
 * Request user coordinates via browser Geolocation API
 */
export function getBrowserCoordinates(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Browser Anda tidak mendukung fitur geolokasi."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Gagal mendapatkan lokasi.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Izin akses lokasi ditolak. Anda dapat memilih wilayah secara manual.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Informasi lokasi tidak tersedia pada perangkat.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Waktu permintaan lokasi telah habis (timeout).";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to find the matching BMKG RegionOption from ALL_REGIONS
 */
export async function findNearestBMKGRegion(
  lat: number,
  lng: number,
  allRegions: RegionOption[]
): Promise<RegionOption | null> {
  try {
    const url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lng + "&localityLanguage=id";
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const adminObjs: Array<{ name: string; adminLevel?: number; description?: string }> =
      data.localityInfo?.administrative || [];

    // 1. Prioritize level 5 (Kabupaten / Kota level in Indonesia)
    const level5 = adminObjs
      .filter((a) => a.adminLevel === 5)
      .map((a) => a.name.toLowerCase().replace(/^(kabupaten|kota|adm\.|administrasi)\s+/i, "").trim());

    for (const name of level5) {
      const found = allRegions.find(
        (r) =>
          r.name.toLowerCase() === name ||
          r.regency.toLowerCase() === name ||
          r.regency.toLowerCase().includes(name)
      );
      if (found) return found;
    }

    // 2. Check other administrative levels (level 6 district, level 4 province/city)
    const otherLevels = adminObjs
      .filter((a) => (a.adminLevel ?? 0) >= 4)
      .map((a) => a.name.toLowerCase().replace(/^(kabupaten|kota|adm\.|administrasi|daerah)\s+/i, "").trim());

    for (const name of otherLevels) {
      if (["indonesia", "jawa", "sumatera", "kalimantan", "sulawesi", "papua", "bali"].includes(name)) continue;
      const found = allRegions.find(
        (r) =>
          r.name.toLowerCase() === name ||
          r.regency.toLowerCase() === name ||
          r.regency.toLowerCase().includes(name) ||
          r.district.toLowerCase() === name
      );
      if (found) return found;
    }

    // 3. Check city / locality field fallback
    const fallbacks = [data.city, data.locality]
      .filter(Boolean)
      .map((n: string) => n.toLowerCase().replace(/^(kabupaten|kota|daerah|kecamatan)\s+/i, "").trim());

    for (const name of fallbacks) {
      const found = allRegions.find(
        (r) =>
          r.name.toLowerCase() === name ||
          r.regency.toLowerCase() === name ||
          r.regency.toLowerCase().includes(name)
      );
      if (found) return found;
    }

    return null;
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return null;
  }
}
