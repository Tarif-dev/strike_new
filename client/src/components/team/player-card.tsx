import { Player } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onSelect: (player: Player) => void;
  onRemove: (player: Player) => void;
}

export default function PlayerCard({ 
  player, 
  isSelected = false,
  onSelect,
  onRemove
}: PlayerCardProps) {
  const handleClick = () => {
    if (isSelected) {
      onRemove(player);
    } else {
      onSelect(player);
    }
  };

  // Define team color based on teamCode
  const getTeamColor = (teamCode: string) => {
    switch (teamCode) {
      case "CSK": return "#f7db17";
      case "MI": return "#004ba0";
      case "RCB": return "#d13239";
      case "DC": return "#0078bc";
      default: return "#1f2833";
    }
  };

  const teamColor = getTeamColor(player.teamCode);

  return (
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
          </div>
          <p className="text-xs text-gray-500">Last Match: {player.lastMatchPoints} pts</p>
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
  );
}
