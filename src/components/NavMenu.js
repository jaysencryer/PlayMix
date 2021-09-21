import React from 'react';

const NavMenu = ({ children }) => (
  <div>
    <ul>
      {children.map((child, index) => (
        <div key={`nv-${index}`}>
          <li style={{ display: 'inline' }}>{child}</li>
        </div>
      ))}
    </ul>
  </div>
);

export default NavMenu;
