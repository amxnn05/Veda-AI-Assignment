import { create } from 'zustand';

interface UserState {
  user: {
    name: string;
    schoolName: string;
    location: string;
    avatar: string;
  } | null;
  setUser: (user: UserState['user']) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    name: 'John Doe',
    schoolName: 'Delhi Public School',
    location: 'Bokaro Steel City',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=School',
  },
  setUser: (user) => set({ user }),
}));
