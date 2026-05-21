// api.ts — Communication avec le backend Flask

// Ce fichier contient une seule fonction : parseSaveFile()
// Elle envoie le fichier .sav au backend et retourne les stats du dashboard.

import { ApiResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

/**
 * Envoie un fichier .sav et un pseudo au backend, retourne les stats parsées.
 *
 * @param saveFile   - Le fichier .sav sélectionné par l'utilisateur
 * @param playerName - Le pseudo entré par l'utilisateur
 * @returns          - La réponse de l'API (ok + data, ou ok + error)
 */
export async function parseSaveFile(
  saveFile: File,
  playerName: string,
): Promise<ApiResponse> {
  // FormData est le format standard pour envoyer des fichiers via HTTP
  // C'est comme remplir un formulaire papier : on ajoute chaque champ un par un
  const formData = new FormData();
  formData.append("file", saveFile);
  formData.append("player_name", playerName);

  try {
    const response = await fetch(`${BACKEND_URL}/api/parse`, {
      method: "POST",
      body: formData,
      // Pas de Content-Type manuel — fetch le calcule automatiquement pour FormData
    });

    const json: ApiResponse = await response.json();
    return json;
  } catch (error) {
    // Erreur réseau (backend inaccessible, pas de connexion, etc.)
    console.error(error);
    return {
      ok: false,
      error: "Could not reach the backend. Is it running?",
    };
  }
}
