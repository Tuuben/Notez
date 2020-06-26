import React, { Props, useState, useEffect, createContext } from 'react';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { sendPayloadToServer, waitForSocketToBeOpen, WebSocketAction } from 'utils/ws';

const socketUrl = process.env.WS_URL || 'ws://localhost:8000';

export interface WebSocketData {
  action: WebSocketAction;
  payload: any;
  params?: any;
}

interface WSContext {
  webSocket: WebSocket;

  $onMessage: Observable<WebSocketData>;

  sendToSocket: (action: WebSocketAction, payload: any) => void;

  openNewSocket: () => void;
}

export const WSContext = createContext<WSContext>({
  webSocket: new WebSocket(socketUrl),
  $onMessage: new Observable(),
  sendToSocket: () => {},
  openNewSocket: () => {},
});

export const WSProvider = ({ children }: Props<any>) => {
  //  const { webSocket } = useContext(WSContext);
  const [webSocket, setWebSocket]: [WebSocket | undefined, Function] = useState(
    new WebSocket(socketUrl)
  );

  const [$onMessage, setMessageObservable]: [Observable<WebSocketData>, Function] = useState(
    new Observable()
  );

  useEffect(() => {
    if (!webSocket) {
      return;
    }

    webSocket.addEventListener('open', () => {
      console.log('Connected to socket');
    });

    webSocket.addEventListener('error', (err) => {
      console.error(err);
      setWebSocket(new WebSocket(socketUrl));
    });

    webSocket.addEventListener('close', () => {
      console.log('Socket was closed.');
    });

    // ADD socket ping to reconnect

    const $onMessage = fromEvent<WebSocketData>(webSocket, 'message').pipe(
      map((event: any) => {
        try {
          const data: WebSocketData = event.data && JSON.parse(event.data);
          if (!data) {
            return null;
          }

          return data;
        } catch (err) {
          console.error(err);
        }
      })
    );

    setMessageObservable($onMessage);
  }, [webSocket]);

  const sendToSocket = (action: WebSocketAction, payload: any) => {
    if (!webSocket) {
      console.log('Socket is dead ...');
      return;
    }

    if (webSocket.readyState === WebSocket.OPEN) {
      sendPayloadToServer(webSocket, action, payload);
    } else {
      waitForSocketToBeOpen(webSocket, payload, () => {
        sendPayloadToServer(webSocket, action, payload);
      });
    }
  };

  const openNewSocket = () => {
    setWebSocket(new WebSocket(socketUrl));
  };

  return (
    <WSContext.Provider
      value={{
        webSocket,
        openNewSocket,
        sendToSocket,
        $onMessage,
      }}
    >
      {children}
    </WSContext.Provider>
  );
};
