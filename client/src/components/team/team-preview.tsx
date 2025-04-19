import { useState } from "react";
import { Player, Match } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface TeamPreviewProps {
  selectedPlayers: Player[];
  captainId: number | null;
  viceCaptainId: number | null;
  match: Match | undefined;
  teamName: string;
  onTeamNameChange: (name: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export default function TeamPreview({
  selectedPlayers,
  captainId,
  viceCaptainId,
  match,
  teamName,
  onTeamNameChange,
  onSave,
  onBack
}: TeamPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Group players by role
  const wicketKeepers = selectedPlayers.filter(p => p.role === "WK");
  const batsmen = selectedPlayers.filter(p => p.role === "BAT");
  const allRounders = selectedPlayers.filter(p => p.role === "AR");
  const bowlers = selectedPlayers.filter(p => p.role === "BOWL");
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
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
  
  const renderPlayerBadge = (player: Player) => {
    const isCaptain = captainId === player.id;
    const isViceCaptain = viceCaptainId === player.id;
    const teamColor = getTeamColor(player.teamCode);
    
    return (
      <div key={player.id} className="flex flex-col items-center w-1/4 mb-4">
        <div className="relative">
          <img 
            src={player.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
            className="w-16 h-16 rounded-full mb-1 border-2"
            style={{ borderColor: teamColor }}
            alt={player.name} 
          />
          {isCaptain && (
            <div className="absolute -top-1 -right-1 bg-[#d13239] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
              C
            </div>
          )}
          {isViceCaptain && (
            <div className="absolute -top-1 -right-1 bg-[#1f2833] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white">
              VC
            </div>
          )}
        </div>
        <p className="text-xs font-medium truncate max-w-full px-1">{player.name}</p>
        <p className="text-xs text-gray-500">{player.credits} cr</p>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-full pb-20">
      <div className="bg-[#1f2833] text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Team Preview</h2>
            <p className="text-sm opacity-80">{match?.team1Code} vs {match?.team2Code}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white mb-4">
        <label htmlFor="team-name" className="text-sm font-medium mb-1 block">Team Name</label>
        <Input 
          id="team-name"
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          placeholder="Enter your team name"
          className="bg-gray-50"
        />
      </div>
      
      <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium">
        Wicket Keeper ({wicketKeepers.length})
      </div>
      <div className="flex flex-wrap bg-white p-2">
        {wicketKeepers.map(renderPlayerBadge)}
      </div>
      
      <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium">
        Batsmen ({batsmen.length})
      </div>
      <div className="flex flex-wrap bg-white p-2">
        {batsmen.map(renderPlayerBadge)}
      </div>
      
      <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium">
        All-Rounders ({allRounders.length})
      </div>
      <div className="flex flex-wrap bg-white p-2">
        {allRounders.map(renderPlayerBadge)}
      </div>
      
      <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium">
        Bowlers ({bowlers.length})
      </div>
      <div className="flex flex-wrap bg-white p-2">
        {bowlers.map(renderPlayerBadge)}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between">
        <Button 
          variant="outline"
          className="px-5"
          onClick={onBack}
          disabled={isSaving}
        >
          BACK
        </Button>
        <Button 
          className="bg-[#d13239] hover:bg-[#b92d32] text-white px-5 py-3 rounded-full font-medium"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> SAVING...
            </>
          ) : (
            'SAVE TEAM'
          )}
        </Button>
      </div>
    </div>
  );
}
