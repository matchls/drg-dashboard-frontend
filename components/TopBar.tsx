"use client";
import Link from "next/link";
import QuoteTypewriter from "@/components/QuoteTypewriter";

export default function TopBar() {
  return (
    <header className="h-14 bg-surface-container-high border-b-4 border-outline flex items-center px-6 gap-4">
      {/* Citation animée — prend tout l'espace central */}
      <QuoteTypewriter />

      {/* Settings — fixe à droite */}
      <div className="shrink-0">
        <Link
          href="/options"
          className="text-on-surface-variant hover:text-drg-orange transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </header>
  );
}
