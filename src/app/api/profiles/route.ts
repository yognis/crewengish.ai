import { NextRequest, NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ProfilesTable = Database["public"]["Tables"]["profiles"];
type ProfilesInsert = ProfilesTable["Insert"];
type ProfilesUpdate = ProfilesTable["Update"];

interface CreateProfileRequest {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  marketingConsent?: boolean;
}

type ProfileResponse = { success: true } | { error: string };

function isCreateProfileRequest(payload: unknown): payload is CreateProfileRequest {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.fullName === "string" &&
    (typeof candidate.phone === "undefined" || typeof candidate.phone === "string") &&
    (typeof candidate.marketingConsent === "undefined" || typeof candidate.marketingConsent === "boolean")
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ProfileResponse>> {
  try {
    const body = (await request.json()) as unknown;

    if (!isCreateProfileRequest(body)) {
      return NextResponse.json(
        { error: "Eksik kullanıcı bilgileri gönderildi." },
        { status: 400 },
      );
    }

    const { id, email, fullName, phone, marketingConsent } = body;
    const now = new Date().toISOString();

    // 🔒 BACKEND DECIDES CONSENT (Hard-coded, no trust in frontend)
    const CONSENT_TERMS = true;
    const CONSENT_KVKK = true;
    const CONSENT_AGE = true;
    const CONSENT_MARKETING = !!marketingConsent;

    console.log("🔒 CONSENT VALUES:", {
      terms: CONSENT_TERMS,
      kvkk: CONSENT_KVKK,
      age: CONSENT_AGE,
      marketing: CONSENT_MARKETING,
    });

    // ---- CONSENT AUDIT (runs for both insert & update) ----
    const consentEvents: Database["public"]["Tables"]["consent_audit"]["Insert"][] = [
      { user_id: id, consent_type: "terms", given: CONSENT_TERMS },
      { user_id: id, consent_type: "kvkk", given: CONSENT_KVKK },
      { user_id: id, consent_type: "age", given: CONSENT_AGE },
      { user_id: id, consent_type: "marketing", given: CONSENT_MARKETING },
    ];

    console.log("🔍 AUDIT UPSERT TRY", { user_id: id, count: consentEvents.length });

    const { data: auditData, error: auditError } = await supabaseAdmin
      .from("consent_audit")
      .upsert(consentEvents, { onConflict: "user_id,consent_type", ignoreDuplicates: true })
      .select();

    if (auditError) {
      console.error("❌ AUDIT UPSERT FAILED", {
        code: auditError.code,
        message: auditError.message,
        details: auditError.details,
        hint: auditError.hint,
      });
    } else {
      console.log("✅ AUDIT UPSERT OK", { insertedOrIgnored: auditData?.length ?? 0 });
    }

    // ---- END AUDIT ----

    const {
      data: existingProfile,
      error: fetchError,
    } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", id)
      .maybeSingle<{ id: string }>();

    if (fetchError) {
      throw fetchError;
    }

    if (existingProfile) {
      const updatePayload: ProfilesUpdate = {
        email,
        full_name: fullName,
        phone: phone ?? null,
        updated_at: now,
      };

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const insertPayload: ProfilesInsert = {
        id,
        email,
        full_name: fullName,
        phone: phone ?? null,
        department: "other",
        credits: 5,
        terms_accepted: CONSENT_TERMS,
        kvkk_accepted: CONSENT_KVKK,
        age_verified: CONSENT_AGE,
        marketing_consent: CONSENT_MARKETING,
        terms_accepted_at: now,
        kvkk_accepted_at: now,
        marketing_consent_at: CONSENT_MARKETING ? now : null,
        consent_date: now,
        created_at: now,
        updated_at: now,
      };

      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert(insertPayload);

      if (insertError) {
        if ("code" in insertError && insertError.code === "23505") {
          console.warn("Profile already exists, skipping duplicate insert.");
        } else {
          throw insertError;
        }
      }

    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile creation failed:", error);
    return NextResponse.json(
      { error: "Profil oluşturma sırasında bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}