import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfileView from '../../AdminPages/UserProfileView/UserProfileView'; // We can reuse the detailed view component!
import './publicBucketView.scss';

const PublicBucketView = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [bucket, setBucket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        // Note the public API endpoint
        const res = await axios.get(`http://localhost:5000/api/public/bucket/${shareToken}`);
        if (res.data.bucket && res.data.bucket.profiles.length > 0) {
          setBucket(res.data.bucket);
        } else {
          setError('This bucket is empty or could not be found.');
        }
      } catch (err) {
        setError('Failed to fetch bucket details. The link may be invalid.');
      } finally {
        setLoading(false);
      }
    };

    fetchBucket();
  }, [shareToken]);

  const handleNext = () => {
    if (bucket && currentIndex < bucket.profiles.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  };

  if (loading) return <div className="public-bucket-container"><p className="message">Loading profiles...</p></div>;
  if (error) return <div className="public-bucket-container"><p className="message error">{error}</p></div>;

  const currentProfile = bucket?.profiles[currentIndex];

  return (
    <div className="my-profile-container">
      <div className="public-bucket-header">
        <h1>{bucket.name}</h1>
        <p>Viewing profile {currentIndex + 1} of {bucket.profiles.length}</p>
      </div>
      <div className="public-navigation">
        <button onClick={handlePrevious} disabled={currentIndex === 0}>
          Previous Profile
        </button>
        <button onClick={handleNext} disabled={!bucket || currentIndex === bucket.profiles.length - 1}>
          Next Profile
        </button>
      </div>
      {/* We are reusing the UserProfileView component but passing the profile data directly */}
      {currentProfile && (
        <UserProfileView
          profileData={currentProfile}
          isPublicView={true} // Pass a prop to hide admin-only controls if any
        />
      )}
    </div>
  );
};

export default PublicBucketView;
