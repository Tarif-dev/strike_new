import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Volleyball, Trophy, Menu } from "lucide-react";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center px-2 py-2 z-50">
      <a 
        href="#" 
        className="flex flex-col items-center py-1" 
        onClick={(e) => {
          e.preventDefault();
          navigate("/");
        }}
      >
        <Home 
          className={cn(
            "text-xl transition-all", 
            isActive("/") 
              ? "text-[#d13239] -translate-y-1" 
              : "text-gray-500"
          )} 
        />
        <span 
          className={cn(
            "text-xs mt-1 font-medium", 
            isActive("/") ? "text-[#d13239]" : "text-gray-500"
          )}
        >
          Home
        </span>
      </a>

      <a 
        href="#" 
        className="flex flex-col items-center py-1" 
        onClick={(e) => {
          e.preventDefault();
          navigate("/my-matches");
        }}
      >
        <Volleyball 
          className={cn(
            "text-xl transition-all", 
            isActive("/my-matches") 
              ? "text-[#d13239] -translate-y-1" 
              : "text-gray-500"
          )} 
        />
        <span 
          className={cn(
            "text-xs mt-1 font-medium", 
            isActive("/my-matches") ? "text-[#d13239]" : "text-gray-500"
          )}
        >
          My Matches
        </span>
      </a>

      <a 
        href="#" 
        className="flex flex-col items-center py-1" 
        onClick={(e) => {
          e.preventDefault();
          navigate("/winners");
        }}
      >
        <Trophy 
          className={cn(
            "text-xl transition-all", 
            isActive("/winners") 
              ? "text-[#d13239] -translate-y-1" 
              : "text-gray-500"
          )} 
        />
        <span 
          className={cn(
            "text-xs mt-1 font-medium", 
            isActive("/winners") ? "text-[#d13239]" : "text-gray-500"
          )}
        >
          Winners
        </span>
      </a>

      <a 
        href="#" 
        className="flex flex-col items-center py-1" 
        onClick={(e) => {
          e.preventDefault();
          navigate("/more");
        }}
      >
        <Menu 
          className={cn(
            "text-xl transition-all", 
            isActive("/more") 
              ? "text-[#d13239] -translate-y-1" 
              : "text-gray-500"
          )} 
        />
        <span 
          className={cn(
            "text-xs mt-1 font-medium", 
            isActive("/more") ? "text-[#d13239]" : "text-gray-500"
          )}
        >
          More
        </span>
      </a>
    </nav>
  );
}
