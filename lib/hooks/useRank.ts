// lib/hooks/useRank.ts
import {useQuery} from "@tanstack/react-query";
import {fetchRankConfigs, fetchRankHistory, fetchRankUser} from "../queries/ranks";

export function useRankUser(userId: string) {
  return useQuery({
    queryKey: ["rank", "user", userId],
    queryFn: () => fetchRankUser(userId),
    staleTime: 60_000,
  });
}

export function useRankConfigs() {
  return useQuery({
    queryKey: ["rank", "configs"],
    queryFn: fetchRankConfigs,
    staleTime: 5 * 60_000,
  });
}

export function useRankHistory(userId: string) {
  return useQuery({
    queryKey: ["rank", "history", userId],
    queryFn: () => fetchRankHistory(userId),
    staleTime: 60_000,
  });
}
