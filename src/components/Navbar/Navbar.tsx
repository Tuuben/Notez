import React, { useContext } from 'react';
import { useOfflineMode } from 'hooks/useOfflineMode';
import { NotesContext } from 'providers/NotesProvider';

export const Navbar = () => {
  const { addNote } = useContext(NotesContext);
  const [offlineMode, setOfflineMode] = useOfflineMode(false);

  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
  };

  return (
    <div>
      {offlineMode && <div className="offline-banner">You're currently offline 🤖💥</div>}
      <div className="navbar">
        <button className="button" onClick={toggleOfflineMode}>
          {offlineMode ? 'Go online' : 'Go offline'}
        </button>
        <button className="button" onClick={addNote}>
          Add new note
        </button>
      </div>
    </div>
  );
};
