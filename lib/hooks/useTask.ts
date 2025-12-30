import {useQuery} from "@tanstack/react-query";
import {fetchTasks, fetchUserTasks} from "../queries/task";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 60_000, // 1 min cache
  });
}

export function useUserTasks(userId: string) {
  return useQuery({
    queryKey: ["userTasks", userId],
    queryFn: () => fetchUserTasks(userId),
    enabled: !!userId,
  });
}
