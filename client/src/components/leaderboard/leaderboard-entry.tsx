import { cn, formatCurrency } from "@/lib/utils";

interface LeaderboardEntryProps {
  rank: number;
  username: string;
  teamName: string;
  points: number;
  prize: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardEntry({
  rank,
  username,
  teamName,
  points,
  prize,
  avatarUrl,
  isCurrentUser = false
}: LeaderboardEntryProps) {
  return (
    <tr className={cn(
      "border-b",
      isCurrentUser ? "bg-gray-50" : ""
    )}>
      <td className="px-4 py-3 text-sm">#{rank}</td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <img 
            src={avatarUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80"} 
            className="w-8 h-8 rounded-full mr-2" 
            alt={`${username} avatar`} 
          />
          <div>
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-gray-500">{teamName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-right font-bold">{points}</td>
      <td className="px-4 py-3 text-sm text-right font-bold text-[#28a745]">
        {formatCurrency(prize)}
      </td>
    </tr>
  );
}
