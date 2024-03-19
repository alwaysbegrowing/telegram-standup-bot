import { createContext, useContext } from 'react';

export const themes = ['light', 'dark'] as const;
export type ThemeType = (typeof themes)[number];
export type UserType = {
  photo_url: string;
  first_name: string;
  role: string;
  username: string;
  groups?: string;
};

interface Prefers {
  themeType: ThemeType;
  userInfo: UserType;
  setUserDetails: (user: UserType) => void;
  switchTheme: (type: ThemeType) => void;
}

export const PrefersContext = createContext<Prefers>({
  themeType: 'dark',
  userInfo: null,
  setUserDetails: () => {},
  switchTheme: () => {},
});

export const usePrefers = (): Prefers => useContext(PrefersContext);
