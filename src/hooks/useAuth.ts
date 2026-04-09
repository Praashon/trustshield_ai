'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';

export function useAuth() {
  const { user, session, isLoading, setUser, setSession, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        setSession(currentSession);

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profile) {
          setUser(profile as User);
        }
      }

      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (profile) {
            setUser(profile as User);
          }
        } else {
          clearAuth();
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading, clearAuth]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    isAdmin: user?.role === 'admin',
  };
}
