import { useState, useContext, Dispatch, useEffect } from 'react';
import { WSContext } from 'providers/WSProvider';

export const useOfflineMode = (
  intialValue?: boolean
): [boolean | undefined, (mode: boolean) => void] => {
  const [mode, setMode] = useState(intialValue);
  const { webSocket, openNewSocket } = useContext(WSContext);

  useEffect(() => {
    window.addEventListener('online', () => {
      setMode(false);
      openNewSocket();
    });
    window.addEventListener('offline', () => {
      setMode(true);
    });
  }, []);

  useEffect(() => {
    if (mode) {
      webSocket.close();
    } else {
      openNewSocket();
    }
  }, [mode]);

  return [mode, setMode];
};
