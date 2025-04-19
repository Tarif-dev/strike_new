import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

interface Winner {
  id: number;
  userId: number;
  contestId: number;
  matchId: number;
  amount: number;
  username: string;
  fullName: string;
  contestName: string;
  matchDetails: string;
  createdAt: string;
}

export default function WinnersPage() {
  const [activeTab, setActiveTab] = useState("winners");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Fetch recent winners
  const { data: winners, isLoading } = useQuery<Winner[]>({
    queryKey: ["/api/winners"],
  });
  
  // Define tabs for navigation
  const tabs = [
    { id: "home", label: "Home" },
    { id: "my-matches", label: "My Matches" },
    { id: "my-contests", label: "My Contests" },
    { id: "winners", label: "Winners" },
    { id: "more", label: "More" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-16">
      <Header />
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          if (tabId === "home") navigate("/");
          else if (tabId === "my-matches") navigate("/my-matches");
          else if (tabId === "my-contests") navigate("/my-contests");
          else if (tabId === "more") navigate("/more");
          else setActiveTab(tabId);
        }} 
      />
      
      <main className="flex-grow">
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Recent Winners</h3>
            </div>
            
            {isLoading ? (
              <div className="p-4 text-center">
                <p>Loading winners...</p>
              </div>
            ) : winners && winners.length > 0 ? (
              <div className="p-4 space-y-4">
                {winners.map(winner => (
                  <div key={winner.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={`https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80`} 
                        className="w-12 h-12 rounded-full mr-3" 
                        alt={winner.username || winner.fullName} 
                      />
                      <div>
                        <p className="text-sm font-medium">{winner.fullName || winner.username}</p>
                        <p className="text-xs text-gray-500">
                          {winner.userId === user?.id ? "You • " : ""}
                          {winner.matchDetails}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Won</p>
                      <p className="text-lg font-bold text-[#28a745]">
                        {formatCurrency(winner.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <i className="fas fa-trophy text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Winners Yet</h3>
                <p className="text-sm text-gray-500">
                  Winners will appear here once contests are completed
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
