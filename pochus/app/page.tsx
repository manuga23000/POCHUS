"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import ProductsTab from "@/components/ProductsTab";
import SalesTab from "@/components/SalesTab";
import ReportsTab from "@/components/ReportsTab";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<
    "productos" | "ventas" | "reportes"
  >("productos");

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Logo Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-30 shadow-lg">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="POCHUS Logo"
            className="w-10 h-10 rounded-lg object-cover"
          />

          {/* Logout Button */}
          <button
            className="p-2 text-gray-400 hover:text-sky-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={22} />
          </button>
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
