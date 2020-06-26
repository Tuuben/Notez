import React, {
  createContext,
  Props,
  useEffect,
  useState,
  ChangeEvent,
  useContext,
  useRef,
} from 'react';
import { Note } from 'types/note';
import { WSContext, WebSocketData } from './WSProvider';
import { Subscription } from 'rxjs';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { UserContext } from './UserProvider';

interface NotesContext {
  notes: Note[];
  moveNoteUp: (note: Note) => void;
  moveNoteDown: (note: Note) => void;
  changeNoteContent: (ev: ChangeEvent<HTMLTextAreaElement>, note: Note) => void;
  addNote: () => void;
  deleteNote: (note: Note) => void;
  setNoteSelected: (note: Note, selected: boolean) => void;
}

export const NotesContext = createContext<NotesContext>({
  notes: [],
  moveNoteUp: (note: Note) => {},
  moveNoteDown: (note: Note) => {},
  changeNoteContent: (ev: ChangeEvent<HTMLTextAreaElement>, note: Note) => {},
  addNote: () => {},
  deleteNote: (note: Note) => {},
  setNoteSelected: (note: Note, selected: boolean) => {},
});

const NotesProvider = ({ children }: Props<any>) => {
  const [notes, setNotes]: [Note[], Function] = useState([]);
  const [messageSub, setMessageSub]: [Subscription | undefined, Function] = useState();
  const notesRef = useRef<Note[]>();
  notesRef.current = notes;
  const { getLocalStorageItems, setLocalStorageItems, clearLocalStorageItems } = useLocalStorage();
  const { webSocket, $onMessage, sendToSocket } = useContext(WSContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const subscription = $onMessage.subscribe(_onWSMessageReceived);
    setMessageSub(subscription);

    return () => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    console.log('Reconnecting ...');

    // Unsub old observer
    if (!!messageSub && !messageSub.closed) {
      messageSub.unsubscribe();
    }

    const subscription = $onMessage.subscribe(_onWSMessageReceived);
    setMessageSub(subscription);
  }, [$onMessage]);

  const _wsIsOpen = () => {
    return !!webSocket && webSocket.readyState === WebSocket.OPEN;
  };

  const _onWSMessageReceived = (socketData: WebSocketData | null | undefined) => {
    if (!socketData) {
      return;
    }

    const { action, payload } = socketData;

    if (action === 'INIT_WS_CONNECTION') {
      if (!notes || !notes.length) {
        setNotes(payload);
      } else {
        // Ugly merge hack
        const updatedNotes = getLocalStorageItems('UPDATED_NOTES');
        if (updatedNotes) {
          // If has locally updated notes merge with incoming
          _mergeNotes(updatedNotes, payload);
          _pushLocalUpdatedCardsToWS();
        } else {
          // Just merge incoming with existing
          _mergeNotes(payload);
        }

        _pushLocalAddedCardsToWS();
        _pushLocalDeletedCardsToWS();
      }
    }

    if (action === 'SERVER_UPDATED_NOTES') {
      _mergeNotes(payload);
    }

    if (action === 'SERVER_ADDED_NOTE') {
      const currentNotes = notesRef.current || [];
      setNotes([...currentNotes, payload]);
    }

    if (action === 'SERVER_DELETED_NOTE') {
      const currentNotes = notesRef.current || [];
      const updatedNotes = currentNotes.filter((c) => c.id !== payload.id);
      setNotes([...updatedNotes]);
    }
  };

  const _mergeNotes = (mergeNotes: Note[], mergeIntoNotes?: Note[]) => {
    const currentNotes = mergeIntoNotes ? mergeIntoNotes : notesRef.current || [];
    if (!!mergeNotes && mergeNotes.length && currentNotes.length) {
      const updatedNotes = currentNotes.map((note) => {
        const newNoteReplacement = mergeNotes.find((newNote) => newNote.id === note.id);

        if (!newNoteReplacement) {
          return note;
        }

        const merged = { ...note, ...newNoteReplacement };
        return merged;
      });

      setNotes([...updatedNotes]);
    }
  };

  const _pushLocalDeletedCardsToWS = () => {
    const deletedCards: Note[] = getLocalStorageItems('DELETED_NOTES');

    if (!!deletedCards) {
      deletedCards.forEach((note) => {
        sendToSocket('DELETE_NOTE', note);
      });

      clearLocalStorageItems('DELETED_NOTES');
    }
  };

  const _pushLocalAddedCardsToWS = () => {
    const addedCards: Note[] = getLocalStorageItems('ADDED_NOTES');
    if (!!addedCards) {
      addedCards.forEach((note) => {
        sendToSocket('ADD_NOTE', note);
      });
      clearLocalStorageItems('ADDED_NOTES');
    }
  };

  const _pushLocalUpdatedCardsToWS = () => {
    const updatedCards: Note[] = getLocalStorageItems('UPDATED_NOTES');
    if (!!updatedCards && !!updatedCards.length) {
      sendToSocket('UPDATE_NOTES', updatedCards);
      clearLocalStorageItems('UPDATED_NOTES');
    }
  };

  const _updateNotes = (updatedNotes: Note[]) => {
    if (!_wsIsOpen()) {
      setLocalStorageItems('UPDATED_NOTES', updatedNotes);
    }

    _mergeNotes(updatedNotes);
  };

  const changeNoteContent = (ev: ChangeEvent<HTMLTextAreaElement>, note: Note) => {
    note.content = ev.target.value;
    setNotes([...notes]);

    const updatedNote = { id: note.id, content: ev.target.value };

    _updateNotes([updatedNote]);
  };

  const setNoteSelected = (note: Note, selected: boolean) => {
    if (!selected) {
      note.selected = {};
      // setNotes([...notes]);
    } else {
      note.selected = user;
    }

    setNotes([...notes]);

    const updatedNote: Note = {
      id: note.id,
      selected: note.selected,
      content: note.content,
    };

    if (_wsIsOpen()) {
      sendToSocket('UPDATE_NOTES', [updatedNote]);
    }
  };

  const moveNoteUp = (note: any) => {
    const sortedNoteList = notes.sort((a, b) =>
      a.location && b.location && a.location < b.location ? 1 : -1
    );
    const index = sortedNoteList.findIndex((n) => n.id === note.id);

    if (index < 0) {
      return;
    }

    const oldLocation = note.location;
    const newLocation = sortedNoteList[index - 1].location;

    const currentNoteAtLocation = notes[index - 1];
    const updatedNotes: Note[] = [];

    currentNoteAtLocation.location = oldLocation;
    updatedNotes.push({ id: currentNoteAtLocation.id, location: currentNoteAtLocation.location });

    note.location = newLocation;
    updatedNotes.push({ id: note.id, location: note.location });

    if (_wsIsOpen()) {
      sendToSocket('UPDATE_NOTES', updatedNotes);
    }

    _updateNotes(updatedNotes);
  };

  const moveNoteDown = (note: any) => {
    const sortedNoteList = notes.sort((a, b) =>
      a.location && b.location && a.location < b.location ? 1 : -1
    );
    const index = sortedNoteList.findIndex((c) => c.id === note.id);

    const oldLocation = note.location;
    const newLocation = sortedNoteList[index + 1].location;

    const currentNoteAtLocation = notes[index + 1];
    const updatedNotes: Note[] = [];

    // Update location of note at current position
    if (currentNoteAtLocation) {
      currentNoteAtLocation.location = oldLocation;
      updatedNotes.push(currentNoteAtLocation);
    }

    // Update current note location
    note.location = newLocation;
    updatedNotes.push(note);

    if (_wsIsOpen()) {
      sendToSocket('UPDATE_NOTES', updatedNotes);
    }
    _updateNotes(updatedNotes);
  };

  const deleteNote = (note: any) => {
    const newCards = notes.filter((c) => c.id !== note.id);
    setNotes(newCards);

    if (!_wsIsOpen()) {
      setLocalStorageItems('DELETED_NOTES', [note]);
    } else {
      sendToSocket('DELETE_NOTE', note);
    }
  };

  const addNote = () => {
    const id = new Date().getTime().toString();

    const sortedNotes = notes.sort((a, b) =>
      a.location && b.location && a.location <= b.location ? 1 : -1
    );
    const lastLocation = sortedNotes[0] ? sortedNotes[0].location : 1;
    const location = !!lastLocation ? lastLocation + 10 : 0;

    const note: Note = {
      location,
      content: 'Write something clever...',
      id,
    };

    console.log('added note ', note);

    setNotes([...notes, note]);

    if (!_wsIsOpen()) {
      setLocalStorageItems('ADDED_NOTES', [note]);
    } else {
      sendToSocket('ADD_NOTE', note);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        moveNoteUp,
        moveNoteDown,
        changeNoteContent,
        addNote,
        deleteNote,
        setNoteSelected,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export default NotesProvider;
