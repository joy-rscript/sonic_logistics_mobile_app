import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserProfile, updateUserProfile, uploadUserAvatar, UserProfile } from '@/utils/userApi';

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user profile
  useEffect(() => {
    refreshProfile();
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you'd get the user ID from authentication context
      const userId = 'courier1'; // This should come from auth context
      const profile = await fetchUserProfile(userId);
      setUser(profile);
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(user.id, updates);
      setUser(updatedProfile);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const avatarUrl = await uploadUserAvatar(user.id, imageUri);
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    } catch (err) {
      setError('Failed to upload avatar');
      console.error('Error uploading avatar:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      error,
      updateProfile,
      uploadAvatar,
      refreshProfile,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}