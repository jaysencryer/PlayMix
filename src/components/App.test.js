import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';

import { App } from './App';

import { render, fireEvent, screen } from '@testing-library/react';

describe('App', () => {
  it('renders', () => {
    const { getByText, getByTitle, asFragment } = render(
      <App initialData={{ appName: 'TEST' }} />,
    );
  });
});
