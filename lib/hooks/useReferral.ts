import {useQuery} from "@tanstack/react-query";
import {
  fetchReferralCount,
  fetchLeaderBoardRank,
  fetchReferralStatus,
} from "@/lib/queries/referral";
import {queryKeys} from "@/lib/react-query/query-keys";

export function useReferralCount(userId: string) {
  return useQuery({
    queryKey: queryKeys.referrals.count(userId),
    queryFn: () => fetchReferralCount(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useLeaderBoardRank(userId: string) {
  return useQuery({
    queryKey: queryKeys.leaderboard.rank(userId),
    queryFn: () => fetchLeaderBoardRank(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useReferralStatus() {
  return useQuery({
    queryKey: queryKeys.referrals.status,
    queryFn: fetchReferralStatus,
    staleTime: 30_000,
  });
}
