// lib/react-query/query-keys.ts
export const queryKeys = {
  user: (userId: string) => ["user", userId] as const,

  referrals: {
    count: (userId: string) => ["user", userId, "referrals", "count"] as const,
    status: ["referrals", "status"] as const,
  },

  leaderboard: {
    rank: (userId: string) => ["user", userId, "leaderboard", "rank"] as const,
  },
};
