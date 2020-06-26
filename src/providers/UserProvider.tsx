import React, { Props, createContext, useState, useEffect } from 'react';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { AppUser } from 'types/user';

const availableColors = [
  '#ff00bc',
  '#00fff3',
  '#00ff43',
  '#542cf3',
  '#f32c63',
  '#9d2cf3',
  '#f36c2c',
];
const emojis = [
  '😊',
  '🙃',
  '🤪',
  '🤓',
  '🤯',
  '😴',
  '🥺',
  '👻',
  '🙉',
  '🤖',
  '👾',
  '🐺',
  '🦊',
  '🦝',
  '🐯',
  '🐴',
  '🐏',
  '🐼',
  '🦡',
  '🦆',
];

export const UserContext = createContext<{ user: AppUser | undefined }>({
  user: undefined,
});

const UserProvider = ({ children }: Props<any>) => {
  const { setSingleLocalStorageItem, getLocalStorageItems } = useLocalStorage();
  const [user, setUser]: [AppUser | undefined, Function] = useState();

  useEffect(() => {
    const savedUser: AppUser = getLocalStorageItems('USER');

    if (!!savedUser) {
      setUser(savedUser);
    } else {
      const newUser = createNewUser();
      setUser(newUser);
      setSingleLocalStorageItem('USER', newUser);
    }
  }, []);

  const createNewUser = (): AppUser => {
    return {
      id: Math.round(Math.random() * 99999),
      userEmoji: emojis[Math.round(Math.random() * emojis.length - 1)] || emojis[0],
      userColor:
        availableColors[Math.round(Math.random() * availableColors.length - 1)] ||
        availableColors[0],
    };
  };

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};

export default UserProvider;
