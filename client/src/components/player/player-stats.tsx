import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface PlayerStatsProps {
  playerId: number;
  onClose?: () => void;
}

type PlayerStats = {
  player: Player;
  stats: any;
};

export default function PlayerStats({ playerId, onClose }: PlayerStatsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: playerStats, isLoading } = useQuery<PlayerStats>({
    queryKey: [`/api/cricket/player/${playerId}/stats`],
    enabled: !!playerId
  });
  
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#d13239] mb-2" />
        <p className="text-sm text-gray-500">Loading player stats...</p>
      </div>
    );
  }
  
  if (!playerStats) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">No player stats available</p>
      </div>
    );
  }
  
  const { player, stats } = playerStats;
  
  // Helper function to get the role color for role badge
  const getRoleColor = (role: string) => {
    switch (role) {
      case "WK": return "bg-purple-600";
      case "BAT": return "bg-blue-600";
      case "BOWL": return "bg-orange-600";
      case "AR": return "bg-green-600";
      default: return "bg-gray-600";
    }
  };
  
  // Helper function to get role display text
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "WK": return "Wicket Keeper";
      case "BAT": return "Batsman";
      case "BOWL": return "Bowler";
      case "AR": return "All Rounder";
      default: return role;
    }
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Player Header */}
      <div 
        className="p-4 text-white" 
        style={{ backgroundColor: getTeamColor(player.teamCode) }}
      >
        <div className="flex items-center">
          <img 
            src={player.imageUrl || "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
            alt={player.name}
            className="w-16 h-16 rounded-full border-2 border-white mr-4"
          />
          <div>
            <h2 className="text-xl font-bold">{player.name}</h2>
            <div className="flex items-center mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(player.role)} text-white mr-2`}>
                {getRoleDisplay(player.role)}
              </span>
              <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                {player.teamCode}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Credits</p>
              <p className="text-lg font-bold">{player.credits}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Selected By</p>
              <p className="text-lg font-bold">{player.selectionPercentage}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Last Match</p>
              <p className="text-lg font-bold">{player.lastMatchPoints} pts</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500">Matches</p>
              <p className="text-lg font-bold">{stats.matches || stats.battingInnings || 0}</p>
            </div>
          </div>
        </TabsContent>
        
        {/* Stats Tab */}
        <TabsContent value="stats" className="p-4">
          {player.role === "BAT" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Career</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Matches</p>
                  <p className="text-sm font-bold">{stats.matches}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Innings</p>
                  <p className="text-sm font-bold">{stats.innings}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Batting</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Runs</p>
                  <p className="text-sm font-bold">{stats.runs}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Average</p>
                  <p className="text-sm font-bold">{stats.average}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Strike Rate</p>
                  <p className="text-sm font-bold">{stats.strikeRate}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Hundreds</p>
                  <p className="text-sm font-bold">{stats.hundreds}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Fifties</p>
                  <p className="text-sm font-bold">{stats.fifties}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Highest Score</p>
                  <p className="text-sm font-bold">{stats.highestScore}</p>
                </div>
              </div>
            </div>
          )}
          
          {player.role === "BOWL" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Career</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Matches</p>
                  <p className="text-sm font-bold">{stats.matches}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Innings</p>
                  <p className="text-sm font-bold">{stats.innings}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Bowling</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Wickets</p>
                  <p className="text-sm font-bold">{stats.wickets}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Economy</p>
                  <p className="text-sm font-bold">{stats.economy}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Average</p>
                  <p className="text-sm font-bold">{stats.average}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">5 Wicket Hauls</p>
                  <p className="text-sm font-bold">{stats.fiveWickets}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Best Bowling</p>
                  <p className="text-sm font-bold">{stats.bestBowling}</p>
                </div>
              </div>
            </div>
          )}
          
          {player.role === "AR" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Batting</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Innings</p>
                  <p className="text-sm font-bold">{stats.battingInnings}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Runs</p>
                  <p className="text-sm font-bold">{stats.runs}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Average</p>
                  <p className="text-sm font-bold">{stats.battingAverage}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Strike Rate</p>
                  <p className="text-sm font-bold">{stats.battingStrikeRate}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Bowling</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Innings</p>
                  <p className="text-sm font-bold">{stats.bowlingInnings}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Wickets</p>
                  <p className="text-sm font-bold">{stats.wickets}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Economy</p>
                  <p className="text-sm font-bold">{stats.economy}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Average</p>
                  <p className="text-sm font-bold">{stats.bowlingAverage}</p>
                </div>
              </div>
            </div>
          )}
          
          {player.role === "WK" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Career</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Matches</p>
                  <p className="text-sm font-bold">{stats.matches}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Innings</p>
                  <p className="text-sm font-bold">{stats.innings}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Batting</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Runs</p>
                  <p className="text-sm font-bold">{stats.runs}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Average</p>
                  <p className="text-sm font-bold">{stats.average}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Strike Rate</p>
                  <p className="text-sm font-bold">{stats.strikeRate}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Wicket Keeping</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Dismissals</p>
                  <p className="text-sm font-bold">{stats.dismissals}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Catches</p>
                  <p className="text-sm font-bold">{stats.catches}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Stumpings</p>
                  <p className="text-sm font-bold">{stats.stumpings}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Form Tab */}
        <TabsContent value="form" className="p-4">
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-500 mb-3">Fantasy Points (Last 5 Matches)</p>
            
            <div className="flex justify-between items-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => {
                const randomValue = Math.floor(Math.random() * 100);
                const height = 20 + randomValue;
                
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-[#d13239] rounded-t"
                      style={{ height: `${height}px` }}
                    ></div>
                    <p className="text-xs mt-1">Match {i+1}</p>
                    <p className="text-xs font-bold">{randomValue}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Recent Form</p>
            
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => {
                const randomScore = player.role === "BAT" || player.role === "WK" ? 
                  `${Math.floor(Math.random() * 100) + 10} (${Math.floor(Math.random() * 40) + 10})` :
                  `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 30) + 10}`;
                  
                const opponents = ["CSK", "MI", "RCB", "DC", "IND", "AUS", "ENG", "NZ"]
                  .filter(team => team !== player.teamCode)[Math.floor(Math.random() * 7)];
                  
                return (
                  <div key={i} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="text-sm font-medium">vs {opponents}</p>
                      <p className="text-xs text-gray-500">{new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{randomScore}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 100)} pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}