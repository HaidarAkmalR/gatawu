"use client";

import React, { useState, useMemo } from "react";
import { Earthquake } from "../types/bmkg";
import { Waves, Eye, Search, Filter, MapPin, Sparkles, Navigation2, Clock, Layers } from "lucide-react";

interface QuakeHistoryTableProps {
  recent: Earthquake[];
  felt: Earthquake[];
  onSelectQuake?: (quake: Earthquake) => void;
  onOpenShakemap?: (quake: Earthquake) => void;
}

export default function QuakeHistoryTable({
  recent,
  felt,
  onSelectQuake,
  onOpenShakemap,
}: QuakeHistoryTableProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "felt">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [minMagnitude, setMinMagnitude] = useState<number>(0);

  const currentList = activeTab === "recent" ? recent : felt;

  const filteredList = useMemo(() => {
    return currentList.filter((quake) => {
      const matchSearch =
        quake.Wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quake.Tanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quake.Dirasakan && quake.Dirasakan.toLowerCase().includes(searchQuery.toLowerCase()));
      const magNum = parseFloat(quake.Magnitude) || 0;
      const matchMag = magNum >= minMagnitude;
      return matchSearch && matchMag;
    });
  }, [currentList, searchQuery, minMagnitude]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/60">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-200/70 border border-slate-300 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("recent")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "recent"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Waves className="w-4 h-4" /> Gempa M 5.0+ ({recent.length})
          </button>
          <button
            onClick={() => setActiveTab("felt")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "felt"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-4 h-4" /> Gempa Dirasakan ({felt.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari wilayah gempa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-500 font-medium">Min M:</span>
            <select
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
              aria-label="Filter Magnitudo Minimum"
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value={0}>Semua</option>
              <option value={4.5}>&ge; 4.5</option>
              <option value={5.0}>&ge; 5.0</option>
              <option value={5.5}>&ge; 5.5</option>
              <option value={6.0}>&ge; 6.0</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Magnitudo</th>
              <th className="py-3.5 px-4">Waktu</th>
              <th className="py-3.5 px-4">Wilayah Episentrum</th>
              <th className="py-3.5 px-4">Kedalaman</th>
              <th className="py-3.5 px-4">Koordinat</th>
              {activeTab === "felt" && <th className="py-3.5 px-4">Skala Dirasakan</th>}
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Tidak ada data gempa yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredList.map((quake, idx) => {
                const mag = parseFloat(quake.Magnitude) || 0;
                const magColor =
                  mag >= 6.0
                    ? "bg-red-100 text-red-700 border-red-200"
                    : mag >= 5.0
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200";

                return (
                  <tr
                    key={`row-${idx}`}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectQuake && onSelectQuake(quake)}
                  >
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 font-black rounded-lg border text-xs ${magColor}`}>
                        M {quake.Magnitude}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {quake.Jam}
                      </div>
                      <div className="text-[11px] text-slate-500">{quake.Tanggal}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 min-w-[220px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <span>{quake.Wilayah}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Layers className="w-3 h-3 text-amber-600" /> {quake.Kedalaman}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {quake.Lintang}, {quake.Bujur}
                    </td>

                    {activeTab === "felt" && (
                      <td className="py-3.5 px-4 text-amber-800 font-semibold">
                        {quake.Dirasakan ? (
                          <span className="inline-block bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            {quake.Dirasakan}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectQuake && onSelectQuake(quake)}
                          className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Lihat di Peta"
                        >
                          <Navigation2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Peta</span>
                        </button>

                        {quake.Shakemap && onOpenShakemap && (
                          <button
                            onClick={() => onOpenShakemap(quake)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Lihat Shakemap"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Shakemap</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
