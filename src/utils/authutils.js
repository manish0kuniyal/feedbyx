'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useUserStore } from './userstore';

export const useStoreUserFromSession = () => {
  const { data: session } = useSession();
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (session?.user) {
      const userFromSession = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        uid: session.user.id, // <- You need this if UID is injected via callback
      };
      console.log("🌐 Setting Zustand user from session", userFromSession);
      setUser(userFromSession);
    }
  }, [session, setUser]);
};
