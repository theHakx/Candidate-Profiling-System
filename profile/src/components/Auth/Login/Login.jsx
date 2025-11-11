import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './login.scss'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email: email.toLowerCase(),
        password,
      });

      localStorage.setItem('token', res.data.token);

      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <div className="loginContainer">
        <form action="" className="loginForm" onSubmit={handleLogin}>
          <h2 className="loginTitle">Login</h2>
          {error && <p className='errorMessage'>{error}</p>}

          <input 
            type="email"
            placeholder='Email'
            className='loginInput'
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
           />

           <input 
            type="password"
            placeholder='password'
            className='loginInput'
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type='submit' className='loginButton'>Login</button>

          <p className="loginRedirect">
            Don't have an account?{' '}
            <Link to="/register" className="loginRedirectLink">Register</Link>
          </p>
          <p className="loginRedirect">
            <Link to="/forgot-password" className="forgotPasswordLink" style={{color:'#60a5fa'}}>
              Forgot Password?
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;