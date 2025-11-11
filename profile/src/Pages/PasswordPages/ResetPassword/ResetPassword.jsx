import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ResetPassword.scss';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      const res = await axios.patch(`http://localhost:5000/api/password/resetPassword/${resetToken}`, { password });
      setMessage(res.data.message + ' Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="toast-container">
        {message && <div className="toast success">{message}</div>}
        {error && <div className="toast error">{error}</div>}
      </div>
      <div className="loginContainer">
        <form className="loginForm" onSubmit={handleSubmit}>
          <h2 className="loginTitle">Reset Password</h2>
          <p className="loginRedirect" style={{ marginBottom: '1rem' }}>Enter and confirm your new password.</p>

          <input
            type="password"
            placeholder="New Password"
            className="loginInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="loginInput"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="loginButton" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;