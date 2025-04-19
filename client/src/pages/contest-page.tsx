import { useState, useEffect } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContestCard from "@/components/contest/contest-card";
import { Match, Contest, Team } from "@shared/schema";
import { getTimeRemaining } from "@/lib/utils";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function ContestPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const contestIdParam = params.get("contestId");
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedContestId, setSelectedContestId] = useState<number | null>(
    contestIdParam ? parseInt(contestIdParam) : null
  );
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState("all");
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  
  // Fetch match details
  const { data: match, isLoading: isLoadingMatch } = useQuery<Match>({
    queryKey: [`/api/matches/${matchId}`],
    enabled: !!matchId
  });
  
  // Fetch contests for this match
  const { data: contests, isLoading: isLoadingContests } = useQuery<Contest[]>({
    queryKey: [`/api/contests/match/${matchId}`],
    enabled: !!matchId
  });
  
  // Fetch user's teams for this match
  const { data: userTeams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: [`/api/teams/match/${matchId}`],
    enabled: !!matchId && !!user
  });
  
  // Join contest mutation
  const joinContestMutation = useMutation({
    mutationFn: async ({ contestId, teamId }: { contestId: number, teamId: number }) => {
      const res = await apiRequest("POST", `/api/contests/${contestId}/join`, { teamId });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contest Joined",
        description: "You have successfully joined the contest",
      });
      // Refresh contests data
      queryClient.invalidateQueries({ queryKey: [`/api/contests/match/${matchId}`] });
      // Close dialog
      setShowTeamDialog(false);
      setSelectedContestId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join Contest",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Filter contests based on selected tab
  const filteredContests = contests?.filter(contest => {
    if (filterTab === "all") return true;
    if (filterTab === "low" && contest.entryFee >= 1 && contest.entryFee <= 49) return true;
    if (filterTab === "medium" && contest.entryFee >= 50 && contest.entryFee <= 500) return true;
    if (filterTab === "high" && contest.entryFee > 500) return true;
    return false;
  });
  
  const handleJoinContest = (contestId: number) => {
    if (!userTeams || userTeams.length === 0) {
      // No teams, create one first
      navigate(`/create-team/${matchId}`);
      return;
    }
    
    setSelectedContestId(contestId);
    setShowTeamDialog(true);
  };
  
  const confirmJoin = () => {
    if (!selectedContestId || !selectedTeamId) {
      toast({
        title: "Selection Required",
        description: "Please select a team to continue",
        variant: "destructive"
      });
      return;
    }
    
    joinContestMutation.mutate({
      contestId: selectedContestId,
      teamId: selectedTeamId
    });
  };
  
  const handleCreateTeam = () => {
    navigate(`/create-team/${matchId}`);
  };
  
  const handleViewMyContests = () => {
    navigate('/my-contests');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pb-20">
      <Header />
      
      <div className="bg-[#1f2833] text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">{match?.team1Code} vs {match?.team2Code}</h2>
            <p className="text-sm opacity-80">{match ? getTimeRemaining(match.startTime) : ''} left</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full border-none text-white hover:bg-white hover:bg-opacity-30"
            onClick={handleViewMyContests}
          >
            <Trophy className="h-4 w-4 mr-1" /> My Contests
          </Button>
        </div>
      </div>
      
      <div className="bg-white sticky top-14 z-40 border-b">
        <Tabs value={filterTab} onValueChange={setFilterTab}>
          <TabsList className="flex overflow-x-auto py-3 px-4 no-scrollbar">
            <TabsTrigger value="all" className="whitespace-nowrap px-4 py-1 mx-1">
              All
            </TabsTrigger>
            <TabsTrigger value="low" className="whitespace-nowrap px-4 py-1 mx-1">
              ₹1-₹49
            </TabsTrigger>
            <TabsTrigger value="medium" className="whitespace-nowrap px-4 py-1 mx-1">
              ₹50-₹500
            </TabsTrigger>
            <TabsTrigger value="high" className="whitespace-nowrap px-4 py-1 mx-1">
              ₹501+
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-4 space-y-4">
        {isLoadingContests ? (
          <div className="text-center py-8">
            <p>Loading contests...</p>
          </div>
        ) : filteredContests && filteredContests.length > 0 ? (
          filteredContests.map(contest => (
            <ContestCard 
              key={contest.id} 
              contest={contest} 
              matchId={parseInt(matchId)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Trophy className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Contests Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {filterTab !== "all" 
                ? "Try changing the filter to see more contests" 
                : "There are no contests available for this match yet"}
            </p>
          </div>
        )}
        
        {/* Private Contest CTA */}
        <div className="bg-white rounded-lg border shadow-sm p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Private Contest</h3>
            <p className="text-sm text-gray-500">Create or join a private contest with friends</p>
          </div>
          <Button className="bg-[#d13239] hover:bg-[#b92d32] text-white px-4 py-2 rounded-full">
            CREATE
          </Button>
        </div>
        
        {/* Create Team CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t text-center">
          <Button 
            className="bg-[#d13239] hover:bg-[#b92d32] text-white px-6 py-3 rounded-full"
            onClick={handleCreateTeam}
          >
            <Plus className="h-4 w-4 mr-2" /> CREATE TEAM
          </Button>
        </div>
      </div>
      
      {/* Team Selection Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Team</DialogTitle>
          </DialogHeader>
          
          {userTeams && userTeams.length > 0 ? (
            <div className="py-4">
              <RadioGroup value={selectedTeamId?.toString()} onValueChange={(value) => setSelectedTeamId(parseInt(value))}>
                {userTeams.map(team => (
                  <div key={team.id} className="flex items-center space-x-2 mb-3 border rounded-lg p-3">
                    <RadioGroupItem value={team.id.toString()} id={`team-${team.id}`} />
                    <Label htmlFor={`team-${team.id}`} className="flex-1">
                      <div className="text-sm font-medium">{team.name}</div>
                      <div className="text-xs text-gray-500">Captain, Vice Captain & {MAX_PLAYERS - 2} more</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="flex justify-end mt-4 space-x-3">
                <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-[#d13239] hover:bg-[#b92d32]"
                  onClick={confirmJoin}
                  disabled={joinContestMutation.isPending}
                >
                  {joinContestMutation.isPending ? "Joining..." : "Join Contest"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="mb-4">You don't have any teams for this match</p>
              <Button 
                className="bg-[#d13239] hover:bg-[#b92d32]"
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const MAX_PLAYERS = 11;
