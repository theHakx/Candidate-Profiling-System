import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profileBuckets.scss';
import Modal from '../../../components/Modal/Modal'; // Import the Modal component

const ProfileBuckets = () => {
  const navigate = useNavigate();
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bucketToDelete, setBucketToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/buckets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuckets(res.data.buckets);
      } catch (err) {
        setError('Failed to fetch buckets.');
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteClick = (bucket) => {
    setBucketToDelete(bucket);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bucketToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/buckets/${bucketToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBuckets(currentBuckets => currentBuckets.filter(b => b._id !== bucketToDelete._id));
      showSuccessMessage(`Bucket "${bucketToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setBucketToDelete(null);
    } catch (err) {
      setError('Failed to delete bucket.');
      setIsDeleteModalOpen(false);
    }
  };

  const handleShareClick = (bucket) => {
    const shareUrl = `${window.location.origin}/public/bucket/${bucket.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    showSuccessMessage('Share link copied to clipboard!');
  };

  const filteredBuckets = buckets.filter(bucket =>
    bucket.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="loading-message">Loading buckets...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="profileBucketsContainer">
      {successMessage && <div className="successMessage">{successMessage}</div>}
      <div className="header-controls">
        <div>
          <h1 className="profileBucketsTitle">Profile Buckets</h1>
          <p>Here are the collections of profiles you have created.</p>
        </div>
        <div className="search-wrapper">
          <input
            type="text"
            className="bucket-search"
            placeholder="Search buckets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredBuckets.length === 0 ? (
        <p>You haven't created any buckets yet.</p>
      ) : (
        <div className="bucketsGrid">
          {filteredBuckets.map(bucket => (
            <div key={bucket._id} className="bucketCard">
              <h2>{bucket.name}</h2>
              <div className="profile-count">
                {bucket.profiles.length} {bucket.profiles.length === 1 ? 'Profile' : 'Profiles'}
              </div>
              <div className="profile-preview">
                {bucket.profiles.slice(0, 5).map(p => (
                  <span key={p._id} className="profile-initials">
                    {p.firstName?.charAt(0)}{p.surname?.charAt(0)}
                  </span>
                ))}
              </div>
              <div className="card-actions">
                <button
                  className="share-bucket-btn"
                  onClick={() => handleShareClick(bucket)}
                >
                  Share
                </button>
                <button
                  className="delete-bucket-btn"
                  onClick={() => handleDeleteClick(bucket)}
                >
                  Delete
                </button>
                <button
                  className="view-bucket-btn"
                  onClick={() => navigate(`/admin/bucket/${bucket._id}`)}
                >
                  View Bucket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        {bucketToDelete && (
          <div className="delete-confirmation">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the bucket <strong>"{bucketToDelete.name}"</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="actionButton cancel"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="actionButton delete"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProfileBuckets;