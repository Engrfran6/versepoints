import {useQuery} from "@tanstack/react-query";
import {fetchPlatformPhases} from "../queries/phases";

export function usePlatformPhases() {
  return useQuery({
    queryKey: ["phases"],
    queryFn: fetchPlatformPhases,
    staleTime: 10 * 60_000,
  });
}
