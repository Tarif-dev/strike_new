import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import BannerSlider from "@/components/home/banner-slider";
import SportSelection from "@/components/home/sport-selection";
import MatchCard from "@/components/home/match-card";
import WinnersSlider from "@/components/home/winners-slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Match } from "@shared/schema";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeSport, setActiveSport] = useState("all");
  
  // Fetch upcoming matches
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches/upcoming"],
  });
  
  // Fetch recent winners
  const { data: winners, isLoading: isLoadingWinners } = useQuery<any[]>({
    queryKey: ["/api/winners"],
  });
  
  // Define tabs
  const tabs = [
    { id: "home", label: "Home" },
    { id: "my-matches", label: "My Matches" },
    { id: "my-contests", label: "My Contests" },
    { id: "winners", label: "Winners" },
    { id: "more", label: "More" }
  ];
  
  // Define cricket formats
  const sports = [
    { id: "all", name: "All Matches" },
    { id: "ipl", name: "IPL" },
    { id: "t20", name: "T20" },
    { id: "odi", name: "ODI" },
    { id: "test", name: "Test" }
  ];
  
  // Cricket Banner data
  const banners = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=160&q=80",
      altText: "Fantasy Cricket Banner"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1593766788306-28561585c27c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=160&q=80",
      altText: "IPL 2025 Mega Contest" 
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1664442945485-8c449d4ea710?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=160&q=80",
      altText: "Cricket World Cup Contest"
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-16">
      <Header />
      
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)} 
      />
      
      <main className="flex-grow">
        <BannerSlider banners={banners} />
        
        <SportSelection 
          sports={sports} 
          activeSport={activeSport} 
          onSportChange={(sportId) => setActiveSport(sportId)}
        />
        
        {/* Featured Cricket Matches */}
        <div className="py-3 px-4">
          <h2 className="text-lg font-['Roboto_Condensed'] font-bold mb-3">Featured Cricket Matches</h2>
          
          {isLoadingMatches ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 p-3">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-14 w-14 rounded-full" />
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {matches?.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  prizePool={100000000} // 10 crores
                  filledPercentage={77}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Winners Section */}
        {isLoadingWinners ? (
          <div className="py-3 px-4">
            <h2 className="text-lg font-['Roboto_Condensed'] font-bold mb-3">Recent Winners</h2>
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-3 min-w-[200px]">
                    <div className="flex items-center mb-2">
                      <Skeleton className="w-10 h-10 rounded-full mr-2" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="h-14 w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <WinnersSlider winners={winners?.map(winner => ({
            id: winner.id,
            username: winner.username,
            fullName: winner.fullName,
            location: "Mumbai", // This would come from the API
            amount: winner.amount,
            avatar: ""
          })) || []} />
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
}
