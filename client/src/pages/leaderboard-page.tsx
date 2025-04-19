import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import LeaderboardEntry from "@/components/leaderboard/leaderboard-entry";
import { Contest } from "@shared/schema";
import { Match } from "@shared/schema";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: number;
  userId: number;
  contestId: number;
  teamId: number;
  rank: number | null;
  points: number;
  prizeWon: number;
  username: string;
  teamName: string;
}

export default function LeaderboardPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const [view, setView] = useState<"live" | "winnings">("live");
  
  // Fetch contest details
  const { data: contest, isLoading: isLoadingContest } = useQuery<Contest>({
    queryKey: [`/api/contests/${contestId}`],
    enabled: !!contestId
  });
  
  // Fetch match details
  const { data: match, isLoading: isLoadingMatch } = useQuery<Match>({
    queryKey: contest ? [`/api/matches/${contest.matchId}`] : null,
    enabled: !!contest
  });
  
  // Fetch contest entries/leaderboard
  const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/contests/${contestId}/entries`],
    enabled: !!contestId
  });
  
  // Find user's entry
  const userEntry = leaderboard?.find(entry => entry.userId === user?.id);
  
  // Sort leaderboard by points (for live) or rank (for winnings)
  const sortedLeaderboard = leaderboard?.sort((a, b) => {
    if (view === "live") {
      return b.points - a.points;
    } else {
      // For winnings view, use rank if available
      if (a.rank !== null && b.rank !== null) {
        return a.rank - b.rank;
      }
      return b.points - a.points;
    }
  });
  
  if (isLoadingContest || isLoadingMatch || isLoadingLeaderboard) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }
  
  if (!contest || !match) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Contest not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-16">
      <Header />
      
      <div className="bg-[#1f2833] text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">{contest.name} Leaderboard</h2>
            <p className="text-sm opacity-80">
              {match.team1Code} vs {match.team2Code} • {leaderboard?.length || 0} Teams
            </p>
          </div>
          <div className="bg-white rounded-full flex overflow-hidden">
            <button 
              className={cn(
                "px-3 py-1 text-sm font-medium",
                view === "live" 
                  ? "bg-white text-[#1f2833]" 
                  : "bg-[#d13239] text-white"
              )}
              onClick={() => setView("live")}
            >
              Live
            </button>
            <button 
              className={cn(
                "px-3 py-1 text-sm font-medium",
                view === "winnings" 
                  ? "bg-white text-[#1f2833]" 
                  : "bg-[#d13239] text-white"
              )}
              onClick={() => setView("winnings")}
            >
              Winnings
            </button>
          </div>
        </div>
      </div>
      
      {/* User's Rank */}
      {userEntry && (
        <div className="bg-[#1f2833] bg-opacity-90 text-white p-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="bg-[#d13239] rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <Trophy className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm opacity-80">Your Rank</p>
                <p className="text-xl font-bold">
                  {userEntry.rank || "Not ranked yet"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm opacity-80">Points</p>
              <p className="text-xl font-bold text-right">{userEntry.points}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Leaderboard Table */}
      <div className="bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b text-left">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">RANK</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500">TEAM</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">POINTS</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 text-right">WINNING</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeaderboard && sortedLeaderboard.length > 0 ? (
              sortedLeaderboard.map((entry, index) => (
                <LeaderboardEntry
                  key={entry.id}
                  rank={entry.rank || index + 1}
                  username={entry.username}
                  teamName={entry.teamName}
                  points={entry.points}
                  prize={entry.prizeWon}
                  avatarUrl=""
                  isCurrentUser={entry.userId === user?.id}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
