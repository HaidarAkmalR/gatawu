"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Activity, MapPin, Clock, Layers, AlertCircle } from "lucide-react";
import { Earthquake } from "../types/bmkg";

interface ShakemapModalProps {
  quake: Earthquake | null;
  onClose: () => void;
}

export default function ShakemapModal({ quake, onClose }: ShakemapModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!quake) return null;

  const shakemapUrl = quake.Shakemap
    ? `https://data.bmkg.go.id/DataMKG/TEWS/${quake.Shakemap}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative z-[100000] w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg border border-red-200">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Peta Guncangan Gempa (Shakemap)
                <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full border border-red-200">
                  M {quake.Magnitude}
                </span>
              </h3>
              <p className="text-xs text-slate-500">Badan Meteorologi, Klimatologi, dan Geofisika</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> Waktu Gempa
              </span>
              <p className="text-sm font-bold text-slate-900">{quake.Tanggal}</p>
              <p className="text-xs text-slate-600">{quake.Jam}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-amber-600" /> Kedalaman
              </span>
              <p className="text-sm font-bold text-slate-900">{quake.Kedalaman}</p>
              <p className="text-xs text-slate-500">Hiposentrum</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Koordinat
              </span>
              <p className="text-sm font-bold text-slate-900">{quake.Lintang}</p>
              <p className="text-xs text-slate-600">{quake.Bujur}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Magnitudo
              </span>
              <p className="text-lg font-black text-red-600">{quake.Magnitude}</p>
              <p className="text-xs text-slate-500">Skala Richter</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Wilayah Episentrum</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{quake.Wilayah}</p>
              </div>
            </div>
            {quake.Potensi && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    quake.Potensi.toLowerCase().includes("tidak")
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {quake.Potensi}
                </span>
              </div>
            )}
            {quake.Dirasakan && (
              <div className="mt-2 text-xs text-amber-900 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <strong>Dirasakan (Skala MMI):</strong> {quake.Dirasakan}
              </div>
            )}
          </div>

          {/* Shakemap Image Section */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
            {shakemapUrl ? (
              <div className="relative group max-w-full flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shakemapUrl}
                  alt={`Shakemap Gempa ${quake.Wilayah}`}
                  className="max-h-[380px] w-auto object-contain rounded-lg border border-slate-300 shadow-md"
                />
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Shakemap belum tersedia untuk parameter gempa ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span>Sumber data resmi TEWS BMKG</span>
          {shakemapUrl && (
            <a
              href={shakemapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg border border-sky-200 transition-colors shadow-2xs"
            >
              Buka Gambar Asli <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
