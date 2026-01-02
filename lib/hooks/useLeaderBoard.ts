import {useQuery} from "@tanstack/react-query";
import {fetchLeaderboard, fetchUserRank} from "../queries/leaderboard";

export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserRank(userId: string) {
  return useQuery({
    queryKey: ["leaderboard", "rank", userId],
    queryFn: () => fetchUserRank(userId),
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
