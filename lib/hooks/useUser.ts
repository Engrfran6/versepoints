import {useQuery} from "@tanstack/react-query";
import {fetchUser} from "../queries/user";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}
