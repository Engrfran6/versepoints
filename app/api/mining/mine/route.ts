import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { miningRequestSchema } from "@/lib/validations/mining";
import { MINING_CONSTANTS, RATE_LIMITS } from "@/lib/constants";
import { headers } from "next/headers";

function getStreakMultiplier(streak: number): number {
  const thresholds = Object.entries(MINING_CONSTANTS.STREAK_BONUS_MULTIPLIERS)
    .map(([days, mult]) => ({ days: Number.parseInt(days), mult }))
    .sort((a, b) => b.days - a.days);

  for (const { days, mult } of thresholds) {
    if (streak >= days) return mult;
  }
  return 1.0;
}

function calculateStreak(
  lastMiningAt: string | null,
  currentStreak: number
): { newStreak: number; streakBroken: boolean } {
  if (!lastMiningAt) {
    return { newStreak: 1, streakBroken: false };
  }

  const lastMining = new Date(lastMiningAt).getTime();
  const now = Date.now();
  const hoursSinceLastMining = (now - lastMining) / (1000 * 60 * 60);
  const graceHours = MINING_CONSTANTS.STREAK_GRACE_HOURS;

  if (hoursSinceLastMining <= graceHours) {
    // Continue streak
    return { newStreak: currentStreak + 1, streakBroken: false };
  } else {
    // Streak broken, reset to 1
    return { newStreak: 1, streakBroken: true };
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = miningRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { fingerprint, browserInfo } = validationResult.data;

    // Get request headers for IP and user agent
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is suspended
    if (userData.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Account is suspended" },
        { status: 403 }
      );
    }

    // Check 24-hour cooldown
    if (userData.last_mining_at) {
      const lastMining = new Date(userData.last_mining_at).getTime();
      const cooldownMs =
        MINING_CONSTANTS.MINING_COOLDOWN_HOURS * 60 * 60 * 1000;
      const now = Date.now();

      if (now - lastMining < cooldownMs) {
        const timeLeft = Math.ceil((lastMining + cooldownMs - now) / 1000 / 60);
        return NextResponse.json(
          { success: false, error: `Mining available in ${timeLeft} minutes` },
          { status: 429 }
        );
      }
    }

    // Check IP rate limiting
    const { data: recentMiningFromIP } = await supabase
      .from("mining_sessions")
      .select("id")
      .eq("ip_address", ipAddress)
      .gte(
        "created_at",
        new Date(
          Date.now() - RATE_LIMITS.MINING_PER_IP_HOURS * 60 * 60 * 1000
        ).toISOString()
      )
      .neq("user_id", user.id)
      .limit(1);

    if (recentMiningFromIP && recentMiningFromIP.length > 0) {
      // Log suspicious activity
      await supabase.from("audit_log").insert({
        user_id: user.id,
        action: "mining_ip_blocked",
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: { fingerprint, reason: "IP already used" },
      });

      return NextResponse.json(
        { success: false, error: "Mining limit reached for this network" },
        { status: 429 }
      );
    }

    // Verify fingerprint consistency
    const { data: existingFingerprint } = await supabase
      .from("device_fingerprints")
      .select("*")
      .eq("user_id", user.id)
      .eq("fingerprint_hash", fingerprint)
      .single();

    if (!existingFingerprint) {
      // Check if this fingerprint belongs to another user
      const { data: otherUserFingerprint } = await supabase
        .from("device_fingerprints")
        .select("user_id")
        .eq("fingerprint_hash", fingerprint)
        .neq("user_id", user.id)
        .limit(1);

      if (otherUserFingerprint && otherUserFingerprint.length > 0) {
        // Suspicious - same device, different account
        await supabase.from("audit_log").insert({
          user_id: user.id,
          action: "mining_fingerprint_conflict",
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: { fingerprint, reason: "Device used by another account" },
        });

        return NextResponse.json(
          { success: false, error: "Device verification failed" },
          { status: 403 }
        );
      }

      // Register new fingerprint for this user
      await supabase.from("device_fingerprints").insert({
        user_id: user.id,
        fingerprint_hash: fingerprint,
        browser_info: browserInfo,
      });
    } else {
      // Update last seen
      await supabase
        .from("device_fingerprints")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", existingFingerprint.id);
    }

    const currentStreak = userData.current_streak || 0;
    const { newStreak, streakBroken } = calculateStreak(
      userData.last_mining_at,
      currentStreak
    );
    const multiplier = getStreakMultiplier(newStreak);

    if (MINING_CONSTANTS.POINTS_PER_MINE > 1000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An exception occurred, We can not process your mining request, please contact support",
        },
        { status: 500 }
      );
    }

    const basePoints = MINING_CONSTANTS.POINTS_PER_MINE;
    const pointsEarned = Math.floor(basePoints * multiplier);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        // points_balance: userData.points_balance + pointsEarned,
        // total_mined: userData.total_mined + pointsEarned,
        mining_count: userData.mining_count + 1,
        last_mining_at: new Date().toISOString(),
        current_streak: newStreak,
        longest_streak: Math.max(userData.longest_streak || 0, newStreak),
        streak_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to update balance" },
        { status: 500 }
      );
    }

    // Record mining session
    await supabase.from("mining_sessions").insert({
      user_id: user.id,
      points_earned: pointsEarned,
      ip_address: ipAddress,
      user_agent: userAgent,
      fingerprint_hash: fingerprint,
    });

    // Check if user was referred and award referrer bonus
    if (userData.referred_by) {
      const { data: referral } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userData.referred_by)
        .eq("referred_id", user.id)
        .single();

      if (referral) {
        // Award first mining bonus to referrer if not already awarded
        if (!referral.first_mining_bonus_paid && userData.mining_count === 0) {
          await supabase.rpc("admin_adjust_points", {
            target_user_id: userData.referred_by,
            point_adjustment: MINING_CONSTANTS.REFERRAL_FIRST_MINING_BONUS,
            reason: "Referral first mining bonus",
          });

          await supabase
            .from("referrals")
            .update({
              first_mining_bonus_paid: true,
              status: "active",
            })
            .eq("id", referral.id);

          await supabase.from("referral_earnings").insert({
            user_id: userData.referred_by,
            referral_id: referral.id,
            referred_user_id: user.id,
            points_earned: MINING_CONSTANTS.REFERRAL_FIRST_MINING_BONUS,
            earning_type: "mining",
          });
        } else if (referral.status === "active") {
          // Award ongoing mining bonus
          const ongoingBonus = MINING_CONSTANTS.REFERRAL_ONGOING_BONUS;

          await supabase.rpc("admin_adjust_points", {
            target_user_id: userData.referred_by,
            point_adjustment: ongoingBonus,
            reason: "Referral ongoing mining bonus",
          });

          await supabase.from("referral_earnings").insert({
            user_id: userData.referred_by,
            referral_id: referral.id,
            referred_user_id: user.id,
            points_earned: ongoingBonus,
            earning_type: "mining",
          });
        }
      }
    }

    // Log successful mining
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "mining_success",
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        points_earned: pointsEarned,
        streak: newStreak,
        multiplier,
        streak_broken: streakBroken,
      },
    });

    return NextResponse.json({
      success: true,
      points: pointsEarned,
      newBalance: userData.points_balance + 0,
      streak: newStreak,
      multiplier,
      streakBroken,
      longestStreak: Math.max(userData.longest_streak || 0, newStreak),
      status: "Mining in progress....",
    });
  } catch (error) {
    console.error("Mining error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
