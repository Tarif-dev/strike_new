import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Bell, UserCircle, Wallet } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: walletData } = useQuery<{ walletBalance: number, totalWinnings: number }>({
    queryKey: ["/api/wallet", user?.id],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const goToProfile = () => {
    navigate("/more");
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-[#d13239] text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1639085371834-e88da942635b?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80" 
            alt="Cricket11 Logo" 
            className="h-8 mr-2 rounded" 
          />
          <h1 className="text-xl font-['Roboto_Condensed'] font-bold">Cricket11</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
            <Wallet className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">
              ₹{walletData?.walletBalance || 0}
            </span>
          </div>

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-10">
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="p-2 text-center text-sm">
                <p>No new notifications</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:bg-opacity-10">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2 text-sm">
                <p className="font-medium">{user?.username}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={goToProfile}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
