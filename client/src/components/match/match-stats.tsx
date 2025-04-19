import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Match } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ThermometerSun, Cloud, Droplets } from "lucide-react";

interface MatchStatsProps {
  matchId: number;
  onClose?: () => void;
}

type MatchStats = {
  match: Match;
  matchStats: {
    matchStatus: string;
    team1Score: string;
    team2Score: string;
    currentRunRate?: string | null;
    requiredRunRate?: string | null;
    venue: string;
    weatherConditions: string;
    pitchReport: string;
  };
};

export default function MatchStats({ matchId, onClose }: MatchStatsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: matchStatsData, isLoading } = useQuery<MatchStats>({
    queryKey: [`/api/cricket/match/${matchId}/stats`],
    enabled: !!matchId
  });
  
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#d13239] mb-2" />
        <p className="text-sm text-gray-500">Loading match stats...</p>
      </div>
    );
  }
  
  if (!matchStatsData) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">No match stats available</p>
      </div>
    );
  }
  
  const { match, matchStats } = matchStatsData;
  
  // Weather icon based on conditions
  const getWeatherIcon = (conditions: string) => {
    switch (conditions.toLowerCase()) {
      case "sunny":
      case "hot and humid":
        return <ThermometerSun className="h-5 w-5 text-orange-500" />;
      case "cloudy":
        return <Cloud className="h-5 w-5 text-gray-500" />;
      case "light rain":
        return <Droplets className="h-5 w-5 text-blue-500" />;
      default:
        return <ThermometerSun className="h-5 w-5 text-orange-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Match Header */}
      <div className="bg-[#1f2833] text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <img 
              src={match.team1Logo || "https://images.unsplash.com/photo-1580802527985-88e1f52b4fd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
              alt={match.team1}
              className="w-12 h-12 rounded-full mb-1"
            />
            <p className="text-sm font-medium">{match.team1Code}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-xs bg-[#d13239] px-2 py-0.5 rounded-full mb-1">
              {matchStats.matchStatus}
            </div>
            <p className="text-xl font-bold">VS</p>
            <p className="text-xs">{match.matchType}</p>
          </div>
          
          <div className="flex flex-col items-center">
            <img 
              src={match.team2Logo || "https://images.unsplash.com/photo-1606232999304-d34a58d1ec28?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"} 
              alt={match.team2}
              className="w-12 h-12 rounded-full mb-1"
            />
            <p className="text-sm font-medium">{match.team2Code}</p>
          </div>
        </div>
      </div>
      
      {/* Score Section */}
      <div className="p-4 bg-gray-50 flex justify-between">
        <div className="text-center w-5/12">
          <p className="text-sm font-bold">{matchStats.team1Score}</p>
          <p className="text-xs text-gray-500">{match.team1}</p>
        </div>
        
        <div className="text-center">
          <p className="text-xs font-medium text-gray-500">Score</p>
        </div>
        
        <div className="text-center w-5/12">
          <p className="text-sm font-bold">{matchStats.team2Score}</p>
          <p className="text-xs text-gray-500">{match.team2}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="venue">Venue</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4">
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Match Details</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Format</p>
                <p className="text-sm font-bold">{match.matchType}</p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Status</p>
                <p className="text-sm font-bold">{matchStats.matchStatus}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">Date</p>
                <p className="text-sm font-bold">{new Date(match.startTime).toLocaleDateString()}</p>
              </div>
            </div>
            
            {match.isLive && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Live Score</p>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm">Current RR</p>
                  <p className="text-sm font-bold">{matchStats.currentRunRate}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm">Required RR</p>
                  <p className="text-sm font-bold">{matchStats.requiredRunRate}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Venue Tab */}
        <TabsContent value="venue" className="p-4">
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Venue Information</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Stadium</p>
                <p className="text-sm font-bold">{matchStats.venue}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">City</p>
                <p className="text-sm font-bold">{matchStats.venue}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Conditions</p>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Weather</p>
                <div className="flex items-center">
                  {getWeatherIcon(matchStats.weatherConditions)}
                  <p className="text-sm font-bold ml-1">{matchStats.weatherConditions}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm">Pitch</p>
                <p className="text-sm font-bold">{matchStats.pitchReport}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics" className="p-4">
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Team Comparison</p>
              
              <div className="mt-3 mb-4">
                <p className="text-xs mb-1">Win Probability</p>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-[#d13239]" 
                    style={{ width: `${Math.floor(Math.random() * 80) + 20}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs">{match.team1Code}</p>
                  <p className="text-xs">{match.team2Code}</p>
                </div>
              </div>
              
              <div className="mt-3 mb-4">
                <p className="text-xs mb-1">Head to Head</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-500">{match.team1Code} Wins</p>
                    <p className="text-sm font-bold">{Math.floor(Math.random() * 10) + 2}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <p className="text-xs text-gray-500">Draw</p>
                    <p className="text-sm font-bold">{Math.floor(Math.random() * 3)}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-xs text-gray-500">{match.team2Code} Wins</p>
                    <p className="text-sm font-bold">{Math.floor(Math.random() * 10) + 2}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Recent Form</p>
              
              <div className="mt-2">
                <div className="flex items-center mb-3">
                  <p className="text-xs mr-2">{match.team1Code}</p>
                  <div className="flex">
                    {["W", "L", "W", "W", "L"].map((result, i) => (
                      <span 
                        key={i} 
                        className={`w-5 h-5 flex items-center justify-center text-xs rounded-full text-white mx-0.5 ${
                          result === "W" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <p className="text-xs mr-2">{match.team2Code}</p>
                  <div className="flex">
                    {["L", "W", "W", "L", "W"].map((result, i) => (
                      <span 
                        key={i} 
                        className={`w-5 h-5 flex items-center justify-center text-xs rounded-full text-white mx-0.5 ${
                          result === "W" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}