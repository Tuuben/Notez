import React, { useContext, KeyboardEvent, useRef, useState } from 'react';
import { NotesContext } from 'providers/NotesProvider';
import { Note } from 'types/note';
import { ReactComponent as ArrowUpSVG } from '../../assets/icons/arrow-up.svg';
import { ReactComponent as ArrowDownSVG } from '../../assets/icons/arrow-down.svg';
import { ReactComponent as DeleteSVG } from '../../assets/icons/delete.svg';
import { UserContext } from 'providers/UserProvider';

interface NoteCardProps {
  style: any;
  note: Note;
  hideMoveUpButton?: boolean;
  hideMoveDownButton?: boolean;
  index?: any;
}

export const NoteCard = ({
  style,
  note,
  hideMoveDownButton,
  hideMoveUpButton,
  index,
}: NoteCardProps) => {
  const { moveNoteDown, moveNoteUp, deleteNote, changeNoteContent, setNoteSelected } = useContext(
    NotesContext
  );
  const { user } = useContext(UserContext);
  const [isFocused, setIsFocused] = useState(false);

  const svgSize = 36;

  const onBlur = () => {
    setNoteSelected(note, false);
    setIsFocused(false);
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  return (
    <div
      className={`${note && note.selected ? 'note-selected' : ''} note `}
      style={{
        ...style,
        borderColor: note.selected ? note.selected?.userColor : 'normal',
      }}
    >
      <div className="editing-indication-row">
        {note.selected && note.selected.userEmoji && (
          <div
            className="user-is-editing"
            style={{ background: note.selected?.userColor || 'normal' }}
          >
            <p className="user-emoji">{note.selected.userEmoji}</p>
            <p> {note.selected.id === user?.id ? 'Editing ...' : 'Someone is editing ..'} </p>
          </div>
        )}
        {isFocused && (
          <div className="">
            <button className="button save-button" onClick={() => setNoteSelected(note, false)}>
              SAVE
            </button>
          </div>
        )}
      </div>
      <textarea
        value={note.content}
        name="content"
        onChange={(ev) => changeNoteContent(ev, note)}
        onClick={() => setNoteSelected(note, true)}
        onFocus={onFocus}
        onBlur={onBlur}
      ></textarea>
      <div className="actions">
        <div className="move-card-actions">
          {!hideMoveUpButton && (
            <button className="icon-button" onClick={() => moveNoteUp(note)}>
              <ArrowUpSVG width={svgSize} height={svgSize} fill="white" />
            </button>
          )}
          {!hideMoveDownButton && (
            <button className="icon-button" onClick={() => moveNoteDown(note)}>
              <ArrowDownSVG width={svgSize} height={svgSize} fill="white" />
            </button>
          )}
          <button className="icon-button" onClick={() => deleteNote(note)}>
            <DeleteSVG height={svgSize} width={svgSize} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};
