export type WebSocketAction =
  | 'DELETE_NOTE'
  | 'ADD_NOTE'
  | 'UPDATE_NOTES'
  | 'INIT_WS_CONNECTION'
  | 'SERVER_UPDATED_NOTES'
  | 'SERVER_DELETED_NOTE'
  | 'SERVER_ADDED_NOTE';

export const waitForSocketToBeOpen = (ws: WebSocket, payload: any, callback: Function) => {
  setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      waitForSocketToBeOpen(ws, payload, callback);
    } else {
      callback();
    }
  }, 20);
};

export const sendPayloadToServer = (ws: WebSocket, action: WebSocketAction, payload: any) => {
  ws.send(JSON.stringify({ action, payload }));
};
