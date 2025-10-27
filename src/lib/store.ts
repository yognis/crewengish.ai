import { create } from 'zustand';

import { createClient } from './auth-client';
import type { Database } from './database.types';
import { logger } from './logger';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AppState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateCredits: (credits: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  loading: true,
  error: null,

  loadProfile: async () => {
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Auth error:', userError);
        set({ profile: null, loading: false, error: 'Oturum hatası' });
        return;
      }

      if (!user) {
        logger.debug('No user session');
        set({ profile: null, loading: false, error: null });
        return;
      }

      logger.debug('User found:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);

        if (profileError.code === 'PGRST116') {
          logger.debug('Profile not found, creating...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || 'THY Kullanıcısı',
              phone: user.user_metadata?.phone || '',
              credits: 5,
              department: 'cabin_crew',
            })
            .select()
            .single();

          if (createError) {
            console.error('Profile creation error:', createError);
            set({ profile: null, loading: false, error: 'Profil oluşturulamadı' });
            return;
          }

          logger.debug('Profile created:', newProfile);
          set({ profile: newProfile, loading: false, error: null });
          return;
        }

        set({ profile: null, loading: false, error: 'Profil yüklenemedi' });
        return;
      }

      logger.debug('Profile loaded:', profile);
      set({ profile, loading: false, error: null });
    } catch (error: any) {
      console.error('Unexpected error:', error);
      set({ profile: null, loading: false, error: 'Beklenmeyen hata' });
    }
  },

  updateCredits: (credits: number) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, credits } : null,
    })),
}));

