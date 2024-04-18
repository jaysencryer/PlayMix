import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';

import { SpotifyProvider } from '../../context/SpotifyContext';
import NavMenu from './NavMenu';

const mockProfile = {
  spotifyProfile: { user: 'test', avatar: 'test.jpg' },
};

describe('NavMenu tests', () => {
  test('NavMenu renders', () => {
    render(
      <SpotifyProvider profile={mockProfile}>
        <NavMenu setView={jest.fn()} />
      </SpotifyProvider>,
    );
  });

  test('NavMenu when I click a button setView is called', () => {
    const mockMenu = jest.fn();
    render(
      <SpotifyProvider profile={mockProfile}>
        <NavMenu setView={mockMenu} />
      </SpotifyProvider>,
    );
    const navButtons = screen.getAllByRole('button');
    navButtons.forEach((button) => {
      fireEvent.click(button);
    });
    expect(mockMenu).toBeCalledTimes(3);
  });
});
