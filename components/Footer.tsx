"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  '"ROCK AND STONE!"',
  '"FOR KARL!"',
  '"WE DIG IT."',
  '"MANAGEMENT APPROVES OF YOUR DEDICATION."',
  '"LEAF LOVER."',
  '"ANOTHER GLORIOUS DAY IN THE CORPS."',
];

export default function Footer() {
  const [time, setTime] = useState("");
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
  );
  const [depth] = useState(() => Math.floor(Math.random() * 3000) + 500);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("fr-FR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const playerName =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("playerName") ?? "OPERATIVE")
      : "OPERATIVE";

  return (
    <footer className="font-mono text-xs tracking-widest bg-surface-container border-t border-drg-border">
      {/* Bande haute */}
      <div className="flex justify-between px-4 py-1 border-b border-drg-border text-on-surface-variant">
        <span>
          TERMINAL_ID: {playerName.toUpperCase()}&nbsp;&nbsp;·&nbsp;&nbsp;OS:
          DRG_MAINFRAME_V4.2
        </span>
        <span className="text-drg-orange">{time}</span>
      </div>

      {/* Bande milieu */}
      <div className="flex justify-between px-4 py-1 border-b border-drg-border text-on-surface-variant">
        <span>
          SYSTEM STATUS: OPTIMAL&nbsp;&nbsp;·&nbsp;&nbsp;DEPTH: {depth} M
        </span>
        <span className="text-drg-orange">{quote}</span>
      </div>

      {/* Bande basse */}
      <div className="flex justify-between px-4 py-1 text-on-surface-variant opacity-60">
        <span>
          © DEEP ROCK GALACTIC — PROPERTY OF MANAGEMENT. SURVIVAL NOT
          GUARANTEED.
        </span>
        <span className="cursor-default">
          SAFETY WAIVERS&nbsp;&nbsp;·&nbsp;&nbsp;SURVIVOR
          CLAIMS&nbsp;&nbsp;·&nbsp;&nbsp;KARL MEMORIAL FUND
        </span>
      </div>
    </footer>
  );
}
