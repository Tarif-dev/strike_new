import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, User, Calendar } from "lucide-react";
import { Match, Contest } from "@shared/schema";
import { getTimeRemaining, formatCurrency } from "@/lib/utils";

// Composite type for joined contests with match details
interface JoinedContest extends Contest {
  match?: Match;
  teamCount?: number;
}

export default function MyContestsPage() {
  const [activeTab, setActiveTab] = useState("my-contests");
  const [contestsTab, setContestsTab] = useState("upcoming");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch user's contests
  const { data: userContests, isLoading: isLoadingContests } = useQuery<JoinedContest[]>({
    queryKey: ["/api/contests/user"],
    enabled: !!user,
  });
  
  // Fetch matches for each contest
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
    enabled: !!userContests && userContests.length > 0,
  });
  
  // Link contests with their matches
  const contestsWithMatches = userContests?.map(contest => {
    const match = matches?.find(m => m.id === contest.matchId);
    return {
      ...contest,
      match,
      teamCount: 1, // This would ideally come from the API
    };
  });
  
  // Filter contests based on selected tab
  const filteredContests = contestsWithMatches?.filter(contest => {
    if (!contest.match) return false;
    
    const matchDate = new Date(contest.match.startTime);
    const now = new Date();
    
    if (contestsTab === "upcoming" && !contest.match.isLive && !contest.match.isCompleted) {
      return matchDate > now;
    }
    
    if (contestsTab === "live" && contest.match.isLive) {
      return true;
    }
    
    if (contestsTab === "completed" && contest.match.isCompleted) {
      return true;
    }
    
    return false;
  });
  
  // Define tabs for navigation
  const tabs = [
    { id: "home", label: "Home" },
    { id: "my-matches", label: "My Matches" },
    { id: "my-contests", label: "My Contests" },
    { id: "winners", label: "Winners" },
    { id: "more", label: "More" }
  ];
  
  const handleFindContests = () => {
    navigate("/");
  };
  
  const handleViewLeaderboard = (contestId: number) => {
    navigate(`/leaderboard/${contestId}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-16">
      <Header />
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          if (tabId === "home") navigate("/");
          else if (tabId === "my-matches") navigate("/my-matches");
          else if (tabId === "winners") navigate("/winners");
          else if (tabId === "more") navigate("/more");
          else setActiveTab(tabId);
        }} 
      />
      
      <main className="flex-grow">
        <div className="p-4 bg-white">
          <div className="flex justify-between mb-4">
            <button 
              className={`px-4 py-2 font-medium ${contestsTab === "upcoming" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setContestsTab("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`px-4 py-2 font-medium ${contestsTab === "live" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setContestsTab("live")}
            >
              Live
            </button>
            <button 
              className={`px-4 py-2 font-medium ${contestsTab === "completed" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setContestsTab("completed")}
            >
              Completed
            </button>
          </div>
          
          {isLoadingContests || isLoadingMatches ? (
            <div className="text-center py-8">
              <p>Loading contests...</p>
            </div>
          ) : filteredContests && filteredContests.length > 0 ? (
            <div className="space-y-4">
              {filteredContests.map(contest => (
                <div key={contest.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  {/* Contest Header */}
                  <div 
                    className="p-3 text-white"
                    style={{ backgroundColor: contest.headerColor || "#d13239" }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{contest.name}</span>
                      <span className="text-sm">
                        {contest.match ? getTimeRemaining(contest.match.startTime) : 'Unknown time'} left
                      </span>
                    </div>
                  </div>
                  
                  {/* Match Info */}
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          {contest.match?.team1Code} vs {contest.match?.team2Code}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm">{contest.teamCount} Team</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contest Details */}
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Entry</p>
                        <p className="text-base font-bold">₹{contest.entryFee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Prize Pool</p>
                        <p className="text-base font-bold">{formatCurrency(contest.prizePool)}</p>
                      </div>
                      <Button 
                        variant="default"
                        className="bg-[#d13239] hover:bg-[#b92d32] text-white"
                        onClick={() => handleViewLeaderboard(contest.id)}
                      >
                        <Trophy className="h-4 w-4 mr-1" />
                        LEADERBOARD
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Trophy className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Contests</h3>
              <p className="text-sm text-gray-500 mb-4">Join contests to see them here</p>
              <Button 
                className="bg-[#d13239] hover:bg-[#b92d32] text-white px-6 py-2 rounded-full"
                onClick={handleFindContests}
              >
                Find Contests
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
