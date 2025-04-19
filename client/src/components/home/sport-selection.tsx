import { useState } from "react";
import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  name: string;
  active?: boolean;
}

interface SportSelectionProps {
  sports: Sport[];
  activeSport: string;
  onSportChange: (sportId: string) => void;
}

export default function SportSelection({ 
  sports, 
  activeSport, 
  onSportChange 
}: SportSelectionProps) {
  return (
    <div className="bg-white sticky top-14 z-40 shadow-sm">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto py-3 px-4 no-scrollbar">
          {sports.map((sport) => (
            <button
              key={sport.id}
              className={cn(
                "whitespace-nowrap px-4 py-1 font-medium border rounded-full mx-1",
                activeSport === sport.id
                  ? "text-[#d13239] border-[#d13239]"
                  : "text-gray-500 border-gray-300"
              )}
              onClick={() => onSportChange(sport.id)}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
