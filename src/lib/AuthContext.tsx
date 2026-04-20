import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, authError: null });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setAuthError(null);
      if (user) {
        const email = String(user.email || "").trim().toLowerCase();

        if (!email) {
          setProfile(null);
          setAuthError("This account is missing an email address.");
          await signOut(auth);
        } else {
          const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`);
          const payload = await response.json().catch(() => ({}));

          if (!response.ok) {
            setProfile(null);
            setAuthError(payload.error || "Your account is not provisioned for this migration system.");
            await signOut(auth);
          } else {
            if (!payload.isActive) {
              setProfile(null);
              setAuthError("Your account is inactive. Contact your administrator.");
              await signOut(auth);
            } else {
              setProfile(payload);
            }
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};
