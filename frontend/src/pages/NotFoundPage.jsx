import React from 'react';
import { Link } from 'react-router-dom';
import classes from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <div className={classes.notFoundContainer}>
      <h1 className={classes.title}>404 - Page Not Found</h1>
      <p className={classes.message}>The page you are looking for does not exist.</p>
      <Link to="/" className={classes.homeLink}>Go to Home</Link>
    </div>
  );
};

export default NotFoundPage;
