import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPlayerSchema, 
  insertMatchSchema, 
  insertTeamSchema, 
  insertTeamPlayerSchema,
  insertContestSchema,
  insertContestEntrySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // User wallet operations
  app.get("/api/wallet/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const userId = parseInt(req.params.userId);
    if (userId !== req.user.id) {
      return res.status(403).send("Forbidden");
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    
    res.json({ 
      walletBalance: user.walletBalance,
      totalWinnings: user.totalWinnings 
    });
  });

  // Matches endpoints
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  app.get("/api/matches/upcoming", async (req, res) => {
    try {
      const matches = await storage.getUpcomingMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upcoming matches" });
    }
  });

  app.get("/api/matches/live", async (req, res) => {
    try {
      const matches = await storage.getLiveMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live matches" });
    }
  });

  app.get("/api/matches/completed", async (req, res) => {
    try {
      const matches = await storage.getCompletedMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch completed matches" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const matchId = parseInt(req.params.id);
      const match = await storage.getMatch(matchId);
      
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch match" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const newMatch = await storage.createMatch(matchData);
      res.status(201).json(newMatch);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create match" });
    }
  });

  // Players endpoints
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.get("/api/players/role/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const players = await storage.getPlayersByRole(role);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players by role" });
    }
  });

  app.get("/api/players/team/:teamCode", async (req, res) => {
    try {
      const teamCode = req.params.teamCode;
      const players = await storage.getPlayersByTeam(teamCode);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players by team" });
    }
  });

  app.get("/api/players/match/:matchId", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const players = await storage.getPlayersByMatch(matchId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players for match" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player" });
    }
  });

  // Teams endpoints
  app.get("/api/teams/user/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = parseInt(req.params.userId);
      
      if (userId !== req.user.id) {
        return res.status(403).send("Forbidden");
      }
      
      const teams = await storage.getTeamsByUser(userId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/match/:matchId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const matchId = parseInt(req.params.matchId);
      const userId = req.user.id;
      
      const teams = await storage.getTeamsByUser(userId);
      const matchTeams = teams.filter(team => team.matchId === matchId);
      
      res.json(matchTeams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams for match" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (team.userId !== req.user.id) {
        return res.status(403).send("Forbidden");
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const teamData = insertTeamSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newTeam = await storage.createTeam(teamData);
      res.status(201).json(newTeam);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.get("/api/teams/:id/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (team.userId !== req.user.id) {
        return res.status(403).send("Forbidden");
      }
      
      const players = await storage.getTeamPlayers(teamId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team players" });
    }
  });

  app.post("/api/teams/:id/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (team.userId !== req.user.id) {
        return res.status(403).send("Forbidden");
      }
      
      const teamPlayerData = insertTeamPlayerSchema.parse({
        ...req.body,
        teamId
      });
      
      const newTeamPlayer = await storage.addPlayerToTeam(teamPlayerData);
      res.status(201).json(newTeamPlayer);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to add player to team" });
    }
  });

  // Contests endpoints
  app.get("/api/contests/match/:matchId", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const contests = await storage.getContestsByMatch(matchId);
      res.json(contests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contests for match" });
    }
  });

  app.get("/api/contests/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user.id;
      const contests = await storage.getContestsByUser(userId);
      res.json(contests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user contests" });
    }
  });

  app.get("/api/contests/:id", async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const contest = await storage.getContest(contestId);
      
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      res.json(contest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest" });
    }
  });

  app.post("/api/contests", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const contestData = insertContestSchema.parse(req.body);
      const newContest = await storage.createContest(contestData);
      res.status(201).json(newContest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create contest" });
    }
  });

  // Contest entries endpoints
  app.get("/api/contests/:id/entries", async (req, res) => {
    try {
      const contestId = parseInt(req.params.id);
      const entries = await storage.getContestEntriesByContest(contestId);
      
      // Map entries to include user and team information
      const entriesWithDetails = await Promise.all(entries.map(async (entry) => {
        const user = await storage.getUser(entry.userId);
        const team = await storage.getTeam(entry.teamId);
        
        return {
          ...entry,
          username: user?.username,
          teamName: team?.name
        };
      }));
      
      res.json(entriesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest entries" });
    }
  });

  app.post("/api/contests/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const contestId = parseInt(req.params.id);
      const { teamId } = req.body;
      
      if (!teamId) {
        return res.status(400).json({ error: "Team ID is required" });
      }
      
      // Check if contest exists
      const contest = await storage.getContest(contestId);
      if (!contest) {
        return res.status(404).json({ error: "Contest not found" });
      }
      
      // Check if team exists and belongs to user
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      if (team.userId !== req.user.id) {
        return res.status(403).json({ error: "Team does not belong to user" });
      }
      
      // Check if team is for the correct match
      if (team.matchId !== contest.matchId) {
        return res.status(400).json({ error: "Team is not for this match" });
      }
      
      // Check if user has enough wallet balance
      const user = await storage.getUser(req.user.id);
      if (!user || user.walletBalance < contest.entryFee) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }
      
      // Check if contest has available spots
      if (contest.filledSpots >= contest.totalSpots) {
        return res.status(400).json({ error: "Contest is full" });
      }
      
      // Deduct entry fee from wallet
      await storage.updateUserWallet(req.user.id, -contest.entryFee);
      
      // Create contest entry
      const entryData = {
        contestId,
        userId: req.user.id,
        teamId
      };
      
      const newEntry = await storage.createContestEntry(entryData);
      res.status(201).json(newEntry);
    } catch (error) {
      res.status(500).json({ error: "Failed to join contest" });
    }
  });

  // Winners endpoints
  app.get("/api/winners", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const winners = await storage.getRecentWinners(limit);
      
      // Map winners to include user information
      const winnersWithDetails = await Promise.all(winners.map(async (winner) => {
        const user = await storage.getUser(winner.userId);
        const contest = await storage.getContest(winner.contestId);
        const match = await storage.getMatch(winner.matchId);
        
        return {
          ...winner,
          username: user?.username,
          fullName: user?.fullName,
          contestName: contest?.name,
          matchDetails: match ? `${match.team1Code} vs ${match.team2Code}` : ''
        };
      }));
      
      res.json(winnersWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winners" });
    }
  });

  app.get("/api/winners/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const userId = req.user.id;
      const winners = await storage.getWinnersByUser(userId);
      res.json(winners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user winners" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
