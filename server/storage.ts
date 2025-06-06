import { 
  User, InsertUser, 
  Team, InsertTeam,
  TeamPlayer, InsertTeamPlayer,
  Player, InsertPlayer,
  Match, InsertMatch,
  Contest, InsertContest,
  ContestEntry, InsertContestEntry,
  Winner, InsertWinner
} from "@shared/schema";
import session from "express-session";
import { Store as SessionStore } from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Extend the IStorage interface with CRUD operations for all models
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, amount: number): Promise<User>;
  
  // Player operations
  getPlayers(): Promise<Player[]>;
  getPlayersByRole(role: string): Promise<Player[]>;
  getPlayersByTeam(teamCode: string): Promise<Player[]>;
  getPlayersByMatch(matchId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  
  // Match operations
  getMatches(): Promise<Match[]>;
  getUpcomingMatches(): Promise<Match[]>;
  getLiveMatches(): Promise<Match[]>;
  getCompletedMatches(): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Team operations
  getTeamsByUser(userId: number): Promise<Team[]>;
  getTeamsByMatch(matchId: number): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamPlayers(teamId: number): Promise<Player[]>;
  addPlayerToTeam(teamPlayer: InsertTeamPlayer): Promise<TeamPlayer>;
  
  // Contest operations
  getContestsByMatch(matchId: number): Promise<Contest[]>;
  getContestsByUser(userId: number): Promise<Contest[]>;
  getContest(id: number): Promise<Contest | undefined>;
  createContest(contest: InsertContest): Promise<Contest>;
  
  // Contest Entry operations
  getContestEntriesByContest(contestId: number): Promise<ContestEntry[]>;
  getContestEntriesByUser(userId: number): Promise<ContestEntry[]>;
  getContestEntry(id: number): Promise<ContestEntry | undefined>;
  createContestEntry(entry: InsertContestEntry): Promise<ContestEntry>;
  
  // Winner operations
  getRecentWinners(limit?: number): Promise<Winner[]>;
  getWinnersByUser(userId: number): Promise<Winner[]>;
  createWinner(winner: InsertWinner): Promise<Winner>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private matches: Map<number, Match>;
  private teams: Map<number, Team>;
  private teamPlayers: Map<number, TeamPlayer>;
  private contests: Map<number, Contest>;
  private contestEntries: Map<number, ContestEntry>;
  private winners: Map<number, Winner>;
  
  currentUserId: number;
  currentPlayerId: number;
  currentMatchId: number;
  currentTeamId: number;
  currentTeamPlayerId: number;
  currentContestId: number;
  currentContestEntryId: number;
  currentWinnerId: number;
  
  sessionStore: SessionStore;

  constructor() {
    // Initialize maps for in-memory storage
    this.users = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.teams = new Map();
    this.teamPlayers = new Map();
    this.contests = new Map();
    this.contestEntries = new Map();
    this.winners = new Map();
    
    // Initialize ID counters
    this.currentUserId = 1;
    this.currentPlayerId = 1;
    this.currentMatchId = 1;
    this.currentTeamId = 1;
    this.currentTeamPlayerId = 1;
    this.currentContestId = 1;
    this.currentContestEntryId = 1;
    this.currentWinnerId = 1;

    // Set up session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed initial data
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      walletBalance: 500, 
      totalWinnings: 0,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserWallet(userId: number, amount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      walletBalance: user.walletBalance + amount
    };
    
    if (amount > 0) {
      updatedUser.totalWinnings += amount;
    }
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Player operations
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }
  
  async getPlayersByRole(role: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      player => player.role === role
    );
  }
  
  async getPlayersByTeam(teamCode: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      player => player.teamCode === teamCode
    );
  }
  
  async getPlayersByMatch(matchId: number): Promise<Player[]> {
    const match = await this.getMatch(matchId);
    if (!match) {
      return [];
    }
    
    return Array.from(this.players.values()).filter(
      player => player.teamCode === match.team1Code || player.teamCode === match.team2Code
    );
  }
  
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const newPlayer: Player = { 
      ...player, 
      id,
      points: player.points || 0,
      selectionPercentage: player.selectionPercentage || 0,
      lastMatchPoints: player.lastMatchPoints || 0,
      imageUrl: player.imageUrl || null
    };
    this.players.set(id, newPlayer);
    return newPlayer;
  }
  
  // Match operations
  async getMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }
  
  async getUpcomingMatches(): Promise<Match[]> {
    const now = new Date();
    return Array.from(this.matches.values()).filter(
      match => new Date(match.startTime) > now && !match.isLive && !match.isCompleted
    );
  }
  
  async getLiveMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.isLive && !match.isCompleted
    );
  }
  
  async getCompletedMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.isCompleted
    );
  }
  
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }
  
  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const newMatch: Match = { 
      ...match, 
      id,
      team1Logo: match.team1Logo || null,
      team2Logo: match.team2Logo || null,
      tagText: match.tagText || null,
      tagColor: match.tagColor || null,
      isLive: false,
      isCompleted: false
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }
  
  // Team operations
  async getTeamsByUser(userId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      team => team.userId === userId
    );
  }
  
  async getTeamsByMatch(matchId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(
      team => team.matchId === matchId
    );
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.currentTeamId++;
    const timestamp = new Date();
    const newTeam: Team = { 
      ...team, 
      id,
      totalPoints: 0,
      createdAt: timestamp
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }
  
  async getTeamPlayers(teamId: number): Promise<Player[]> {
    const teamPlayerEntries = Array.from(this.teamPlayers.values()).filter(
      tp => tp.teamId === teamId
    );
    
    const playerIds = teamPlayerEntries.map(tp => tp.playerId);
    const players: Player[] = [];
    
    for (const id of playerIds) {
      const player = await this.getPlayer(id);
      if (player) {
        players.push(player);
      }
    }
    
    return players;
  }
  
  async addPlayerToTeam(teamPlayer: InsertTeamPlayer): Promise<TeamPlayer> {
    const id = this.currentTeamPlayerId++;
    const newTeamPlayer: TeamPlayer = { ...teamPlayer, id };
    this.teamPlayers.set(id, newTeamPlayer);
    return newTeamPlayer;
  }
  
  // Contest operations
  async getContestsByMatch(matchId: number): Promise<Contest[]> {
    return Array.from(this.contests.values()).filter(
      contest => contest.matchId === matchId
    );
  }
  
  async getContestsByUser(userId: number): Promise<Contest[]> {
    const userEntries = Array.from(this.contestEntries.values()).filter(
      entry => entry.userId === userId
    );
    
    const contestIds = userEntries.map(entry => entry.contestId);
    const contests: Contest[] = [];
    
    for (const id of contestIds) {
      const contest = await this.getContest(id);
      if (contest) {
        contests.push(contest);
      }
    }
    
    return contests;
  }
  
  async getContest(id: number): Promise<Contest | undefined> {
    return this.contests.get(id);
  }
  
  async createContest(contest: InsertContest): Promise<Contest> {
    const id = this.currentContestId++;
    const newContest: Contest = { 
      ...contest, 
      id,
      filledSpots: 0,
      isGuaranteed: contest.isGuaranteed || false,
      headerColor: contest.headerColor || "#1f2833"
    };
    this.contests.set(id, newContest);
    return newContest;
  }
  
  // Contest Entry operations
  async getContestEntriesByContest(contestId: number): Promise<ContestEntry[]> {
    return Array.from(this.contestEntries.values()).filter(
      entry => entry.contestId === contestId
    );
  }
  
  async getContestEntriesByUser(userId: number): Promise<ContestEntry[]> {
    return Array.from(this.contestEntries.values()).filter(
      entry => entry.userId === userId
    );
  }
  
  async getContestEntry(id: number): Promise<ContestEntry | undefined> {
    return this.contestEntries.get(id);
  }
  
  async createContestEntry(entry: InsertContestEntry): Promise<ContestEntry> {
    const id = this.currentContestEntryId++;
    const timestamp = new Date();
    const newEntry: ContestEntry = { 
      ...entry, 
      id,
      rank: null,
      points: 0,
      prizeWon: 0,
      createdAt: timestamp
    };
    this.contestEntries.set(id, newEntry);
    
    // Update contest filled spots
    const contest = await this.getContest(entry.contestId);
    if (contest) {
      const updatedContest: Contest = {
        ...contest,
        filledSpots: contest.filledSpots + 1
      };
      this.contests.set(contest.id, updatedContest);
    }
    
    return newEntry;
  }
  
  // Winner operations
  async getRecentWinners(limit: number = 10): Promise<Winner[]> {
    const winners = Array.from(this.winners.values());
    winners.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return winners.slice(0, limit);
  }
  
  async getWinnersByUser(userId: number): Promise<Winner[]> {
    return Array.from(this.winners.values()).filter(
      winner => winner.userId === userId
    );
  }
  
  async createWinner(winner: InsertWinner): Promise<Winner> {
    const id = this.currentWinnerId++;
    const timestamp = new Date();
    const newWinner: Winner = { 
      ...winner, 
      id,
      createdAt: timestamp
    };
    this.winners.set(id, newWinner);
    
    // Update user's total winnings and wallet balance if user exists
    const user = await this.getUser(winner.userId);
    if (user) {
      await this.updateUserWallet(winner.userId, winner.amount);
    }
    
    return newWinner;
  }
  
  // Seed initial data for testing
  private seedData() {
    // Seed matches
    const now = new Date();
    const match1StartTime = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now
    
    this.createMatch({
      team1: "Chennai Super Kings",
      team2: "Mumbai Indians",
      team1Code: "CSK",
      team2Code: "MI",
      team1Logo: "https://images.unsplash.com/photo-1580802527985-88e1f52b4fd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      team2Logo: "https://images.unsplash.com/photo-1606232999304-d34a58d1ec28?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      matchType: "IPL",
      startTime: match1StartTime,
      tagText: "MEGA",
      tagColor: "#d13239"
    });
    
    const match2StartTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    this.createMatch({
      team1: "Royal Challengers Bangalore",
      team2: "Delhi Capitals",
      team1Code: "RCB",
      team2Code: "DC",
      team1Logo: "https://images.unsplash.com/photo-1670442455839-9192c0aef59e?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      team2Logo: "https://images.unsplash.com/photo-1580802527985-88e1f52b4fd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      matchType: "IPL",
      startTime: match2StartTime,
      tagText: "HOT",
      tagColor: "#ffc107"
    });
    
    const match3StartTime = new Date(now.getTime() + 8 * 60 * 60 * 1000); // 8 hours from now
    
    this.createMatch({
      team1: "India",
      team2: "Australia",
      team1Code: "IND",
      team2Code: "AUS",
      team1Logo: "https://images.unsplash.com/photo-1594750852612-29bab67b3d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      team2Logo: "https://images.unsplash.com/photo-1623053523468-1bf0e2397a85?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      matchType: "ODI",
      startTime: match3StartTime,
      tagText: "INTL",
      tagColor: "#2196f3"
    });
    
    const match4StartTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    this.createMatch({
      team1: "England",
      team2: "New Zealand",
      team1Code: "ENG",
      team2Code: "NZ",
      team1Logo: "https://images.unsplash.com/photo-1548021837-5478fbd36b8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      team2Logo: "https://images.unsplash.com/photo-1463425522303-157219c489bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80",
      matchType: "TEST",
      startTime: match4StartTime,
      tagText: "INTL",
      tagColor: "#4caf50"
    });
    
    // Seed players for CSK
    this.createPlayer({
      name: "MS Dhoni",
      teamCode: "CSK",
      role: "WK",
      credits: 9.0,
      points: 0,
      selectionPercentage: 92,
      lastMatchPoints: 35,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Ravindra Jadeja",
      teamCode: "CSK",
      role: "AR",
      credits: 9.5,
      points: 0,
      selectionPercentage: 88,
      lastMatchPoints: 42,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Ruturaj Gaikwad",
      teamCode: "CSK",
      role: "BAT",
      credits: 9.0,
      points: 0,
      selectionPercentage: 85,
      lastMatchPoints: 55,
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    // Seed players for MI
    this.createPlayer({
      name: "Quinton de Kock",
      teamCode: "MI",
      role: "WK",
      credits: 9.5,
      points: 0,
      selectionPercentage: 78,
      lastMatchPoints: 28,
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Ishan Kishan",
      teamCode: "MI",
      role: "WK",
      credits: 8.5,
      points: 0,
      selectionPercentage: 65,
      lastMatchPoints: 22,
      imageUrl: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Rohit Sharma",
      teamCode: "MI",
      role: "BAT",
      credits: 10.0,
      points: 0,
      selectionPercentage: 90,
      lastMatchPoints: 45,
      imageUrl: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    // Seed contests for match 1
    this.createContest({
      matchId: 1,
      name: "MEGA Contest",
      entryFee: 49,
      totalSpots: 2345678,
      prizePool: 100000000, // 10 crores
      firstPrize: 10000000, // 1 crore
      isGuaranteed: true,
      contestType: "MEGA",
      headerColor: "#d13239"
    });
    
    this.createContest({
      matchId: 1,
      name: "Small Contest",
      entryFee: 15,
      totalSpots: 987654,
      prizePool: 10000000, // 1 crore
      firstPrize: 2500000, // 25 lakhs
      isGuaranteed: true,
      contestType: "SMALL",
      headerColor: "#1f2833"
    });
    
    // Seed players for India
    this.createPlayer({
      name: "Virat Kohli",
      teamCode: "IND",
      role: "BAT",
      credits: 10.0,
      points: 0,
      selectionPercentage: 95,
      lastMatchPoints: 87,
      imageUrl: "https://images.unsplash.com/photo-1535813547-3e2a11a620db?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Rohit Sharma",
      teamCode: "IND",
      role: "BAT",
      credits: 9.5,
      points: 0,
      selectionPercentage: 90,
      lastMatchPoints: 76,
      imageUrl: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Jasprit Bumrah",
      teamCode: "IND",
      role: "BOWL",
      credits: 9.0,
      points: 0,
      selectionPercentage: 88,
      lastMatchPoints: 65,
      imageUrl: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    // Seed players for Australia
    this.createPlayer({
      name: "Steve Smith",
      teamCode: "AUS",
      role: "BAT",
      credits: 9.5,
      points: 0,
      selectionPercentage: 85,
      lastMatchPoints: 72,
      imageUrl: "https://images.unsplash.com/photo-1547975041-0bd3bc314dab?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    this.createPlayer({
      name: "Pat Cummins",
      teamCode: "AUS",
      role: "BOWL",
      credits: 9.0,
      points: 0,
      selectionPercentage: 82,
      lastMatchPoints: 55,
      imageUrl: "https://images.unsplash.com/photo-1551858920-9e282b442f2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&h=60&q=80"
    });
    
    // Seed contests for all matches
    this.createContest({
      matchId: 3,
      name: "ODI World Cup Contest",
      entryFee: 99,
      totalSpots: 1500000,
      prizePool: 80000000, // 8 crores
      firstPrize: 5000000, // 50 lakhs
      isGuaranteed: true,
      contestType: "MEGA",
      headerColor: "#2196f3"
    });
    
    this.createContest({
      matchId: 4,
      name: "Test Championship Special",
      entryFee: 199,
      totalSpots: 500000,
      prizePool: 50000000, // 5 crores
      firstPrize: 3000000, // 30 lakhs
      isGuaranteed: true,
      contestType: "MEGA",
      headerColor: "#4caf50"
    });
    
    // Seed winners
    this.createWinner({
      userId: 1,
      contestId: 1,
      matchId: 1,
      amount: 350000
    });
    
    this.createWinner({
      userId: 1,
      contestId: 2,
      matchId: 1,
      amount: 175000
    });
  }
}

export const storage = new MemStorage();
