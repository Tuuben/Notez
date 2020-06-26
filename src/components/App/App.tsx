import Routes from 'components/Routes/Routes';
import React from 'react';
import { WSProvider } from 'providers/WSProvider';
import NotesProvider from 'providers/NotesProvider';
import UserProvider from 'providers/UserProvider';

const App: React.FC = () => (
  <UserProvider>
    <WSProvider>
      <NotesProvider>
        <Routes />
      </NotesProvider>
    </WSProvider>
  </UserProvider>
);

export default App;
