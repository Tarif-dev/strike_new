import { Contest } from "@shared/schema";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useLocation } from "wouter";

interface ContestCardProps {
  contest: Contest;
  matchId: number;
}

export default function ContestCard({ contest, matchId }: ContestCardProps) {
  const [, navigate] = useLocation();

  const filledPercentage = (contest.filledSpots / contest.totalSpots) * 100;
  const spotsLeft = contest.totalSpots - contest.filledSpots;

  const handleJoinClick = () => {
    // Navigate to team selection if no teams, otherwise join directly
    navigate(`/contests/${matchId}?contestId=${contest.id}`);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-3 text-white" style={{ backgroundColor: contest.headerColor }}>
        <div className="flex justify-between items-center">
          <span className="font-bold">{contest.name}</span>
          <span className="text-sm">{formatCurrency(contest.prizePool)} Prize Pool</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Entry</p>
            <p className="text-lg font-bold">₹{contest.entryFee}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Spots</p>
            <p className="font-medium">{contest.totalSpots.toLocaleString()} spots</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-[#28a745] h-2 rounded-full" 
            style={{ width: `${filledPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>{formatPercentage(filledPercentage)} Filled</span>
          <span>{spotsLeft.toLocaleString()} spots left</span>
        </div>
        
        <div className="flex justify-between items-center border-t pt-3">
          <div>
            <p className="text-xs text-gray-600">1st Prize</p>
            <p className="text-base font-bold">{formatCurrency(contest.firstPrize)}</p>
          </div>
          <div>
            {contest.isGuaranteed && (
              <p className="text-xs text-gray-600">Guaranteed</p>
            )}
          </div>
          <button 
            className="bg-[#d13239] text-white px-6 py-2 rounded-full"
            onClick={handleJoinClick}
          >
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
}
