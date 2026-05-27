"use client";

import { parseSaveFile } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const tips = [
  "⛏ Drilling through your save file...",
  "🪨 Rock and Stone, Miner!",
  "📊 Counting your kills...",
  "🍺 Almost ready for a beer...",
  "💎 Gathering your stats...",
];

export default function UploadForm() {
  const [playerName, setPlayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const resultRef = useRef<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  // apiDone passe à true quand le backend a répondu
  const [apiDone, setApiDone] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  // Effect 1 : anime la barre de progression sur 4 secondes
  // Elle s'arrête à 100% et attend l'API si besoin
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Effect 2 : redirige vers /dashboard quand les DEUX conditions sont vraies :
  //   - l'API a répondu (apiDone)
  //   - la barre de progression est terminée (progress >= 100)
  // Analogie : deux coureurs qui doivent tous les deux franchir la ligne
  // avant qu'on ouvre la porte suivante.
  useEffect(() => {
    if (apiDone && progress >= 100) {
      sessionStorage.setItem(
        "dashboardData",
        JSON.stringify(resultRef.current),
      );
      router.push("/dashboard");
    }
  }, [apiDone, progress, router]);

  async function handleSubmit() {
    if (!playerName || !selectedFile) return;
    setIsLoading(true);
    const response = await parseSaveFile(selectedFile, playerName);
    resultRef.current = response;
    // Signaler que l'API a répondu — l'Effect 2 se chargera du redirect
    setApiDone(true);
  }

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background industrial-grid flex flex-col justify-center items-center gap-6">
        <p className="font-display text-2xl text-primary tracking-widest">
          {tips[currentTip]}
        </p>
        <div className="w-full max-w-md border-4 border-outline p-1 bg-surface-container pressed-metal">
          <div className="h-6 bg-surface-dim overflow-hidden relative">
            <div
              className="h-full bg-primary transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          PROCESSING... {progress}%
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background industrial-grid flex items-center justify-center relative overflow-hidden">
      {/* Coins en rayures danger */}
      <div className="absolute top-0 left-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute top-0 right-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute bottom-0 left-0 w-24 h-24 hazard-stripes opacity-40" />
      <div className="absolute bottom-0 right-0 w-24 h-24 hazard-stripes opacity-40" />

      {/* Panel central */}
      <div className="industrial-panel pressed-metal w-full max-w-lg mx-4">
        {/* Header du panel */}
        <div className="p-6 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            terminal
          </span>
          <h1 className="font-display text-3xl text-on-surface tracking-widest">
            SAVE-FILE SUBMISSION TERMINAL
          </h1>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Input pseudo */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              fingerprint
            </span>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ENTER OPERATIVE ID"
              className="w-full bg-surface-dim border-b-4 border-primary text-on-surface font-mono pl-10 pr-4 py-3 placeholder:text-on-surface-variant placeholder:tracking-widest focus:outline-none"
            />
          </div>

          {/* Dropzone */}
          <div className="scan-line border-2 border-dashed border-outline-variant p-8 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              architecture
            </span>
            <p className="font-mono text-sm text-on-surface-variant tracking-widest">
              DRAG &amp; DROP .SAV FILE HERE
            </p>
            <input
              type="file"
              accept=".sav"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="text-on-surface-variant font-mono text-xs"
            />
            {selectedFile && (
              <p className="text-primary font-mono text-xs tracking-widest">
                ✓ {selectedFile.name}
              </p>
            )}
          </div>
          {/* Aide pour trouver le fichier */}
          <div>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="font-mono text-xs text-on-surface-variant tracking-widest hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                {showHelp ? "expand_less" : "expand_more"}
              </span>
              OÙ TROUVER MON FICHIER ?
            </button>

            {showHelp && (
              <div className="mt-2 bg-surface-dim border-l-4 border-primary p-4 font-mono text-xs text-on-surface-variant flex flex-col gap-2">
                <p>
                  1. Clic droit sur{" "}
                  <span className="text-primary">Deep Rock Galactic</span> dans
                  Steam
                </p>
                <p>
                  2. Gérer →{" "}
                  <span className="text-primary">
                    Parcourir les fichiers locaux
                  </span>
                </p>
                <p>
                  3. Naviguer vers{" "}
                  <span className="text-primary">FSD \ Saved \ SaveGames</span>
                </p>
                <p>
                  4. Prendre le fichier{" "}
                  <span className="text-primary">.sav le plus récent</span>
                </p>
              </div>
            )}
          </div>
          {/* Avertissement */}
          <div className="bg-surface-dim border-l-4 border-error px-4 py-3">
            <p className="font-mono text-xs text-on-surface-variant italic">
              ⚠ AUTHORIZED PERSONNEL ONLY — UNAUTHORIZED ACCESS WILL BE REPORTED
              TO MANAGEMENT
            </p>
          </div>

          {/* Bouton submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="relative w-full bg-primary text-on-primary font-display text-xl tracking-widest py-3 flex items-center justify-center gap-2 overflow-hidden hover:bg-primary-fixed transition-colors"
          >
            <div className="absolute inset-0 hazard-stripes opacity-10" />
            <span className="material-symbols-outlined">cloud_upload</span>
            SUBMIT FOR ANALYSIS
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-4 border-outline">
          <p className="font-mono text-xs text-on-surface-variant tracking-widest">
            Ver: 8.4.2-STABLE | Loc: Hoxxes IV / Space Rig 17 | Enc:
            Deep-Rock-Standard
          </p>
        </div>
      </div>
    </div>
  );
}
