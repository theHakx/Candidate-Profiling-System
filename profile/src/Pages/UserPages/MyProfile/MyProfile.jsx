import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfileView from '../../AdminPages/UserProfileView/UserProfileView';
import './myProfile.scss';
import { jwtDecode } from 'jwt-decode';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setError('Profile not found. Please create your profile first.');
        }
      } catch (err) {
        setError('Failed to fetch your profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleGenerateLink = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const shareUrl = `${window.location.origin}/public/profile/${userId}`;
    navigator.clipboard.writeText(shareUrl);
    showSuccessMessage('Sharing link copied to clipboard!');
  };

  if (loading) return <div className="my-profile-container"><p>Loading profile...</p></div>;
  if (error) return <div className="my-profile-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="my-profile-container">
      {successMessage && <div className="successMessage">{successMessage}</div>}
      <div className="profile-actions-header">
        <button className="generate-link-btn" onClick={handleGenerateLink}>Generate Sharing Link</button>
      </div>
      <UserProfileView profileData={profile} isPublicView={false} />
    </div>
  );
};

export default MyProfile;