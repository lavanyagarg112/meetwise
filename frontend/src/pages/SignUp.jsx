import React, { useState } from 'react';
import classes from './SignUp.module.css';

import SignUpForm from '../components/Authentication/SignUpForm';
import LogInForm from '../components/Authentication/LogInForm';

const SignUp = () => {
  const [isLogIn, setIsLogIn] = useState(false);

  const setLogIn = () => {
    setIsLogIn(true);
  };

  const setSignUp = () => {
    setIsLogIn(false);
  };

  return (
    <div className={classes.signupContainer}>
      <h1>Welcome!</h1>
      <div className={classes.tabs}>
        <div
          className={`${classes.tab} ${!isLogIn ? classes.active : ''}`}
          onClick={setSignUp}
        >
          Sign Up
        </div>
        <div
          className={`${classes.tab} ${isLogIn ? classes.active : ''}`}
          onClick={setLogIn}
        >
          Log In
        </div>
      </div>
      <div className={classes.content}>
        {isLogIn ? (
          <LogInForm />
        ) : (
          <SignUpForm />
        )}
      </div>
    </div>
  );
};

export default SignUp;
