import { useState } from "react";
import { Match } from "@shared/schema";
import { getTimeRemaining, formatCurrency, formatPercentage } from "@/lib/utils";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MatchStats from "@/components/match/match-stats";
import { InfoIcon } from "lucide-react";

interface MatchCardProps {
  match: Match;
  filledPercentage?: number;
  prizePool: number;
}

export default function MatchCard({ match, filledPercentage = 77, prizePool }: MatchCardProps) {
  const [, navigate] = useLocation();

  const handleJoinClick = () => {
    navigate(`/contests/${match.id}`);
  };

  return (
    <div className="match-card bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Match header */}
      <div className="bg-gray-50 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span 
            className={`text-xs px-2 py-1 rounded mr-2 text-white`}
            style={{ backgroundColor: match.tagColor || "#d13239" }}
          >
            {match.tagText || "MEGA"}
          </span>
          <span className="text-sm font-medium text-gray-800">{match.matchType}</span>
        </div>
        <div className="match-countdown text-xs bg-[#1f2833] text-white px-2 py-1 rounded animate-pulse">
          <i className="far fa-clock mr-1"></i>
          <span>{getTimeRemaining(match.startTime)}</span>
        </div>
      </div>
      
      {/* Teams info */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center w-5/12">
            <img 
              src={match.team1Logo || "https://images.unsplash.com/photo-1580802527985-88e1f52b4fd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
              className="w-14 h-14 object-contain mb-2" 
              alt={`${match.team1} Logo`} 
            />
            <span className="text-sm font-medium">{match.team1Code}</span>
          </div>
          
          <div className="w-2/12 flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">VS</span>
          </div>
          
          <div className="flex flex-col items-center w-5/12">
            <img 
              src={match.team2Logo || "https://images.unsplash.com/photo-1606232999304-d34a58d1ec28?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
              className="w-14 h-14 object-contain mb-2" 
              alt={`${match.team2} Logo`} 
            />
            <span className="text-sm font-medium">{match.team2Code}</span>
          </div>
        </div>
      </div>
      
      {/* Contest info */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Prize Pool</span>
            <span className="text-base font-bold">{formatCurrency(prizePool)}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-sm">
                {formatPercentage(filledPercentage)} Filled
              </span>
            </div>
            <button 
              className="mt-1 bg-[#d13239] text-white text-sm px-4 py-1 rounded-full"
              onClick={handleJoinClick}
            >
              JOIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
