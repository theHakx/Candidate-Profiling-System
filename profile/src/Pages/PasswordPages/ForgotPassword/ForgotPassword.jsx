import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './forgotPassword.scss';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axios.post('http://localhost:5000/api/password/forgotPassword', { email: email.toLowerCase() });
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
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
          <h2 className="loginTitle">Forgot Password</h2>
          <p className="loginRedirect" style={{ marginBottom: '1rem' }}>Enter your email and we'll send you a link to reset your password.</p>

          <input
            type="email"
            placeholder="Your Email"
            className="loginInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="loginButton">Send Reset Link</button>

          <p className="loginRedirect">
            Remember your password? <Link to="/login" className="loginRedirectLink">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;