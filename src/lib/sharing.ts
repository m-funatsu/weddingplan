import { supabase, isSupabaseConfigured } from "./supabase";

const SHARE_CODE_KEY = "weddingroadmap_share_code";
const LINKED_PARTNER_KEY = "weddingroadmap_linked_partner";

export interface PartnerLink {
  shareCode: string;
  linkedPartnerEmail: string | null;
  linkedAt: string | null;
  isOwner: boolean;
}

/**
 * Generate a unique share code for the current user.
 * Stores it in localStorage and optionally in Supabase profile.
 */
export function generateShareCode(): string {
  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  localStorage.setItem(SHARE_CODE_KEY, code);
  return code;
}

/**
 * Get the current user's share code, generating one if none exists.
 */
export function getShareCode(): string {
  const existing = localStorage.getItem(SHARE_CODE_KEY);
  if (existing) return existing;
  return generateShareCode();
}

/**
 * Get linked partner info from localStorage.
 */
export function getLinkedPartner(): { email: string; linkedAt: string } | null {
  try {
    const raw = localStorage.getItem(LINKED_PARTNER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save linked partner info to localStorage.
 */
function saveLinkedPartner(email: string): void {
  localStorage.setItem(
    LINKED_PARTNER_KEY,
    JSON.stringify({ email, linkedAt: new Date().toISOString() })
  );
}

/**
 * Remove linked partner info.
 */
export function unlinkPartner(): void {
  localStorage.removeItem(LINKED_PARTNER_KEY);
}

/**
 * Save the share code to Supabase profile for the current user.
 */
export async function saveShareCodeToProfile(userId: string, code: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from("weddingroadmap_profiles")
      .upsert(
        { user_id: userId, share_code: code },
        { onConflict: "user_id" }
      );
    return !error;
  } catch {
    return false;
  }
}

/**
 * Look up a share code in Supabase to find the partner's user_id.
 * Returns the owner's user_id and email if found.
 */
export async function lookupShareCode(
  code: string
): Promise<{ userId: string; email: string } | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("weddingroadmap_profiles")
      .select("user_id")
      .eq("share_code", code.toUpperCase().trim())
      .single();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      email: "",
    };
  } catch {
    return null;
  }
}

/**
 * Link two users together by storing the partner relationship in Supabase.
 * Both users will reference the same owner_id for data sharing.
 */
export async function linkPartner(
  currentUserId: string,
  partnerCode: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Offline mode: store locally
    saveLinkedPartner(partnerCode);
    return { success: true };
  }

  try {
    // Look up the share code
    const partner = await lookupShareCode(partnerCode);
    if (!partner) {
      return { success: false, error: "招待コードが見つかりません" };
    }

    if (partner.userId === currentUserId) {
      return { success: false, error: "自分の招待コードは使用できません" };
    }

    // Save the partner link: current user's partner_user_id points to the owner
    const { error } = await supabase
      .from("weddingroadmap_profiles")
      .upsert(
        {
          user_id: currentUserId,
          partner_user_id: partner.userId,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return { success: false, error: "リンクの保存に失敗しました" };
    }

    // Also update the partner's record to link back
    await supabase
      .from("weddingroadmap_profiles")
      .upsert(
        {
          user_id: partner.userId,
          partner_user_id: currentUserId,
        },
        { onConflict: "user_id" }
      );

    saveLinkedPartner(partner.userId);
    return { success: true };
  } catch {
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

/**
 * Get the partner link status from Supabase for the current user.
 */
export async function getPartnerLinkStatus(
  userId: string
): Promise<{ linked: boolean; partnerUserId: string | null; shareCode: string | null }> {
  if (!isSupabaseConfigured()) {
    const localPartner = getLinkedPartner();
    return {
      linked: localPartner !== null,
      partnerUserId: localPartner?.email ?? null,
      shareCode: getShareCode(),
    };
  }

  try {
    const { data, error } = await supabase
      .from("weddingroadmap_profiles")
      .select("share_code, partner_user_id")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return { linked: false, partnerUserId: null, shareCode: getShareCode() };
    }

    return {
      linked: !!data.partner_user_id,
      partnerUserId: data.partner_user_id ?? null,
      shareCode: data.share_code ?? getShareCode(),
    };
  } catch {
    return { linked: false, partnerUserId: null, shareCode: getShareCode() };
  }
}

/**
 * Get the effective owner_id for data operations.
 * If linked to a partner, returns the partner's user_id (the original owner).
 * Otherwise returns the current user's id.
 */
export async function getEffectiveOwnerId(userId: string): Promise<string> {
  if (!isSupabaseConfigured()) return userId;

  try {
    const { data } = await supabase
      .from("weddingroadmap_profiles")
      .select("partner_user_id")
      .eq("user_id", userId)
      .single();

    // If this user has a partner_user_id, check if the partner was the original owner
    // The "owner" is the one who was linked to first (the one whose share code was used)
    if (data?.partner_user_id) {
      // Check if the partner also points back to us - if so, the owner is the one
      // who generated the share code first (the one with the lower timestamp or the one
      // who has the share_code set)
      const { data: partnerData } = await supabase
        .from("weddingroadmap_profiles")
        .select("partner_user_id, share_code")
        .eq("user_id", data.partner_user_id)
        .single();

      // If partner has a share_code, they are the owner
      if (partnerData?.share_code) {
        return data.partner_user_id;
      }
    }

    return userId;
  } catch {
    return userId;
  }
}
