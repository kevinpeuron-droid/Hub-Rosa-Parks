import { useState, useEffect } from 'react';

export interface AppUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate or retrieve a persistent device-specific ID
    let deviceId = localStorage.getItem('app_dashboard_user_id');
    if (!deviceId) {
      deviceId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('app_dashboard_user_id', deviceId);
    }
    
    // Set a dummy user object to bypass login screen
    setUser({
      uid: deviceId,
      displayName: 'Guest User',
      photoURL: null,
      email: 'guest@local'
    });
    setLoading(false);
  }, []);

  return { user, loading };
}
