import { render } from '@testing-library/react';
import React from 'react';

import App from './App';

test('Expcect app to exist', () => {
  const app = render(<App />);

  expect(app);
});
