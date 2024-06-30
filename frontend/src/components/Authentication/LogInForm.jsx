import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth-context';
import Card from '../ui/Card';
import classes from './SignUpForm.module.css';

const DUMMY_DATA = {
  id: 0,
  email: 'email@email.com',
  username: 'user1',
  firstName: 'Lavanya'
};

const LogInForm = () => {
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [useEmail, setUseEmail] = useState(true); // Track whether to use email or username
  const navigate = useNavigate();

  const { setIsLoggedIn, setUser, setActiveOrganisation } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userPayload = useEmail ? { email } : { username };
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userPayload,
          password,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUser(data.user);
        setActiveOrganisation(data.activeOrganisation)
        navigate('/');
      } else {
        setLoginError(data.error || 'Invalid Credentials');
      }
    } catch (error) {
      setLoginError('Login Failed');
    }
  };

  return (
    <section>
      <h1>Login</h1>
      <Card>
        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.radioGroup}>
            <label className={classes.radioLabel}>
              <input
                type="radio"
                checked={useEmail}
                onChange={() => setUseEmail(true)}
              />
              Use Email
            </label>
            <label className={classes.radioLabel}>
              <input
                type="radio"
                checked={!useEmail}
                onChange={() => setUseEmail(false)}
              />
              Use Username
            </label>
          </div>
          {useEmail ? (
            <div className={classes.control}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
          ) : (
            <div className={classes.control}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
          )}
          <div className={classes.control}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <div className={classes.actions}>
            <button type="submit">Login</button>
          </div>
          {loginError && <div style={{ color: 'red' }}>{loginError}</div>}
        </form>
      </Card>
    </section>
  );
};

export default LogInForm;
