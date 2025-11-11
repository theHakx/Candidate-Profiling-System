import React from 'react';
import './Navbar.scss';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="navbar">
      <button className="hamburgerButton" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
};

export default Navbar;