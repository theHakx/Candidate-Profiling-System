import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './sidebar.scss';

const useAuthRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const userRole = useAuthRole();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
    if (isOpen) {
      toggleSidebar();
    }
  };

  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebarToggleContainer">
        <button className="hamburgerButton" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="sidebarContent">
        <div className="sidebarHeader">
          {/* <button className="sidebarCloseButton" onClick={toggleSidebar}>
            &times;
          </button> */}
          <h3 style={{fontSize:'24px'}}>Candidate Profiling System</h3>
        </div>
        <nav className="sidebarNav">
          <Link to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} onClick={handleLinkClick}>
            Dashboard
          </Link>
          {userRole === 'user' && (
            <Link to="/myProfile" onClick={handleLinkClick}>Profile</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin/userProfiles" onClick={handleLinkClick}>User Profiles</Link>
          )}
          {userRole === 'admin' && (
            <Link to="/admin/profileBuckets" onClick={handleLinkClick}>Profile Buckets</Link>
          )}
        </nav>
        <div className="sidebarFooter">
          <button onClick={handleSignOut} className="signOutButton">Sign Out</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;