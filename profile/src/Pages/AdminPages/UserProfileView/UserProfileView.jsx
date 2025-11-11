import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserProfileView.scss';

const getInitials = (firstName, surname) => {
  if (!firstName || !surname) return '';
  return `${firstName.slice(0, 1)}${surname.slice(0, 1)}`.toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const UserProfileView = ({ profileData, isPublicView = false }) => {
  const { id } = useParams(); // This will be the user ID
  const navigate = useNavigate();
  const [profile, setProfile] = useState(profileData || null);
  const [loading, setLoading] = useState(!profileData);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // If profileData is passed as a prop, use it directly.
    // This is crucial for the public bucket view where we cycle through profiles.
    if (profileData) {
      setProfile(profileData);
      setLoading(false);
      setImageError(false); // Reset image error state when profile changes
      return;
    }

    // Only fetch if profileData is NOT provided (i.e., when viewing from admin panel directly)
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/admin/userProfiles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
        setImageError(false);
      } catch (err) {
        setError('Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, profileData]);

  if (loading) return <p className="loading-message">Loading profile...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!profile) return <p>No profile found for this user.</p>;

  const imageUrl = profile.profilePicture?.startsWith('/')
    ? `http://localhost:5000${profile.profilePicture}`
    : profile.profilePicture;

  return (
    <div className="userProfileViewContainer">
      {!isPublicView && <button onClick={() => navigate(-1)} className="backButton">
         Back
      </button>}

      <div className="profileCard">
        <header className="profileCardHeader">
          <div className="profilePicture">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={`${profile.firstName.slice(0, 1)} ${profile.surname.slice(0, 1)}`}
                onError={() => setImageError(true)}
              />
            ) : (
              <span>{getInitials(profile.firstName, profile.surname)}</span>
            )}
          </div>
          <div className="userInfo">
            <h1>{profile.firstName} {profile.surname}</h1>
            <h2>{profile.jobTitle || profile.department}</h2>
          </div>
        </header>

        <div className="profileCardBody">
          <div className="profileSection">
            <h3>Professional Summary</h3>
            <p>{profile.professionalSummary || 'N/A'}</p>
          </div>

          <div className="profileGrid">
            <div className="profileSection">
              <h3>Contact & Personal</h3>
              <ul className="detailsList">
                <li><strong>Email:</strong> {profile.user?.email || 'N/A'}</li>
                <li><strong>Phone:</strong> {profile.phoneNumber || 'N/A'}</li>
                <li><strong>ID Number:</strong> {profile.idNumber || 'N/A'}</li>
                <li><strong>Age:</strong> {profile.age || 'N/A'}</li>
                <li><strong>Gender:</strong> {profile.gender || 'N/A'}</li>
                <li><strong>Nationality:</strong> {profile.nationality || 'N/A'}</li>
                <li><strong>Languages:</strong> {profile.languages || 'N/A'}</li>
                <li><strong>City:</strong> {profile.city || 'N/A'}</li>
                <li><strong>Address:</strong> {profile.address || 'N/A'}</li>
              </ul>
            </div>

            <div className="profileSection">
              <h3>Education</h3>
              {profile.education?.length > 0 ? (
                profile.education.map((edu, i) => (
                  <div key={i} className="educationItem">
                    <p className="degree">
                      {edu.highestLevel || 'N/A'} in {edu.fieldOfStudy || 'N/A'}
                    </p>
                    <p className="university">{edu.university} ({edu.graduationYear || 'N/A'})</p>
                  </div>
                ))
              ) : <p>N/A</p>}
            </div>

            <div className="profileSection">
              <h3>Experience</h3>
              {profile.experience?.length > 0 ? (
                profile.experience.map((exp, i) => (
                  <div key={i} className="experienceItem">
                    <p className="jobTitle">{exp.title} at {exp.company}</p>
                    <p className="jobDescription">{exp.description}</p>
                  </div>
                ))
              ) : <p>N/A</p>}
            </div>

            <div className="profileSection">
              <h3>Certifications</h3>
              <ul className="detailsList">
                {profile.certifications?.length > 0 ? (
                  profile.certifications.map((cert, i) => <li key={i}>{cert}</li>)
                ) : <li>N/A</li>}
              </ul>
            </div>

            <div className="profileSection">
              <h3>Skills</h3>
              <div className="tags">
                {profile.skills?.length > 0 ? (
                  profile.skills.map((skill, i) => <span key={i} className="tag">{skill}</span>)
                ) : <p>N/A</p>}
              </div>
            </div>

            <div className="profileSection">
              <h3>Interests & Vocations</h3>
              <div className="tags">
                {profile.intrestsAndVocations?.length > 0 ? (
                  profile.intrestsAndVocations.map((interest, i) => <span key={i} className="tag interest">{interest}</span>)
                ) : <p>N/A</p>}
              </div>
            </div>

            <div className="profileSection">
              <h3>Online Presence</h3>
              <ul className="detailsList social-links">
                {profile.linkedinProfiles && (
                  <li><a href={profile.linkedinProfiles} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                )}
                {profile.githubProfiles && (
                  <li><a href={profile.githubProfiles} target="_blank" rel="noopener noreferrer">GitHub</a></li>
                )}
                {profile.website && (
                  <li><a href={profile.website} target="_blank" rel="noopener noreferrer">Website</a></li>
                )}
                {!profile.linkedinProfiles && !profile.githubProfiles && !profile.website && <li>N/A</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
