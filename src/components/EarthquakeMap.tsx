"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { Earthquake } from "../types/bmkg";
import { Activity, Waves, Eye, Layers, Sparkles } from "lucide-react";

interface EarthquakeMapProps {
  latest: Earthquake | null;
  recent: Earthquake[];
  felt: Earthquake[];
  selectedQuake?: Earthquake | null;
  onOpenShakemap?: (quake: Earthquake) => void;
  height?: string;
}

// Helper to parse coordinates e.g. "-0.38,123.13" or "-8.42, 109.02"
function parseCoordinates(coordStr?: string): [number, number] | null {
  if (!coordStr) return null;
  const parts = coordStr.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
}

// Controller to smoothly pan & zoom map when selectedQuake changes
function MapFocusController({ targetCoord }: { targetCoord: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoord) {
      map.flyTo(targetCoord, 7, { duration: 1.5 });
    }
  }, [targetCoord, map]);
  return null;
}

export default function EarthquakeMap({
  latest,
  recent,
  felt,
  selectedQuake,
  onOpenShakemap,
  height = "520px",
}: EarthquakeMapProps) {
  const [filterType, setFilterType] = useState<"all" | "recent" | "felt">("all");
  const [tileLayer, setTileLayer] = useState<"light" | "osm" | "dark" | "satellite">("osm");

  const latestCoord = parseCoordinates(latest?.Coordinates);
  const targetFocus = selectedQuake ? parseCoordinates(selectedQuake.Coordinates) : null;
  const defaultCenter: [number, number] = latestCoord || [-2.548926, 118.0148634]; // Pusat Indonesia

  // Custom Icon Generators using L.divIcon
  const createLatestIcon = () =>
    L.divIcon({
      className: "pulse-marker-icon",
      html: `
        <div class="pulse-ring"></div>
        <div class="pulse-core"></div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

  const createMagIcon = (mag: string, isLatest: boolean = false) => {
    const m = parseFloat(mag) || 5.0;
    const bgClass =
      m >= 6.0
        ? "bg-rose-600 text-white border-white shadow-rose-500/50"
        : m >= 5.0
        ? "bg-amber-500 text-slate-900 border-white shadow-amber-500/50"
        : "bg-emerald-600 text-white border-white shadow-emerald-500/50";

    return L.divIcon({
      className: "mag-marker-icon",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full font-black text-xs shadow-md border-2 ${bgClass} ${
        isLatest ? "ring-4 ring-red-400/50 scale-110" : ""
      }">
          ${mag}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createFeltIcon = (mag: string) =>
    L.divIcon({
      className: "felt-marker-icon",
      html: `
        <div class="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-600 text-white font-bold text-[11px] shadow-md border-2 border-white">
          ${mag}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  const tileUrls = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    light: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    },
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-md pointer-events-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === "all"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua Gempa
          </button>
          <button
            onClick={() => setFilterType("recent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === "recent"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            M 5.0+ ({recent.length})
          </button>
          <button
            onClick={() => setFilterType("felt")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterType === "felt"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Dirasakan ({felt.length})
          </button>
        </div>

        {/* Basemap Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-md pointer-events-auto">
          <button
            onClick={() => setTileLayer("osm")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              tileLayer === "osm" ? "bg-sky-100 text-sky-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jalan
          </button>
          <button
            onClick={() => setTileLayer("light")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              tileLayer === "light" ? "bg-sky-100 text-sky-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terang
          </button>
          <button
            onClick={() => setTileLayer("satellite")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              tileLayer === "satellite" ? "bg-sky-100 text-sky-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setTileLayer("dark")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              tileLayer === "dark" ? "bg-sky-100 text-sky-700 font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Gelap
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            url={tileUrls[tileLayer].url}
            attribution={tileUrls[tileLayer].attribution}
          />

          <MapFocusController targetCoord={targetFocus} />

          {/* Latest Earthquake Pulsing Circle & Marker */}
          {latest && latestCoord && (filterType === "all" || filterType === "recent") && (
            <>
              <Circle
                center={latestCoord}
                radius={40000}
                pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.2 }}
              />
              <Marker position={latestCoord} icon={createLatestIcon()}>
                <Popup>
                  <div className="p-2 space-y-2 min-w-[220px] text-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5 animate-pulse" /> Gempa Terkini
                      </span>
                      <span className="px-2 py-0.5 text-xs font-black bg-red-100 text-red-700 rounded-md border border-red-200">
                        M {latest.Magnitude}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900">{latest.Wilayah}</p>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Waktu</span>
                        <strong className="text-slate-800">{latest.Tanggal} {latest.Jam}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Kedalaman</span>
                        <strong className="text-slate-800">{latest.Kedalaman}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Koordinat</span>
                        <span className="font-mono text-slate-700">{latest.Lintang}, {latest.Bujur}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Potensi</span>
                        <span className="text-emerald-700 font-semibold">{latest.Potensi || "-"}</span>
                      </div>
                    </div>

                    {latest.Shakemap && onOpenShakemap && (
                      <button
                        onClick={() => onOpenShakemap(latest)}
                        className="w-full mt-2 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Lihat Shakemap
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* M 5.0+ Earthquakes */}
          {(filterType === "all" || filterType === "recent") &&
            recent.map((quake, idx) => {
              const coord = parseCoordinates(quake.Coordinates);
              if (!coord) return null;
              return (
                <Marker key={`recent-${idx}`} position={coord} icon={createMagIcon(quake.Magnitude)}>
                  <Popup>
                    <div className="p-2 space-y-2 min-w-[210px] text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                          <Waves className="w-3.5 h-3.5" /> Gempa M 5.0+
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                          M {quake.Magnitude}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{quake.Wilayah}</p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Waktu</span>
                          {quake.Tanggal} {quake.Jam}
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Kedalaman</span>
                          {quake.Kedalaman}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Felt Earthquakes */}
          {(filterType === "all" || filterType === "felt") &&
            felt.map((quake, idx) => {
              const coord = parseCoordinates(quake.Coordinates);
              if (!coord) return null;
              return (
                <Marker key={`felt-${idx}`} position={coord} icon={createFeltIcon(quake.Magnitude)}>
                  <Popup>
                    <div className="p-2 space-y-2 min-w-[220px] text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-cyan-700">
                          <Eye className="w-3.5 h-3.5" /> Gempa Dirasakan
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-cyan-100 text-cyan-800 rounded-md border border-cyan-200">
                          M {quake.Magnitude}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{quake.Wilayah}</p>
                      {quake.Dirasakan && (
                        <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                          <strong>Skala:</strong> {quake.Dirasakan}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Waktu</span>
                          {quake.Tanggal} {quake.Jam}
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Kedalaman</span>
                          {quake.Kedalaman}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-3 py-2 shadow-md text-[11px] flex items-center gap-4 text-slate-700 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
          <span className="text-slate-900 font-bold">Episentrum Terbaru</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="font-medium">M &ge; 5.0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block" />
          <span className="font-medium">Dirasakan</span>
        </div>
      </div>
    </div>
  );
}
