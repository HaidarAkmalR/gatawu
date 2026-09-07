"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { DashboardResponse, Earthquake } from "../types/bmkg";
import { POPULAR_REGIONS, RegionOption } from "../data/regions";
import WeatherDetails from "../components/WeatherDetails";
import QuakeHistoryTable from "../components/QuakeHistoryTable";
import EducationGuide from "../components/EducationGuide";
import ShakemapModal from "../components/ShakemapModal";
import {
  Activity,
  AlertTriangle,
  Clock,
  CloudRain,
  Compass,
  ExternalLink,
  Eye,
  MapPin,
  Radio,
  RefreshCw,
  Sparkles,
  Waves,
  Shield,
} from "lucide-react";

// Dynamic import for Leaflet map to prevent SSR issues
const EarthquakeMap = dynamic(() => import("../components/EarthquakeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 animate-pulse">
      <Activity className="w-10 h-10 text-sky-600 mb-3 animate-spin" />
      <p className="text-sm font-semibold">Memuat Peta Interaktif BMKG...</p>
    </div>
  ),
});

const fetcher = async (url: string): Promise<DashboardResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat data resmi BMKG.");
  return res.json();
};

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bmkg_selected_region");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return POPULAR_REGIONS[0];
  });
  const [activeTab, setActiveTab] = useState<"overview" | "map" | "weather" | "history" | "edu">("overview");
  const [selectedQuakeForMap, setSelectedQuakeForMap] = useState<Earthquake | null>(null);
  const [activeShakemapQuake, setActiveShakemapQuake] = useState<Earthquake | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  const handleSelectRegion = (region: RegionOption) => {
    setSelectedRegion(region);
    try {
      localStorage.setItem("bmkg_selected_region", JSON.stringify(region));
    } catch {
      // ignore
    }
  };

  // SWR for dashboard data with selected adm4
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardResponse>(
    `/api/dashboard?adm4=${encodeURIComponent(selectedRegion.id)}`,
    fetcher,
    {
      refreshInterval: 300_000, // 5 menit auto-refresh
      revalidateOnFocus: true,
      dedupingInterval: 10_000,
    }
  );

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: selectedRegion.timezone,
      }).format(now);
      const tzLabel =
        selectedRegion.timezone === "Asia/Jakarta"
          ? "WIB"
          : selectedRegion.timezone === "Asia/Makassar"
          ? "WITA"
          : "WIT";
      setCurrentTime(`${formatted} ${tzLabel}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedRegion]);

  const latestQuake = data?.earthquakes.latest || null;
  const recentQuakes = data?.earthquakes.recent || [];
  const feltQuakes = data?.earthquakes.felt || [];
  const weatherNow = data?.weather.periods[0] || null;
  const weatherPeriods = data?.weather.periods || [];

  // Handler to jump to map tab and focus a quake
  const handleFocusQuakeOnMap = (quake: Earthquake) => {
    setSelectedQuakeForMap(quake);
    setActiveTab("map");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-sky-600/20 border border-sky-400/30">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">BMKG</span>
                <span className="text-lg font-bold text-sky-600">MONITOR</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Pusat Informasi Cuaca & Kegempaan Indonesia</p>
            </div>
          </div>

          {/* Center Info / Live Ticker */}
          <div className="hidden md:flex items-center gap-2 text-xs bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="font-mono">{currentTime || "Memuat waktu..."}</span>
          </div>

          {/* Right Action: Refresh button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => mutate()}
              disabled={isValidating}
              className="flex items-center gap-2 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
              title="Perbarui Data dari BMKG"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? "animate-spin text-sky-600" : ""}`} />
              <span className="hidden sm:inline">{isValidating ? "Memperbarui..." : "Perbarui"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Radio className="w-4 h-4" /> Ringkasan
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "map"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Compass className="w-4 h-4" /> Peta Gempa Interaktif
          </button>
          <button
            onClick={() => setActiveTab("weather")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "weather"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CloudRain className="w-4 h-4" /> Prakiraan Cuaca
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "history"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Waves className="w-4 h-4" /> Riwayat & Katalog Gempa
          </button>
          <button
            onClick={() => setActiveTab("edu")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "edu"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Shield className="w-4 h-4" /> Edukasi & Peringatan Dini
          </button>
        </div>

        {/* Global Loading / Error Notifications */}
        {isLoading && !data && (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-600 shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
            <span className="text-sm font-semibold">Menghubungkan ke server BMKG & memuat parameter terkini...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-900 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error.message || "Gagal memuat data dari BMKG. Pastikan koneksi internet stabil."}</span>
            </div>
            <button
              onClick={() => mutate()}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW (RINGKASAN DASHBOARD) */}
        {activeTab === "overview" && data && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Gempa Terkini */}
              <div
                onClick={() => latestQuake && handleFocusQuakeOnMap(latestQuake)}
                className="p-4 bg-gradient-to-br from-rose-50 to-white border border-red-200 hover:border-red-400 rounded-2xl cursor-pointer transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 animate-pulse" /> Gempa Terkini
                  </span>
                  <span className="px-2 py-0.5 text-xs font-black bg-red-100 text-red-700 rounded-md border border-red-200">
                    M {latestQuake?.Magnitude || "-"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-red-700">
                  {latestQuake?.Wilayah || "Memuat..."}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{latestQuake?.Tanggal} {latestQuake?.Jam}</span>
                  <span className="text-emerald-700 font-bold">{latestQuake?.Kedalaman}</span>
                </div>
              </div>

              {/* Card 2: Gempa M5+ */}
              <div
                onClick={() => setActiveTab("history")}
                className="p-4 bg-gradient-to-br from-amber-50/60 to-white border border-amber-200 hover:border-amber-400 rounded-2xl cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Waves className="w-3.5 h-3.5" /> Gempa M 5.0+
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                    {recentQuakes.length} Kejadian
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-amber-800">
                  {recentQuakes[0]?.Wilayah || "Tidak ada data terkini"}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Terbaru: M {recentQuakes[0]?.Magnitude || "-"}</span>
                  <span>{recentQuakes[0]?.Jam || ""}</span>
                </div>
              </div>

              {/* Card 3: Gempa Dirasakan */}
              <div
                onClick={() => setActiveTab("history")}
                className="p-4 bg-gradient-to-br from-cyan-50/60 to-white border border-cyan-200 hover:border-cyan-400 rounded-2xl cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5" /> Dirasakan
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-cyan-100 text-cyan-800 rounded-md border border-cyan-200">
                    {feltQuakes.length} Gempa
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-cyan-800">
                  {feltQuakes[0]?.Dirasakan || feltQuakes[0]?.Wilayah || "-"}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>M {feltQuakes[0]?.Magnitude || "-"}</span>
                  <span>{feltQuakes[0]?.Tanggal}</span>
                </div>
              </div>

              {/* Card 4: Cuaca Terpilih */}
              <div
                onClick={() => setActiveTab("weather")}
                className="p-4 bg-gradient-to-br from-sky-50/60 to-white border border-sky-200 hover:border-sky-400 rounded-2xl cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-sky-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> Cuaca ({selectedRegion.name})
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {weatherNow ? `${weatherNow.t}°C` : "-"}
                  </span>
                </div>
                <p className="text-xs font-bold text-sky-700 line-clamp-1 group-hover:text-sky-800">
                  {weatherNow?.weather_desc || "Memuat cuaca..."}
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Lembap: {weatherNow?.hu || "-"}%</span>
                  <span>Angin: {weatherNow?.ws || "-"} km/j</span>
                </div>
              </div>
            </div>

            {/* Split Row: Mini Interactive Map & Weather Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (5 cols): Cuaca Singkat & Selector */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                {/* Current Weather Card */}
                <div className="p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50/30 border border-sky-100 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-600" />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{selectedRegion.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {selectedRegion.regency}, {selectedRegion.province}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("weather")}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                    >
                      Ubah Kota &rarr;
                    </button>
                  </div>

                  <div className="my-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-black text-slate-900">{weatherNow?.t ?? "-"}</span>
                        <span className="text-2xl font-bold text-sky-600 ml-1">°C</span>
                      </div>
                      <p className="text-sm font-bold text-sky-700 mt-1">{weatherNow?.weather_desc}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Zona waktu: {selectedRegion.timezone === "Asia/Jakarta" ? "WIB" : selectedRegion.timezone === "Asia/Makassar" ? "WITA" : "WIT"}
                      </p>
                    </div>
                    {weatherNow?.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={weatherNow.image}
                        alt={weatherNow.weather_desc}
                        className="w-20 h-20 object-contain filter drop-shadow-md"
                      />
                    )}
                  </div>

                  {/* Hourly Mini Cards */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Prakiraan Beberapa Jam Ke Depan</span>
                    <div className="grid grid-cols-4 gap-2">
                      {weatherPeriods.slice(1, 5).map((p, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block font-mono font-semibold">
                            {p.local_datetime.split(" ")[1]?.slice(0, 5) || ""}
                          </span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt="" className="w-8 h-8 mx-auto my-1 object-contain" />
                          <span className="text-xs font-black text-slate-900">{p.t}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Latest Earthquake Focus Banner */}
                {latestQuake && (
                  <div className="p-5 bg-gradient-to-r from-red-50 via-rose-50/50 to-white border border-red-200 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 animate-pulse" /> Peringatan Episentrum
                      </span>
                      {latestQuake.Shakemap && (
                        <button
                          onClick={() => setActiveShakemapQuake(latestQuake)}
                          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-300 flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Shakemap
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{latestQuake.Wilayah}</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {latestQuake.Tanggal} · {latestQuake.Jam} · Kedalaman {latestQuake.Kedalaman}
                    </p>
                    {latestQuake.Potensi && (
                      <p className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        {latestQuake.Potensi}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column (7 cols): Leaflet Interactive Map */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <EarthquakeMap
                  latest={latestQuake}
                  recent={recentQuakes}
                  felt={feltQuakes}
                  selectedQuake={selectedQuakeForMap}
                  onOpenShakemap={(q) => setActiveShakemapQuake(q)}
                  height="460px"
                />
              </div>
            </div>

            {/* Bottom Row: Recent & Felt Quakes List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* M5+ List */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-amber-600" /> Gempa M 5.0+ Terkini
                  </h4>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    Katalog Lengkap &rarr;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {recentQuakes.slice(0, 4).map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFocusQuakeOnMap(q)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 font-black rounded-lg border border-amber-200 text-xs">
                          M {q.Magnitude}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-800 line-clamp-1">
                            {q.Wilayah}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {q.Tanggal} · {q.Jam}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 font-medium shrink-0">{q.Kedalaman}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Felt Quakes List */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-600" /> Gempa Dirasakan Masyarakat
                  </h4>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700"
                  >
                    Katalog Lengkap &rarr;
                  </button>
                </div>
                <div className="space-y-2.5">
                  {feltQuakes.slice(0, 4).map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleFocusQuakeOnMap(q)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-800 font-black rounded-lg border border-cyan-200 text-xs">
                          M {q.Magnitude}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 group-hover:text-cyan-800 line-clamp-1">
                            {q.Wilayah}
                          </p>
                          <span className="text-[11px] text-amber-800 font-medium line-clamp-1">
                            {q.Dirasakan ? `Skala: ${q.Dirasakan}` : `${q.Tanggal} · ${q.Jam}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-600 font-medium shrink-0">{q.Kedalaman}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PETA GEMPA INTERAKTIF FULL CANVAS */}
        {activeTab === "map" && data && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-600" /> Peta Seismik & Episentrum Gempa Indonesia
                </h2>
                <p className="text-xs text-slate-500">
                  Data real-time TEWS BMKG. Klik marker untuk rincian magnitudo, kedalaman, koordinat, dan Shakemap.
                </p>
              </div>
              {selectedQuakeForMap && (
                <div className="flex items-center gap-2 bg-sky-50 border border-sky-300 px-3 py-1.5 rounded-xl text-xs text-sky-800 font-medium shadow-2xs">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Fokus: {selectedQuakeForMap.Wilayah.slice(0, 30)}...
                  <button
                    onClick={() => setSelectedQuakeForMap(null)}
                    className="ml-2 text-slate-500 hover:text-slate-900 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <EarthquakeMap
              latest={latestQuake}
              recent={recentQuakes}
              felt={feltQuakes}
              selectedQuake={selectedQuakeForMap}
              onOpenShakemap={(q) => setActiveShakemapQuake(q)}
              height="620px"
            />
          </div>
        )}

        {/* TAB 3: PRAKIRAAN CUACA */}
        {activeTab === "weather" && (
          <WeatherDetails
            location={data?.weather.location || null}
            periods={weatherPeriods}
            selectedRegionId={selectedRegion.id}
            onSelectRegion={handleSelectRegion}
            isLoading={isLoading}
          />
        )}

        {/* TAB 4: KATALOG & RIWAYAT GEMPA */}
        {activeTab === "history" && data && (
          <QuakeHistoryTable
            recent={recentQuakes}
            felt={feltQuakes}
            onSelectQuake={(q) => handleFocusQuakeOnMap(q)}
            onOpenShakemap={(q) => setActiveShakemapQuake(q)}
          />
        )}

        {/* TAB 5: EDUKASI & PERINGATAN DINI */}
        {activeTab === "edu" && <EducationGuide />}
      </main>

      {/* Shakemap Modal */}
      {activeShakemapQuake && (
        <ShakemapModal
          quake={activeShakemapQuake}
          onClose={() => setActiveShakemapQuake(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BMKG Monitor. Data bersumber langsung dari portal publik BMKG.</p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://www.bmkg.go.id"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline font-semibold flex items-center gap-1"
            >
              Portal Resmi BMKG <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://inatews.bmkg.go.id"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline font-semibold flex items-center gap-1"
            >
              InaTEWS BMKG <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
