import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';

import NavMenu from './NavMenu';

describe('NavMenu tests', () => {
  test('NavMenu renders', () => {
    render(<NavMenu user="test" avatar="mockAvatar" setView={jest.fn()} />);
  });

  test('NavMenu when I click a button setView is called', () => {
    const mockMenu = jest.fn();
    render(<NavMenu user="test" avatar="mockAvatar" setView={mockMenu} />);
    const navButtons = screen.getAllByRole('button');
    navButtons.forEach((button) => {
      fireEvent.click(button);
    });
    expect(mockMenu).toBeCalledTimes(4);
  });
});
