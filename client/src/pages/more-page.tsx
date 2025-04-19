import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import TabNavigation from "@/components/layout/tab-navigation";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { 
  Wallet, 
  Trophy, 
  Gift, 
  Headset, 
  User, 
  History, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function MorePage() {
  const [activeTab, setActiveTab] = useState("more");
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Fetch wallet balance
  const { data: walletData } = useQuery<{ walletBalance: number, totalWinnings: number }>({
    queryKey: ["/api/wallet", user?.id],
    enabled: !!user,
  });
  
  // Define tabs for navigation
  const tabs = [
    { id: "home", label: "Home" },
    { id: "my-matches", label: "My Matches" },
    { id: "my-contests", label: "My Contests" },
    { id: "winners", label: "Winners" },
    { id: "more", label: "More" }
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleNavigation = (path: string) => {
    if (path === "profile") {
      toast({
        title: "Profile",
        description: "Profile page is not implemented yet"
      });
    } else if (path === "transactions") {
      toast({
        title: "Transactions",
        description: "Transaction history is not implemented yet"
      });
    } else if (path === "settings") {
      toast({
        title: "Settings",
        description: "Settings page is not implemented yet"
      });
    }
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
          else if (tabId === "my-contests") navigate("/my-contests");
          else if (tabId === "winners") navigate("/winners");
          else setActiveTab(tabId);
        }} 
      />
      
      <main className="flex-grow p-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-[#d13239] bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Wallet className="text-[#d13239]" />
            </div>
            <p className="font-medium">My Balance</p>
            <p className="text-lg font-bold">₹{walletData?.walletBalance || 0}</p>
          </Card>
          
          <Card className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-[#28a745] bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Trophy className="text-[#28a745]" />
            </div>
            <p className="font-medium">Total Winnings</p>
            <p className="text-lg font-bold">₹{walletData?.totalWinnings || 0}</p>
          </Card>
          
          <Card className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-purple-500 bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Gift className="text-purple-500" />
            </div>
            <p className="font-medium">Refer & Earn</p>
          </Card>
          
          <Card className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="bg-blue-500 bg-opacity-10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <Headset className="text-blue-500" />
            </div>
            <p className="font-medium">Support</p>
          </Card>
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Account</h3>
          </div>
          <div>
            <a 
              href="#" 
              className="flex items-center justify-between p-4 border-b"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("profile");
              }}
            >
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" />
                <span>My Profile</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </a>
            
            <a 
              href="#" 
              className="flex items-center justify-between p-4 border-b"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("transactions");
              }}
            >
              <div className="flex items-center">
                <History className="text-gray-400 mr-3" />
                <span>Transaction History</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </a>
            
            <a 
              href="#" 
              className="flex items-center justify-between p-4 border-b"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("settings");
              }}
            >
              <div className="flex items-center">
                <Settings className="text-gray-400 mr-3" />
                <span>Settings</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </a>
            
            <a 
              href="#" 
              className="flex items-center justify-between p-4"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <div className="flex items-center">
                <LogOut className="text-gray-400 mr-3" />
                <span>Logout</span>
              </div>
              <ChevronRight className="text-gray-400" />
            </a>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
