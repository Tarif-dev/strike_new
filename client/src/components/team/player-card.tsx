import { useState } from "react";
import { Player } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PlayerStats from "@/components/player/player-stats";
import { InfoIcon } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onSelect: (player: Player) => void;
  onRemove: (player: Player) => void;
  showStats?: boolean;
}

export default function PlayerCard({ 
  player, 
  isSelected = false,
  onSelect,
  onRemove,
  showStats = true
}: PlayerCardProps) {
  const [statsOpen, setStatsOpen] = useState(false);
  
  const handleClick = () => {
    if (isSelected) {
      onRemove(player);
    } else {
      onSelect(player);
    }
  };
  
  const openStats = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatsOpen(true);
  };

  // Define team color based on teamCode
  const getTeamColor = (teamCode: string) => {
    switch (teamCode) {
      case "CSK": return "#f7db17";
      case "MI": return "#004ba0";
      case "RCB": return "#d13239";
      case "DC": return "#0078bc";
      case "IND": return "#0078bc";
      case "AUS": return "#ffcd00";
      case "ENG": return "#cf142b";
      case "NZ": return "#000000";
      default: return "#1f2833";
    }
  };
  
  // Define player role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "WK": return "Wicket Keeper";
      case "BAT": return "Batsman";
      case "BOWL": return "Bowler";
      case "AR": return "All Rounder";
      default: return role;
    }
  };

  const teamColor = getTeamColor(player.teamCode);

  return (
    <>
      <div className="player-card flex justify-between items-center bg-white border rounded-lg p-3 shadow-sm transition-transform hover:translate-y-[-2px] hover:shadow-md">
        <div className="flex items-center w-7/12">
          <img 
            src={player.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
            className="w-12 h-12 rounded-full mr-3" 
            alt={player.name} 
          />
          <div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">{player.name}</span>
              <span 
                className="text-white text-xs px-1 rounded"
                style={{ backgroundColor: teamColor }}
              >
                {player.teamCode}
              </span>
              {showStats && (
                <InfoIcon 
                  className="h-4 w-4 ml-1 text-gray-400 cursor-pointer hover:text-[#d13239]" 
                  onClick={openStats}
                />
              )}
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{getRoleDisplay(player.role)}</span>
              <span>•</span>
              <span>Last Match: {player.lastMatchPoints} pts</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-center">
          <p>Selected by</p>
          <p className="font-semibold">{player.selectionPercentage}%</p>
        </div>
        
        <div className="w-1/6 text-right">
          <p className="text-sm font-bold">{player.credits} cr</p>
          <button 
            className={cn(
              "mt-1 text-white text-xs px-3 py-1 rounded-full",
              isSelected ? "bg-[#dc3545]" : "bg-[#28a745]"
            )}
            onClick={handleClick}
          >
            {isSelected ? "-" : "+"}
          </button>
        </div>
      </div>
      
      {/* Player Stats Dialog */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="max-w-md p-0 max-h-[90vh] overflow-auto">
          <PlayerStats playerId={player.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
