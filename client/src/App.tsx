import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import MyMatchesPage from "@/pages/my-matches-page";
import CreateTeamPage from "@/pages/create-team-page";
import ContestPage from "@/pages/contest-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import MyContestsPage from "@/pages/my-contests-page";
import WinnersPage from "@/pages/winners-page";
import MorePage from "@/pages/more-page";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/my-matches" component={MyMatchesPage} />
      <ProtectedRoute path="/create-team/:matchId" component={CreateTeamPage} />
      <ProtectedRoute path="/contests/:matchId" component={ContestPage} />
      <ProtectedRoute path="/leaderboard/:contestId" component={LeaderboardPage} />
      <ProtectedRoute path="/my-contests" component={MyContestsPage} />
      <ProtectedRoute path="/winners" component={WinnersPage} />
      <ProtectedRoute path="/more" component={MorePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
