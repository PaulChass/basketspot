import { useState, useEffect } from 'react';
import Storage from '@/utils/storage';

export function useProfile() {
  const [username, setUsername] = useState<string>('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  // Load user profile from storage
  const loadProfile = async () => {
    try {
      const storedUsername = await Storage.getItem('username');
      const storedAvatar = await Storage.getItem('avatar');
      const storedUserId = await Storage.getItem('userId');

      if (storedUsername) setUsername(storedUsername);
      if (storedAvatar) setAvatar(storedAvatar);
      if (storedUserId) setUserId(storedUserId);

      console.log('Profile loaded:', { storedUsername, storedAvatar, storedUserId });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Update username and persist it
  const updateUsername = async (newUsername: string) => {
    try {
      setUsername(newUsername);
      await Storage.setItem('username', newUsername);
      console.log('Username updated:', newUsername);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  // Update avatar and persist it
  const updateAvatar = async (newAvatar: string) => {
    try {
      setAvatar(newAvatar);
      await Storage.setItem('avatar', newAvatar);
      console.log('Avatar updated:', newAvatar);
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  // Update userId and persist it
  const updateUserId = async (newUserId: string) => {
    try {
      setUserId(newUserId);
      await Storage.setItem('userId', newUserId);
      console.log('UserId updated:', newUserId);
    } catch (error) {
      console.error('Error updating userId:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    username,
    avatar,
    userId,
    updateUsername,
    updateAvatar,
    updateUserId,
  };
}