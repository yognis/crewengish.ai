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
  termsAccepted?: boolean;
  kvkkAccepted?: boolean;
  ageVerified?: boolean;
  marketingConsent?: boolean;
  termsAcceptedAt?: string | null;
  kvkkAcceptedAt?: string | null;
  marketingConsentAt?: string | null;
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
    (typeof candidate.termsAccepted === "undefined" || typeof candidate.termsAccepted === "boolean") &&
    (typeof candidate.kvkkAccepted === "undefined" || typeof candidate.kvkkAccepted === "boolean") &&
    (typeof candidate.ageVerified === "undefined" || typeof candidate.ageVerified === "boolean") &&
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

    const { 
      id, 
      email, 
      fullName, 
      phone,
      termsAccepted,
      kvkkAccepted,
      ageVerified,
      marketingConsent,
      termsAcceptedAt,
      kvkkAcceptedAt,
      marketingConsentAt 
    } = body;
    const timestamp = new Date().toISOString();

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
        updated_at: timestamp,
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
        terms_accepted: termsAccepted ?? false,
        kvkk_accepted: kvkkAccepted ?? false,
        age_verified: ageVerified ?? false,
        marketing_consent: marketingConsent ?? false,
        terms_accepted_at: termsAcceptedAt ?? null,
        kvkk_accepted_at: kvkkAcceptedAt ?? null,
        marketing_consent_at: marketingConsentAt ?? null,
        consent_date: timestamp,
        created_at: timestamp,
        updated_at: timestamp,
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

      // Log consent events to audit table
      const consentEvents = [
        { user_id: id, consent_type: 'terms', given: termsAccepted ?? false },
        { user_id: id, consent_type: 'kvkk', given: kvkkAccepted ?? false },
        { user_id: id, consent_type: 'age', given: ageVerified ?? false },
        { user_id: id, consent_type: 'marketing', given: marketingConsent ?? false },
      ];

      await supabaseAdmin.from('consent_audit').insert(consentEvents);
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
