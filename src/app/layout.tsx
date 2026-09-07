import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
export const metadata: Metadata = { title: "BMKG Monitor | Cuaca & Gempa Indonesia", description: "Dashboard informasi cuaca dan gempa bumi dari BMKG." };
export default function RootLayout({ children }: LayoutProps<"/">) { return <html lang="id" className={geist.variable}><body>{children}</body></html>; }
