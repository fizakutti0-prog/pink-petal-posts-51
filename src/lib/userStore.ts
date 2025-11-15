import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  bio?: string;
}

const USER_STORAGE_KEY = "anonymous_user";

// Generate a random username
const generateUsername = () => {
  const adjectives = ["Happy", "Lucky", "Sunny", "Pink", "Sweet", "Cute", "Lovely", "Dreamy"];
  const nouns = ["Bunny", "Kitten", "Puppy", "Bird", "Star", "Moon", "Heart", "Cloud"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 9999)}`;
};

// Get random pink color
const getRandomPinkColor = () => {
  const pinks = ["#FF1493", "#FF69B4", "#FFB6C1", "#FFC0CB", "#FF10F0", "#C71585"];
  return pinks[Math.floor(Math.random() * pinks.length)];
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const createAnonymousUser = async (): Promise<User> => {
  const username = generateUsername();
  const display_name = username;
  const avatar_color = getRandomPinkColor();

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, display_name, avatar_color }])
    .select()
    .single();

  if (error) throw error;

  const user = data as User;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const loginWithUserId = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const user = data as User;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};
