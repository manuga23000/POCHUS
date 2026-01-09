'use client';

import { Package, ShoppingCart, FileText } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  onTabChange: (tab: 'productos' | 'ventas' | 'reportes') => void;
  currentTab: 'productos' | 'ventas' | 'reportes';
}

export default function Navigation({ onTabChange, currentTab }: NavigationProps) {
  const tabs = [
    { id: 'productos' as const, label: 'Productos', icon: Package },
    { id: 'ventas' as const, label: 'Ventas', icon: ShoppingCart },
    { id: 'reportes' as const, label: 'Reportes', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-lg z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors duration-200
                ${isActive ? 'text-sky-400' : 'text-gray-400'}
              `}
            >
              <Icon
                size={24}
                className={isActive ? 'stroke-[2.5]' : 'stroke-2'}
              />
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
