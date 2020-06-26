import React, { useContext } from 'react';
import { NoteList } from 'components/Note/NoteList';
import { Navbar } from 'components/Navbar/Navbar';

const Home: React.FC = () => {
  return (
    <div>
      <div className="container">
        <div className="header">
          <h1 className="display-1">NOTEZ</h1>
          <h3 className="subtitle">Write your heart out with strangers.</h3>
        </div>
        <Navbar />
        <NoteList />
      </div>
    </div>
  );
};

export default Home;
