import { Player, Match } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CaptainSelectionProps {
  selectedPlayers: Player[];
  captainId: number | null;
  viceCaptainId: number | null;
  onCaptainSelect: (playerId: number) => void;
  onViceCaptainSelect: (playerId: number) => void;
  onContinue: () => void;
  onBack: () => void;
  match: Match | undefined;
}

export default function CaptainSelection({
  selectedPlayers,
  captainId,
  viceCaptainId,
  onCaptainSelect,
  onViceCaptainSelect,
  onContinue,
  onBack,
  match
}: CaptainSelectionProps) {
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
  
  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-[#1f2833] text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Choose Captain & Vice Captain</h2>
            <p className="text-sm opacity-80">{match?.team1Code} vs {match?.team2Code}</p>
          </div>
        </div>
        
        <div className="flex justify-center mt-4 text-center text-sm">
          <div className="px-3">
            <p>C gets 2x points</p>
          </div>
          <div className="border-l border-white px-3">
            <p>VC gets 1.5x points</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <div className="space-y-3">
          {selectedPlayers.map((player) => {
            const isCaptain = captainId === player.id;
            const isViceCaptain = viceCaptainId === player.id;
            const teamColor = getTeamColor(player.teamCode);
            
            return (
              <div key={player.id} className="flex justify-between items-center bg-white border rounded-lg p-3 shadow-sm">
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
                    <p className="text-xs text-gray-500">{player.role} • {player.credits} cr</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full h-8 w-8 p-0",
                      isCaptain ? "bg-[#d13239] text-white border-[#d13239] hover:bg-[#b92d32] hover:text-white" : ""
                    )}
                    onClick={() => onCaptainSelect(player.id)}
                  >
                    C
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full h-8 w-8 p-0",
                      isViceCaptain ? "bg-[#1f2833] text-white border-[#1f2833] hover:bg-[#2b3441] hover:text-white" : ""
                    )}
                    onClick={() => onViceCaptainSelect(player.id)}
                  >
                    VC
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between">
        <Button 
          variant="outline"
          className="px-5"
          onClick={onBack}
        >
          BACK
        </Button>
        <Button 
          className="bg-[#d13239] hover:bg-[#b92d32] text-white px-5 py-3 rounded-full font-medium"
          onClick={onContinue}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
