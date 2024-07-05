import React from 'react';
import { Link } from 'react-router-dom';
import classes from './NotFoundPage.module.css';

const NotPermittedPage = () => {
  return (
    <div className={classes.notFoundContainer}>
      <h1 className={classes.title}>403 - Not permitted</h1>
      <p className={classes.message}>You are not permitted to view this page.</p>
      <Link to="/" className={classes.homeLink}>Go to Home</Link>
    </div>
  );
};

export default NotPermittedPage;
