"use client";

import React, { useState } from "react";
import { Shield, AlertTriangle, PhoneCall, ExternalLink, Activity, Info } from "lucide-react";

export default function EducationGuide() {
  const [activeMmi, setActiveMmi] = useState<number>(2);

  const mmiScales = [
    {
      scale: "I MMI",
      title: "Tidak Dirasakan",
      color: "border-slate-300 bg-slate-100 text-slate-700",
      desc: "Getaran tidak dirasakan kecuali dalam keadaan luar biasa oleh beberapa orang.",
    },
    {
      scale: "II MMI",
      title: "Lemah Sekali",
      color: "border-sky-300 bg-sky-50 text-sky-800",
      desc: "Getaran dirasakan oleh beberapa orang, benda-benda ringan yang digantung bergoyang.",
    },
    {
      scale: "III MMI",
      title: "Lemah",
      color: "border-emerald-300 bg-emerald-50 text-emerald-800",
      desc: "Getaran dirasakan nyata dalam rumah. Terasa getaran seakan-akan ada truk berlalu.",
    },
    {
      scale: "IV MMI",
      title: "Ringan",
      color: "border-lime-300 bg-lime-50 text-lime-800",
      desc: "Pada siang hari dirasakan oleh orang banyak dalam rumah, di luar oleh beberapa orang, gerabah pecah, jendela/pintu berderik dan dinding berbunyi.",
    },
    {
      scale: "V MMI",
      title: "Sedang",
      color: "border-amber-300 bg-amber-50 text-amber-900",
      desc: "Getaran dirasakan oleh hampir semua penduduk, orang banyak terbangun, gerabah pecah, barang-barang terpelanting, tiang-tiang dan barang besar tampak bergoyang.",
    },
    {
      scale: "VI MMI",
      title: "Kuat",
      color: "border-orange-300 bg-orange-50 text-orange-900",
      desc: "Getaran dirasakan oleh semua penduduk. Kebanyakan semua terkejut dan lari keluar, plester dinding jatuh dan cerobong asap pada pabrik rusak, kerusakan ringan.",
    },
    {
      scale: "VII MMI",
      title: "Sangat Kuat",
      color: "border-rose-300 bg-rose-50 text-rose-900",
      desc: "Tiap-tiap orang keluar rumah. Kerusakan ringan pada rumah-rumah dengan bangunan dan konstruksi yang baik. Bangunan cerobong asap pecah-pecah.",
    },
    {
      scale: "VIII+ MMI",
      title: "Parah & Merusak",
      color: "border-red-400 bg-red-100 text-red-900",
      desc: "Kerusakan ringan pada bangunan dengan konstruksi yang kuat. Retak-retak pada bangunan bertingkat, dinding dapat lepas dari rangka rumah, tanah longsor.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://www.bmkg.go.id/alerts/nowcast/id"
          target="_blank"
          rel="noreferrer"
          className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200 hover:border-amber-400 rounded-2xl flex items-start gap-4 transition-all group shadow-sm"
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Peringatan Dini</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-amber-800 flex items-center gap-1.5">
              Nowcast Cuaca Ekstrem <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </h4>
            <p className="text-xs text-slate-600 mt-1">Pantau peringatan dini hujan lebat dan angin kencang terkini.</p>
          </div>
        </a>

        <a
          href="https://inatews.bmkg.go.id/"
          target="_blank"
          rel="noreferrer"
          className="p-5 bg-gradient-to-br from-sky-50 to-blue-50/40 border border-sky-200 hover:border-sky-400 rounded-2xl flex items-start gap-4 transition-all group shadow-sm"
        >
          <div className="p-3 bg-sky-100 text-sky-700 rounded-xl group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">InaTEWS BMKG</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-sky-800 flex items-center gap-1.5">
              Sistem Peringatan Tsunami <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </h4>
            <p className="text-xs text-slate-600 mt-1">Indonesia Tsunami Early Warning System pusat informasi nasional.</p>
          </div>
        </a>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Kontak Darurat</span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">Call Center Nasional</h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
              <span className="font-bold text-slate-900">BMKG: 196</span> ·
              <span className="font-bold text-slate-900">BNPB: 117</span> ·
              <span className="font-bold text-slate-900">Darurat: 112</span>
            </div>
          </div>
        </div>
      </div>

      {/* MMI Scale Guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Panduan Skala MMI (Modified Mercalli Intensity)</h3>
              <p className="text-xs text-slate-500">Ukuran intensitas guncangan gempa bumi yang dirasakan oleh manusia dan bangunan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mb-4">
          {mmiScales.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveMmi(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${item.color} ${
                activeMmi === idx ? "ring-2 ring-sky-600 scale-105 font-bold shadow-md" : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className="text-xs font-black">{item.scale}</div>
              <div className="text-[11px] truncate mt-0.5 font-medium">{item.title}</div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-sky-800">
            <Info className="w-4 h-4 text-sky-600" /> Detail {mmiScales[activeMmi].scale} - {mmiScales[activeMmi].title}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{mmiScales[activeMmi].desc}</p>
        </div>
      </div>

      {/* Step-by-Step Mitigation Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saat Gempa */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs text-red-800">1</span>
              Saat Gempa Terjadi
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Drop, Cover, Hold on</strong>: Berlindung di bawah meja yang kokoh.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Jauhi kaca, jendela, lemari tinggi, dan benda yang dapat roboh.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Jika di luar ruangan, jauhi tiang listrik, gedung tinggi, dan jembatan penyeberangan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pasca Gempa */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-800">2</span>
              Setelah Guncangan Berhenti
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Gunakan tangga darurat, <strong>jangan gunakan lift/elevator</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Matikan kompor gas dan saklar listrik utama untuk mencegah kebakaran.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>Berkumpul di titik kumpul aman (lapangan terbuka).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Waspada Tsunami */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3 text-sky-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-xs text-sky-800">3</span>
              Zona Pesisir & Waspada Tsunami
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>Jika gempa terasa kuat di pesisir atau air laut surut drastis, <strong>segera evakuasi ke tempat tinggi</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>Tunggu konfirmasi resmi BMKG sebelum kembali ke area pesisir.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
