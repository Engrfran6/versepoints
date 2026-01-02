import {useQuery} from "@tanstack/react-query";
import {
  fetchUserWithRank,
  fetchNFTCatalog,
  fetchUserNFTs,
  fetchNFTUpgradeCombinations,
} from "@/lib/queries/nft-marketplace";

export function useMarketplaceUser(userId: string) {
  return useQuery({
    queryKey: ["marketplace", "user", userId],
    queryFn: () => fetchUserWithRank(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useNFTCatalog() {
  return useQuery({
    queryKey: ["marketplace", "catalog"],
    queryFn: fetchNFTCatalog,
    staleTime: 5 * 60_000,
  });
}

export function useUserNFTs(userId: string) {
  return useQuery({
    queryKey: ["marketplace", "user-nfts", userId],
    queryFn: () => fetchUserNFTs(userId),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useNFTUpgradeCombinations() {
  return useQuery({
    queryKey: ["marketplace", "upgrades"],
    queryFn: fetchNFTUpgradeCombinations,
    staleTime: 10 * 60_000,
  });
}
