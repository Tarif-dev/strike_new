import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { Player, Match } from "@shared/schema";
import PlayerCard from "@/components/team/player-card";
import CaptainSelection from "@/components/team/captain-selection";
import TeamPreview from "@/components/team/team-preview";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const MAX_PLAYERS = 11;
const MAX_CREDITS = 100;

export default function CreateTeamPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<number | null>(null);
  const [activePlayerType, setActivePlayerType] = useState<string>("WK");
  const [step, setStep] = useState<"select" | "captain" | "preview">("select");
  const [teamName, setTeamName] = useState<string>(`${user?.username}'s Team`);

  // Fetch match details
  const { data: match, isLoading: isLoadingMatch } = useQuery<Match>({
    queryKey: [`/api/matches/${matchId}`],
    enabled: !!matchId
  });

  // Fetch players for this match
  const { data: allPlayers, isLoading: isLoadingPlayers } = useQuery<Player[]>({
    queryKey: [`/api/players/match/${matchId}`],
    enabled: !!matchId
  });

  // Filter players by type
  const filteredPlayers = allPlayers?.filter(
    (player) => player.role === activePlayerType
  ) || [];

  // Calculate team statistics
  const teamsCount: { [key: string]: number } = {};
  let usedCredits = 0;

  selectedPlayers.forEach((player) => {
    teamsCount[player.teamCode] = (teamsCount[player.teamCode] || 0) + 1;
    usedCredits += player.credits;
  });

  const remainingCredits = MAX_CREDITS - usedCredits;
  
  // Count selected players by role
  const wkCount = selectedPlayers.filter(p => p.role === "WK").length;
  const batCount = selectedPlayers.filter(p => p.role === "BAT").length;
  const arCount = selectedPlayers.filter(p => p.role === "AR").length;
  const bowlCount = selectedPlayers.filter(p => p.role === "BOWL").length;

  // Player selection rules
  const isPlayerSelectionValid = () => {
    return wkCount >= 1 && batCount >= 3 && arCount >= 1 && bowlCount >= 3 && selectedPlayers.length === MAX_PLAYERS;
  };

  // Check if player is selectable based on team and role constraints
  const isPlayerSelectable = (player: Player) => {
    // Max players from one team constraint (7)
    if (teamsCount[player.teamCode] >= 7) return false;
    
    // Role-specific constraints
    if (player.role === "WK" && wkCount >= 4) return false;
    if (player.role === "BAT" && batCount >= 6) return false;
    if (player.role === "AR" && arCount >= 4) return false;
    if (player.role === "BOWL" && bowlCount >= 6) return false;
    
    // Credit constraint
    if (player.credits > remainingCredits) return false;
    
    return true;
  };

  const handlePlayerSelect = (player: Player) => {
    if (selectedPlayers.length >= MAX_PLAYERS) {
      toast({
        title: "Team Full",
        description: "You cannot select more than 11 players",
        variant: "destructive"
      });
      return;
    }
    
    if (!isPlayerSelectable(player)) {
      let message = "Cannot select this player: ";
      if (teamsCount[player.teamCode] >= 7) {
        message += "Maximum 7 players from one team.";
      } else if (player.credits > remainingCredits) {
        message += "Not enough credits.";
      } else {
        message += "Position limit reached.";
      }
      
      toast({
        title: "Selection Error",
        description: message,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handlePlayerRemove = (player: Player) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    if (captainId === player.id) setCaptainId(null);
    if (viceCaptainId === player.id) setViceCaptainId(null);
  };

  const handleContinue = () => {
    if (selectedPlayers.length < MAX_PLAYERS) {
      toast({
        title: "Team Incomplete",
        description: `Select ${MAX_PLAYERS - selectedPlayers.length} more players`,
        variant: "destructive"
      });
      return;
    }
    
    if (!isPlayerSelectionValid()) {
      toast({
        title: "Invalid Team Composition",
        description: "Your team must have: 1-4 WK, 3-6 BAT, 1-4 AR, 3-6 BOWL",
        variant: "destructive"
      });
      return;
    }
    
    setStep("captain");
  };

  const handleCaptainConfirm = () => {
    if (!captainId || !viceCaptainId) {
      toast({
        title: "Selection Required",
        description: "Please select both Captain and Vice Captain",
        variant: "destructive"
      });
      return;
    }
    
    if (captainId === viceCaptainId) {
      toast({
        title: "Selection Error",
        description: "Captain and Vice Captain must be different players",
        variant: "destructive"
      });
      return;
    }
    
    setStep("preview");
  };

  const handleCreateTeam = async () => {
    if (!captainId || !viceCaptainId || !matchId) {
      return;
    }
    
    try {
      // Create team
      const teamResponse = await apiRequest("POST", "/api/teams", {
        name: teamName,
        matchId: parseInt(matchId),
        captainId,
        viceCaptainId
      });
      
      const team = await teamResponse.json();
      
      // Add all players to team
      const addPlayerPromises = selectedPlayers.map(player => 
        apiRequest("POST", `/api/teams/${team.id}/players`, {
          playerId: player.id
        })
      );
      
      await Promise.all(addPlayerPromises);
      
      // Success notification
      toast({
        title: "Team Created",
        description: "Your team has been created successfully",
      });
      
      // Navigate to contest selection
      navigate(`/contests/${matchId}`);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive"
      });
      console.error("Team creation error:", error);
    }
  };

  if (isLoadingMatch || isLoadingPlayers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d13239]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-20">
      <Header />
      
      {step === "select" && (
        <>
          <div className="bg-[#1f2833] text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">Create Your Team</h2>
                <p className="text-sm opacity-80">{match?.team1Code} vs {match?.team2Code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Credits Left</p>
                <p className="text-xl font-bold">{remainingCredits.toFixed(1)}</p>
              </div>
            </div>
            
            <div className="flex justify-between mt-4 text-center text-sm">
              <div>
                <p>Players</p>
                <p className="font-bold">{selectedPlayers.length}/{MAX_PLAYERS}</p>
              </div>
              <div>
                <p>{match?.team1Code}</p>
                <p className="font-bold">{teamsCount[match?.team1Code || ""] || 0}</p>
              </div>
              <div>
                <p>{match?.team2Code}</p>
                <p className="font-bold">{teamsCount[match?.team2Code || ""] || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white sticky top-14 z-40 border-b">
            <Tabs value={activePlayerType} onValueChange={setActivePlayerType}>
              <TabsList className="flex overflow-x-auto py-1 px-2 no-scrollbar">
                <TabsTrigger value="WK" className="whitespace-nowrap px-4 py-1 mx-1">
                  WK ({wkCount})
                </TabsTrigger>
                <TabsTrigger value="BAT" className="whitespace-nowrap px-4 py-1 mx-1">
                  BAT ({batCount})
                </TabsTrigger>
                <TabsTrigger value="AR" className="whitespace-nowrap px-4 py-1 mx-1">
                  AR ({arCount})
                </TabsTrigger>
                <TabsTrigger value="BOWL" className="whitespace-nowrap px-4 py-1 mx-1">
                  BOWL ({bowlCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">Showing {activePlayerType}s</p>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">Sort By:</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>Points</option>
                  <option>Credits</option>
                  <option>% Selected</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.some(p => p.id === player.id);
                
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={isSelected}
                    onSelect={handlePlayerSelect}
                    onRemove={handlePlayerRemove}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button 
              className="w-full bg-[#d13239] hover:bg-[#b92d32] text-white py-3 rounded-full font-medium"
              onClick={handleContinue}
            >
              CONTINUE
            </Button>
          </div>
        </>
      )}
      
      {step === "captain" && (
        <CaptainSelection
          selectedPlayers={selectedPlayers}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          onCaptainSelect={setCaptainId}
          onViceCaptainSelect={setViceCaptainId}
          onContinue={handleCaptainConfirm}
          onBack={() => setStep("select")}
          match={match}
        />
      )}
      
      {step === "preview" && (
        <TeamPreview
          selectedPlayers={selectedPlayers}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          match={match}
          teamName={teamName}
          onTeamNameChange={setTeamName}
          onSave={handleCreateTeam}
          onBack={() => setStep("captain")}
        />
      )}
    </div>
  );
}
