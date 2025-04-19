import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Match } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function MyMatchesPage() {
  const [activeTab, setActiveTab] = useState("my-matches");
  const [matchesTab, setMatchesTab] = useState("upcoming");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch user's teams
  const { data: userTeams, isLoading } = useQuery({
    queryKey: ["/api/teams/user", user?.id],
    enabled: !!user,
  });
  
  // Fetch matches
  const { data: matches } = useQuery<Match[]>({
    queryKey: ["/api/matches/upcoming"],
  });
  
  // Define tabs for navigation
  const tabs = [
    { id: "home", label: "Home" },
    { id: "my-matches", label: "My Matches" },
    { id: "my-contests", label: "My Contests" },
    { id: "winners", label: "Winners" },
    { id: "more", label: "More" }
  ];
  
  const handleFindMatches = () => {
    navigate("/");
  };
  
  // Check if user has any teams
  const hasTeams = userTeams && userTeams.length > 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-16">
      <Header />
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          if (tabId === "home") navigate("/");
          else if (tabId === "my-contests") navigate("/my-contests");
          else if (tabId === "winners") navigate("/winners");
          else if (tabId === "more") navigate("/more");
          else setActiveTab(tabId);
        }} 
      />
      
      <main className="flex-grow">
        <div className="p-4 bg-white">
          <div className="flex justify-between mb-4">
            <button 
              className={`px-4 py-2 font-medium ${matchesTab === "upcoming" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setMatchesTab("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`px-4 py-2 font-medium ${matchesTab === "live" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setMatchesTab("live")}
            >
              Live
            </button>
            <button 
              className={`px-4 py-2 font-medium ${matchesTab === "completed" ? "text-[#d13239] border-b-2 border-[#d13239]" : "text-gray-500"}`}
              onClick={() => setMatchesTab("completed")}
            >
              Completed
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading...</p>
            </div>
          ) : hasTeams ? (
            <div>
              {/* Show user's teams for matches */}
              <p>Your teams will appear here</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <i className="fas fa-trophy text-4xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Upcoming Matches</h3>
              <p className="text-sm text-gray-500 mb-4">Join contests to see your upcoming matches here</p>
              <Button 
                className="bg-[#d13239] hover:bg-[#b92d32] text-white px-6 py-2 rounded-full"
                onClick={handleFindMatches}
              >
                Find Matches
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
