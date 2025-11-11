import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './userProfile.scss';

const UserProfile = () => {
  // --- Dropdown Options ---
  const educationLevelOptions = ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'];
  const fieldOfStudyOptions = [
    'Physics', 'Chemistry', 'Biology', 'Astronomy', 'Earth Science', 'Environmental Science', 'Oceanography', 'Meteorology',
    'Mathematics', 'Computer Science', 'Statistics', 'Logic', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'Information Systems',
    'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Software Engineering', 'Aerospace Engineering', 'Biomedical Engineering', 'Robotics', 'Nanotechnology',
    'Psychology', 'Sociology', 'Anthropology', 'Political Science', 'Economics', 'Human Geography', 'Archaeology', 'Criminology', 'International Relations',
    'History', 'Philosophy', 'Literature', 'Linguistics', 'Religious Studies', 'Art History', 'Classics', 'Cultural Studies',
    'Visual Arts', 'Music', 'Theater', 'Dance', 'Film Studies', 'Design', 'Photography', 'Architecture',
    'Medicine', 'Nursing', 'Dentistry', 'Pharmacy', 'Public Health', 'Veterinary Medicine', 'Nutrition', 'Kinesiology', 'Physiotherapy',
    'Business Administration', 'Finance', 'Accounting', 'Marketing', 'Human Resource Management', 'Entrepreneurship', 'Supply Chain Management', 'International Business',
    'Law', 'Criminal Justice', 'Legal Studies', 'International Law', 'Constitutional Law', 'Environmental Law',
    'Curriculum & Instruction', 'Educational Leadership', 'Special Education', 'Early Childhood Education', 'Educational Psychology', 'Adult Education',
    'Agriculture', 'Forestry', 'Horticulture', 'Agribusiness', 'Sustainable Development'
  ].sort(); // Sort alphabetically for better UX

  const currentYear = new Date().getFullYear();
  const graduationYearOptions = Array.from(new Array(70), (val, index) => currentYear - index);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    department: '',
    gender: '',
    jobTitle: '',
    age: '',
    city: '',
    phoneNumber: '',
    languages: '',
    professionalSummary: '',
    education: [], // This will now hold *additional* education entries
    skills: [],
    certifications: [],
    intrestsAndVocations: [],
    experience: [],
    profilePicture: '',
    githubProfiles: '',
    linkedinProfiles: '',
    website: '',
  });
  // Separate state for the primary, fixed education section
  const [primaryEducation, setPrimaryEducation] = useState({
    highestLevel: '',
    degreeType: '',
    fieldOfStudy: '',
    university: '',
    graduationYear: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [profileExists, setProfileExists] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [previewSource, setPreviewSource] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      let data = null; // Define data outside the try block
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = response.data; // Assign data from the response
        console.log("Fetched profile data:", data);
        setUserEmail(data.profile?.user?.email || data.email || '');

        if (data.profile) {
          setProfileExists(true);
          // Deep merge to handle nested objects and arrays
          setFormData(prev => ({
            ...prev,
            ...data.profile,
            // Separate primary education from the rest
            education: Array.isArray(data.profile.education) ? data.profile.education.slice(1) : [],
            skills: data.profile.skills || [],
            certifications: data.profile.certifications || [],
            intrestsAndVocations: data.profile.intrestsAndVocations || [],
            experience: data.profile.experience || [],
          }));
        }
        if (data.profile?.education && Array.isArray(data.profile.education) && data.profile.education.length > 0) {
          setPrimaryEducation(data.profile.education[0]);
        }
        if (data.profile?.profilePicture) {
          console.log("Setting preview source from fetched data:", data.profile.profilePicture);
          setPreviewSource(`http://localhost:5000${data.profile.profilePicture}`);
        }
      } catch (err) {
        // It's okay if a profile doesn't exist yet
        console.log("No existing profile found, creating a new one.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrimaryEducationChange = (e) => {
    const { name, value } = e.target;
    setPrimaryEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = [...formData.education];
    updatedEducation[index] = { ...updatedEducation[index], [name]: value };
    setFormData(prev => ({
      ...prev,
      education: updatedEducation,
    }));
  };

  const handleArrayChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value.split(',').map(item => item.trim()) }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = { ...updatedExperience[index], [name]: type === 'checkbox' ? checked : value };
    setFormData(prev => ({ ...prev, experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', location: '', from: '', to: '', current: false, description: '' }] }));
  };

  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, { highestLevel: '', degreeType: '', fieldOfStudy: '', university: '', graduationYear: '' }] }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const showValidationErrors = (errorObject) => {
    // Example error: "Validation failed: education.university: Path `education.university` is required."
    const message = errorObject.response?.data?.error || 'An unknown error occurred.';
    const errorParts = message.replace('Validation failed: ', '').split(', ');
    const newErrors = errorParts.map(part => {
      const [field] = part.split(':');
      // Make it more readable
      const readableField = field.replace('education.', '').replace(/([A-Z])/g, ' $1').toLowerCase();
      return `The ${readableField} is required for an education entry.`;
    });

    setValidationErrors(newErrors);
    setTimeout(() => {
      setValidationErrors([]);
    }, 5000); // Clear errors after 5 seconds
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource(reader.result);
      };
    }
  };

  const handlePictureUpload = async () => {
    if (!selectedFile) return;
    const fileData = new FormData();
    fileData.append('profilePicture', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:5000/api/profile/picture', fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccessMessage('Picture uploaded successfully!');
      // Update the view with the new permanent URL from the server
      setPreviewSource(`http://localhost:5000${data.profilePicture}`);
      // ALSO update the formData state so it gets saved correctly
      setFormData(prev => ({ ...prev, profilePicture: data.profilePicture }));
      setSelectedFile(null); // Clear the selected file after upload
    } catch (err) {
      showValidationErrors({ response: { data: { error: 'Failed to upload picture. Please try again.' } } });
    }
  };

  const handleRemovePicture = async () => {
    setPreviewSource('');
    setSelectedFile(null);

    // If profile doesn't exist yet, no need to call API
    if (!profileExists) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/profile/picture', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(prev => ({ ...prev, profilePicture: '' }));
      showSuccessMessage('Profile picture removed.');
    } catch (err) {
      console.error('Failed to remove picture', err);
      showValidationErrors({ response: { data: { error: 'Failed to remove picture.' } } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Combine primary and additional education into one array for saving
      const fullEducation = [primaryEducation, ...formData.education];

      // Filter out any education entries that are missing required fields
      const validEducation = fullEducation.filter(edu =>
        (edu.university && edu.graduationYear) || (edu.highestLevel && edu.fieldOfStudy)
      );

      const dataToSave = { ...formData, education: validEducation };

      if (profileExists) {
        // Profile exists, so we update it
        await axios.patch('http://localhost:5000/api/profile/update', dataToSave, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccessMessage('Profile updated successfully!');
      } else {
        // No profile, so we create one
        await axios.post('http://localhost:5000/api/profile/create', dataToSave, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileExists(true); // After creation, the profile now exists
        showSuccessMessage('Profile created successfully!');
      }
    } catch (err) {
      if (err.response && err.response.status === 500 && err.response.data.error?.includes('Validation failed')) {
        showValidationErrors(err);
      } else {
        setError('Failed to update profile. Please check your inputs.');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="userProfileContainer"><p>Loading profile...</p></div>;
  }

  return (
    <div className="userProfileContainer">
      <div className="error-toast-container">
        {validationErrors.map((msg, index) => (
          <div key={index} className="error-toast">{msg}</div>
        ))}
      </div>
      {successMessage && <div className="successMessage">{successMessage}</div>}
      <div className="userProfileContent">
        <button onClick={() => navigate('/dashboard')} className="backButton">
          &larr; Back to Dashboard
        </button>
        <h1>Your Profile</h1>
        <p>Keep your information up to date.</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Profile Picture</h2>
            <div className="picture-upload-section">
              <div className="picture-preview">
                {previewSource ? (
                  <img src={previewSource} alt="Profile Preview" />
                ) : (
                  <span>PREVIEW</span>
                )}
              </div>
              <div className="upload-controls">
                <input type="file" id="picture-upload" accept="image/*" onChange={handleFileChange} />
                <div className="file-input-group">
                  <label htmlFor="picture-upload" className="upload-label-btn">Choose File</label>
                </div>
                {previewSource && <button type="button" className="remove-pic-btn" onClick={handleRemovePicture}>Remove Picture</button>}
                {selectedFile && <button type="button" className="upload-btn" onClick={handlePictureUpload}>Upload Picture</button>}
              </div>
            </div>
          </div>
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Surname</label>
                <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="idNumber">ID Number</label>
                <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={userEmail} readOnly disabled style={{ cursor: 'not-allowed', opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <input type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="languages">Languages</label>
                <input type="text" id="languages" name="languages" value={formData.languages} onChange={handleChange} placeholder="e.g., English, Nyanja" />
              </div>
              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Professional Summary</h2>
            <div className="form-group">
              <textarea
                id="professionalSummary"
                name="professionalSummary"
                rows="5"
                value={formData.professionalSummary}
                onChange={handleChange}
                placeholder="Write a brief summary about your professional background..."
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <h2>Education</h2>
            {/* --- Fixed Primary Education Section --- */}
            <div className="form-grid">
              <div className="form-group">
                <label>Highest Level</label>
                <select name="highestLevel" value={primaryEducation.highestLevel} onChange={handlePrimaryEducationChange}>
                  <option value="">Select Level</option>
                  {educationLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Degree Type</label><input type="text" name="degreeType" value={primaryEducation.degreeType} onChange={handlePrimaryEducationChange} /></div>
              <div className="form-group">
                <label>Field of Study</label>
                <select name="fieldOfStudy" value={primaryEducation.fieldOfStudy} onChange={handlePrimaryEducationChange}>
                  <option value="">Select Field</option>
                  {fieldOfStudyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="form-group"><label>University</label><input type="text" name="university" value={primaryEducation.university} onChange={handlePrimaryEducationChange} /></div>
              <div className="form-group">
                <label>Graduation Year</label>
                <select name="graduationYear" value={primaryEducation.graduationYear} onChange={handlePrimaryEducationChange}>
                  <option value="">Select Year</option>
                  {graduationYearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </div>
            <hr className="section-divider" />

            {/* --- Dynamic Additional Education Section --- */}
            {formData.education.map((edu, index) => (
              <div key={index} className="dynamic-section">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Highest Level</label>
                    <select name="highestLevel" value={edu.highestLevel} onChange={(e) => handleEducationChange(index, e)}>
                      <option value="">Select Level</option>
                      {educationLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Degree Type</label><input type="text" name="degreeType" value={edu.degreeType} onChange={(e) => handleEducationChange(index, e)} /></div>
                  <div className="form-group">
                    <label>Field of Study</label>
                    <select name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)}>
                      <option value="">Select Field</option>
                      {fieldOfStudyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>University</label><input type="text" name="university" value={edu.university} onChange={(e) => handleEducationChange(index, e)} /></div>
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <select name="graduationYear" value={edu.graduationYear} onChange={(e) => handleEducationChange(index, e)}>
                      <option value="">Select Year</option>
                      {graduationYearOptions.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" className="remove-button" onClick={() => removeEducation(index)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-button" onClick={addEducation}>+ Add Education</button>
          </div>

          <div className="form-section">
            <h2>Experience</h2>
            {formData.experience.map((exp, index) => (
              <div key={index} className="dynamic-section">
                <div className="form-grid">
                  <div className="form-group"><label>Title</label><input type="text" name="title" value={exp.title} onChange={(e) => handleExperienceChange(index, e)} /></div>
                  <div className="form-group"><label>Company</label><input type="text" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} /></div>
                  <div className="form-group"><label>Location</label><input type="text" name="location" value={exp.location} onChange={(e) => handleExperienceChange(index, e)} /></div>
                  <div className="form-group"><label>From</label><input type="date" name="from" value={exp.from ? exp.from.split('T')[0] : ''} onChange={(e) => handleExperienceChange(index, e)} /></div>
                  <div className="form-group"><label>To</label><input type="date" name="to" value={exp.to ? exp.to.split('T')[0] : ''} onChange={(e) => handleExperienceChange(index, e)} disabled={exp.current} /></div>
                  <div className="form-group checkbox-group"><label>Current Job</label><input type="checkbox" name="current" checked={exp.current} onChange={(e) => handleExperienceChange(index, e)} /></div>
                  <div className="form-group full-width"><label>Description</label><textarea name="description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)} rows="3"></textarea></div>
                </div>
                <button type="button" className="remove-button" onClick={() => removeExperience(index)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-button" onClick={addExperience}>+ Add Experience</button>
          </div>

          <div className="form-section">
            <h2>Skills & Links</h2>
            <div className="form-grid">
              <div className="form-group"><label>GitHub URL</label><input type="text" name="githubProfiles" value={formData.githubProfiles} onChange={handleChange} /></div>
              <div className="form-group"><label>Personal Website</label><input type="text" name="website" value={formData.website} onChange={handleChange} /></div>
              <div className="form-group full-width"><label>Skills (comma-separated)</label><input type="text" value={formData.skills.join(', ')} onChange={(e) => handleArrayChange(e, 'skills')} /></div>
              <div className="form-group full-width"><label>Certifications (comma-separated)</label><input type="text" value={formData.certifications.join(', ')} onChange={(e) => handleArrayChange(e, 'certifications')} /></div>
              <div className="form-group full-width"><label>Interests & Vocations (comma-separated)</label><input type="text" value={formData.intrestsAndVocations.join(', ')} onChange={(e) => handleArrayChange(e, 'intrestsAndVocations')} /></div>
            </div>
          </div>

          {error && <p className="errorMessage">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default UserProfile;