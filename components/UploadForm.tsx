"use client";

import { parseSaveFile } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { useState } from "react";

export default function UploadForm() {
  const [playerName, setPlayerName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function handleSubmit() {
    if (!playerName || !selectedFile) return;
    const response = await parseSaveFile(selectedFile, playerName);
    setResult(response);
  }
  return (
    <div className="min-h-screen bg-drg-dark text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-drg-orange text-center">
          DRG Dashboard
        </h1>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Tape ton pseudo"
          className="w-full px-4 py-3 mt-8 rounded bg-drg-panel border border-drg-border text-white"
        />
        <div className="mt-4 border-2 border-dashed border-drg-orange rounded-lg p-8 text-center">
          <p>Dépose ton fichier de sauvegarde ici !</p>
          <p>
            (Chemin : ..\Steam\steamapps\common\Deep Rock
            Galactic\FSD\Saved\SaveGames)
          </p>
          <input
            type="file"
            accept=".sav"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button
          type="button"
          className="mt-6 w-full py-3 rounded font-bold uppercase tracking-widest bg-drg-orange text-drg-dark"
          onClick={handleSubmit}
        >
          Analyser
        </button>
      </div>
    </div>
  );
}
