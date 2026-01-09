"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import ProductsTab from "@/components/ProductsTab";
import SalesTab from "@/components/SalesTab";
import ReportsTab from "@/components/ReportsTab";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<
    "productos" | "ventas" | "reportes"
  >("ventas");

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Logo Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-30 shadow-lg">
        <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-3">
          {/* Logo placeholder - Reemplazar la imagen con tu logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-sky-500 bg-clip-text text-transparent">
            POCHUS
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto">
        {currentTab === "productos" && <ProductsTab />}
        {currentTab === "ventas" && <SalesTab />}
        {currentTab === "reportes" && <ReportsTab />}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}
