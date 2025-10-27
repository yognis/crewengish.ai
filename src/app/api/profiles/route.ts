import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type CreateProfileRequest = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateProfileRequest;
    const { id, email, fullName, phone } = body;

    if (!id || !email || !fullName) {
      return NextResponse.json(
        { error: 'Eksik kullanıcı bilgileri gönderildi.' },
        { status: 400 }
      );
    }

    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingProfile) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          full_name: fullName,
          phone: phone ?? null,
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseAdmin.from('profiles').insert({
        id,
        email,
        full_name: fullName,
        phone: phone ?? null,
        department: 'other',
        credits: 5,
      });

      if (insertError) {
        if ('code' in insertError && insertError.code === '23505') {
          console.warn('Profile already exists, skipping duplicate insert.');
        } else {
          throw insertError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile creation failed:', error);
    return NextResponse.json(
      { error: 'Profil oluşturma sırasında bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
