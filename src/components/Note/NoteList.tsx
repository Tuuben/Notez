import React, { useContext, useRef, useEffect } from 'react';
import { ListRowProps, AutoSizer, List } from 'react-virtualized';
import { NoteCard } from './NoteCard';
import { NotesContext } from 'providers/NotesProvider';

export const NoteList = () => {
  const { notes } = useContext(NotesContext);

  const renderNote = ({ index, key, style }: ListRowProps) => {
    //TODO: Sort once somewhere else
    const sortedNotes = notes.sort((a, b) =>
      a.location && b.location && a.location <= b.location ? 1 : -1
    );
    const note = sortedNotes[index];
    return (
      <div key={key}>
        <NoteCard
          index={key}
          note={note}
          style={style}
          hideMoveDownButton={index >= notes.length - 1}
          hideMoveUpButton={index <= 0}
        />
      </div>
    );
  };

  return (
    <div className="list-container" style={{ width: '100%', minHeight: '92vh' }}>
      <AutoSizer>
        {({ width, height }) => {
          return (
            <List
              width={width}
              height={height}
              rowHeight={220}
              rowRenderer={renderNote}
              rowCount={notes.length}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};
