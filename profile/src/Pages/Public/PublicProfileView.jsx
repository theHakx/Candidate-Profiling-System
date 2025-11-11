import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserProfileView from '../AdminPages/UserProfileView/UserProfileView';
import './PublicProfileView.scss';

const PublicProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/public/profile/${id}`);
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        setError('Failed to fetch profile. The link may be invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  if (loading) return <div className="public-profile-container"><p>Loading profile...</p></div>;
  if (error) return <div className="public-profile-container"><p className="error-message">{error}</p></div>;

  return (
    // Use the same container as MyProfile.jsx for consistent styling
    <div className="my-profile-container">
      {/* The isPublicView prop will hide the back button */}
      {profile && <UserProfileView profileData={profile} isPublicView={true} />}
    </div>
  );
};

export default PublicProfileView;