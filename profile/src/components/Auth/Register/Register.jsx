import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";

const Register = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/signup", {
        name,
        surname,
        username,
        email: email.toLowerCase(),
        password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="registerContainer">
      <form className="registerForm" onSubmit={handleRegister}>
        <h2 className="registerTitle">Register</h2>
        {error && <p className="errorMessage">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="registerInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
          <input
          type="text"
          placeholder="Surname"
          className="registerInput"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          />
        <input
          type="text"
          placeholder="Username"
          className="registerInput"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="registerInput"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="registerInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="registerButton">
          Register
        </button>
        <p className="registerRedirect">
          Already have an account?{" "}
          <Link to="/login" className="registerRedirectLink">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
