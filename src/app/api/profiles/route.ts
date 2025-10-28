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
    (typeof candidate.phone === "undefined" || typeof candidate.phone === "string")
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

    const { id, email, fullName, phone } = body;
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
