"use client";

import React, { useState, useMemo } from "react";
import { WeatherLocation, WeatherPeriod } from "../types/bmkg";
import { ALL_REGIONS, POPULAR_REGIONS, RegionOption } from "../data/regions";
import { getBrowserCoordinates, findNearestBMKGRegion } from "../utils/geo";
import {
  CloudSun,
  Search,
  Droplets,
  Wind,
  Navigation,
  Eye,
  Cloud,
  MapPin,
  Calendar,
  Clock,
  Compass,
  X,
  LocateFixed,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface WeatherDetailsProps {
  location: WeatherLocation | null;
  periods: WeatherPeriod[];
  selectedRegionId: string;
  onSelectRegion: (region: RegionOption) => void;
  isLoading?: boolean;
}

export default function WeatherDetails({
  location,
  periods,
  selectedRegionId,
  onSelectRegion,
  isLoading = false,
}: WeatherDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("Semua");
  const [isLocating, setIsLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [showLocationBanner, setShowLocationBanner] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("bmkg_location_prompted");
    }
    return false;
  });

  const currentWeather = periods[0] || null;

  // Function to request user coordinates and match BMKG region
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setGeoMessage({ type: "info", text: "Mengakses GPS & koordinat perangkat Anda..." });
    localStorage.setItem("bmkg_location_prompted", "true");

    try {
      const coords = await getBrowserCoordinates();
      setGeoMessage({ type: "info", text: "Mencocokkan ke stasiun pemantauan BMKG terdekat..." });

      const nearestRegion = await findNearestBMKGRegion(coords.lat, coords.lng, ALL_REGIONS);
      if (nearestRegion) {
        onSelectRegion(nearestRegion);
        setGeoMessage({
          type: "success",
          text: `Lokasi terdeteksi: ${nearestRegion.regency}, ${nearestRegion.province}`,
        });
        setShowLocationBanner(false);
        // Clear success message after 5 seconds
        setTimeout(() => setGeoMessage(null), 5000);
      } else {
        setGeoMessage({
          type: "error",
          text: "Wilayah spesifik Anda belum terpetakan. Silakan cari kota/kabupaten Anda secara manual.",
        });
      }
    } catch (err) {
      setGeoMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mendeteksi lokasi.",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleDismissBanner = () => {
    setShowLocationBanner(false);
    localStorage.setItem("bmkg_location_prompted", "true");
  };

  // Filter across all 514 regions in Indonesia
  const filteredRegions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_REGIONS.filter((region) => {
      const matchSearch =
        !q ||
        region.name.toLowerCase().includes(q) ||
        region.regency.toLowerCase().includes(q) ||
        region.province.toLowerCase().includes(q) ||
        region.district.toLowerCase().includes(q);
      const matchIsland = selectedIsland === "Semua" || region.island === selectedIsland;
      return matchSearch && matchIsland;
    });
  }, [searchQuery, selectedIsland]);

  const islands = ["Semua", "Jawa", "Sumatera", "Kalimantan", "Sulawesi", "Bali & Nusa Tenggara", "Maluku", "Papua"];

  // Helper date formatter
  const formatTime = (datetimeStr?: string) => {
    if (!datetimeStr) return "";
    try {
      const date = new Date(datetimeStr);
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      }).format(date);
    } catch {
      return datetimeStr;
    }
  };

  const formatHourOnly = (datetimeStr?: string) => {
    if (!datetimeStr) return "";
    try {
      const date = new Date(datetimeStr);
      return new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return datetimeStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Permission Prompt Banner */}
      {showLocationBanner && (
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 shrink-0">
              <LocateFixed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Gunakan Lokasi Anda Saat Ini?</h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Izinkan akses lokasi untuk menampilkan prakiraan cuaca otomatis di kabupaten/kota Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDismissBanner}
              className="px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-sky-700 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mendeteksi...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Aktifkan Lokasi Saya</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Feedback Message */}
      {geoMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs transition-all ${
            geoMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : geoMessage.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {geoMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : geoMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
            )}
            <span>{geoMessage.text}</span>
          </div>
          <button
            onClick={() => setGeoMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Quick Region Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kota, kabupaten, atau provinsi (contoh: Sleman, Bantul, Bandung, Surabaya)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            title="Deteksi Lokasi GPS Saya"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            ) : (
              <LocateFixed className="w-4 h-4 text-sky-600" />
            )}
            <span className="hidden sm:inline">Lokasi Saya</span>
          </button>

          {/* Island Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {islands.map((island) => (
              <button
                key={island}
                onClick={() => setSelectedIsland(island)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedIsland === island
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {island}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Dropdown / Grid if searching */}
        {searchQuery.trim().length > 0 ? (
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Hasil Pencarian ({filteredRegions.length} wilayah ditemukan):
              </span>
              {filteredRegions.length > 12 && (
                <span className="text-[11px] text-slate-400">Menampilkan 12 teratas</span>
              )}
            </div>
            {filteredRegions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {filteredRegions.slice(0, 12).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRegion(r);
                      setSearchQuery("");
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                      selectedRegionId === r.id
                        ? "bg-sky-50 text-sky-900 border-sky-300 font-bold shadow-2xs"
                        : "bg-slate-50 hover:bg-sky-50/50 text-slate-800 hover:text-sky-900 border-slate-200"
                    }`}
                  >
                    <div className="truncate mr-2">
                      <p className="font-bold text-slate-900 truncate">{r.regency}</p>
                      <p className="text-[10px] text-slate-500 truncate">{r.province} · {r.island}</p>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                Tidak ada kota/kabupaten yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        ) : (
          /* Popular Quick Region Selector Chips */
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-500 font-semibold shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-600" /> Wilayah Populer:
            </span>
            {POPULAR_REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelectRegion(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  selectedRegionId === r.id
                    ? "bg-sky-100 text-sky-700 border border-sky-300 font-bold"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Weather Display */}
      {isLoading ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 shadow-sm animate-pulse">
          <CloudSun className="w-12 h-12 text-sky-500 mb-3 animate-bounce" />
          <p className="text-sm font-semibold">Memperbarui data cuaca BMKG...</p>
        </div>
      ) : currentWeather ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Weather Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-sky-50 via-white to-blue-50/40 border border-sky-100 rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1 bg-sky-100 text-sky-800 px-2.5 py-1 rounded-lg border border-sky-200 font-bold">
                  <Clock className="w-3.5 h-3.5" /> Cuaca Terkini
                </span>
                <span className="font-medium text-slate-600">{currentWeather.local_datetime}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    {location?.desa || "Wilayah Terpilih"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Kec. {location?.kecamatan}, {location?.kotkab}
                  </p>
                  <p className="text-[11px] text-slate-500">{location?.provinsi}</p>
                </div>
              </div>

              <div className="my-6 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-black text-slate-900 tracking-tight">{currentWeather.t}</span>
                    <span className="text-3xl font-bold text-sky-600 ml-1">°C</span>
                  </div>
                  <p className="text-base font-bold text-sky-700 mt-1">{currentWeather.weather_desc}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentWeather.image}
                  alt={currentWeather.weather_desc}
                  className="w-24 h-24 object-contain filter drop-shadow-md"
                />
              </div>
            </div>

            {/* Micro Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Droplets className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Kelembapan</span>
                  <span className="font-bold text-slate-900">{currentWeather.hu}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Wind className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Kecepatan Angin</span>
                  <span className="font-bold text-slate-900">{currentWeather.ws} km/j</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Navigation className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Arah Angin</span>
                  <span className="font-bold text-slate-900">
                    {currentWeather.wd} ({currentWeather.wd_deg || 0}°)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Cloud className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Tutupan Awan</span>
                  <span className="font-bold text-slate-900">{currentWeather.tcc ?? "-"}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Timeline Cards */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" /> Prakiraan Waktu ke Waktu
                </h4>
                <span className="text-xs text-slate-500 font-semibold">Periode 3 Hari BMKG</span>
              </div>

              {/* Hourly Cards Scroll */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {periods.slice(1, 9).map((p, idx) => (
                  <div
                    key={`forecast-${idx}`}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 rounded-xl flex flex-col items-center text-center transition-all group shadow-2xs"
                  >
                    <span className="text-xs text-slate-600 font-bold">{formatHourOnly(p.local_datetime)}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(p.local_datetime).split(",")[0]}</span>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.weather_desc}
                      className="w-12 h-12 object-contain my-2 group-hover:scale-110 transition-transform"
                    />

                    <span className="text-lg font-black text-slate-900">{p.t}°C</span>
                    <p className="text-[11px] text-sky-700 font-semibold line-clamp-1 mt-0.5">{p.weather_desc}</p>

                    <div className="mt-2 pt-2 border-t border-slate-200 w-full flex items-center justify-around text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <Droplets className="w-3 h-3 text-sky-600" /> {p.hu}%
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Wind className="w-3 h-3 text-emerald-600" /> {p.ws}k
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Parameters */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-medium">Jarak Pandang</span>
                  <p className="text-sm font-bold text-slate-900">{currentWeather.vs_text || "Normal (> 10 km)"}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <Compass className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-medium">Arah Hembusan</span>
                  <p className="text-sm font-bold text-slate-900">
                    {currentWeather.wd} ke {currentWeather.wd_deg ? `${(currentWeather.wd_deg + 180) % 360}°` : "-"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
                <CloudSun className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 font-medium">Zona Waktu</span>
                  <p className="text-sm font-bold text-slate-900">{location?.timezone || "WITA"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p>Data cuaca belum dapat dimuat untuk wilayah ini.</p>
        </div>
      )}
    </div>
  );
}
