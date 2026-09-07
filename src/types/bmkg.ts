export interface WeatherPeriod {
  datetime: string;
  utc_datetime: string;
  local_datetime: string;
  t: number; // Suhu (Celsius)
  hu: number; // Kelembapan (%)
  ws: number; // Kecepatan angin (km/jam)
  wd: string; // Arah angin (N, NE, E, SE, S, SW, W, NW)
  wd_deg?: number;
  weather: number;
  weather_desc: string;
  weather_desc_en?: string;
  image: string;
  tcc?: number; // Tutupan awan (%)
  tp?: number; // Curah hujan (mm)
  vs_text?: string; // Jarak pandang
}

export interface WeatherLocation {
  adm1?: string;
  adm2?: string;
  adm3?: string;
  adm4?: string;
  provinsi: string;
  kotkab: string;
  kecamatan: string;
  desa: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface Earthquake {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string; // e.g. "-0.38,123.13"
  Lintang: string; // e.g. "0.38 LS"
  Bujur: string; // e.g. "123.13 BT"
  Magnitude: string; // e.g. "4.9"
  Kedalaman: string; // e.g. "7 km"
  Wilayah: string;
  Potensi?: string;
  Dirasakan?: string;
  Shakemap?: string;
}

export interface DashboardResponse {
  weather: {
    location: WeatherLocation | null;
    periods: WeatherPeriod[];
  };
  earthquakes: {
    latest: Earthquake | null;
    recent: Earthquake[];
    felt: Earthquake[];
  };
  fetchedAt: string;
  message?: string;
}

