import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import './UserDashboard.scss';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setName(decoded.name);
    } catch (error) {
      console.error("Invalid token:", error);
      handleLogout();
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
        calculateCompletion(res.data.profile);
      } catch (err) {
        console.error("Could not fetch profile", err);
        // If no profile, they need to create one. Completion is 0.
        calculateCompletion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const calculateCompletion = (userProfile) => {
    if (!userProfile) {
      setProfileCompletion(0);
      return;
    }
    const fields = ['firstName', 'surname', 'department', 'gender', 'age', 'city', 'professionalSummary'];
    const filledFields = fields.filter(field => userProfile[field]);
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="userDashboardContainer"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="userDashboardContainer">
      <div className="userDashboardContent">
        <h1 className="userDashboardTitle">Welcome back, {name}!</h1>
        <div className="dashboard-card">
          <p>Your profile is <strong>{profileCompletion}%</strong> complete. Keep it updated to showcase your skills and experience.</p>
          <div className="completion-bar"><div className="completion-progress" style={{ width: `${profileCompletion}%` }}></div></div>
          <button className="profile-button" onClick={() => navigate('/profile')}>
            <span>View & Edit Profile</span>
            <span className="arrow-icon">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;