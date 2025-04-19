import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto py-2 px-4 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "whitespace-nowrap px-4 py-2 font-medium", 
                activeTab === tab.id 
                  ? "text-[#d13239] border-b-2 border-[#d13239]" 
                  : "text-gray-500"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
