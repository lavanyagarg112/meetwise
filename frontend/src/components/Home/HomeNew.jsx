import React from 'react';
import { Link } from 'react-router-dom';
import classes from './Home.module.css';
import video from './assets/meetwise2-home-page.mp4'

const HomeNew = () => {
  return (
    <div>
      <video src={video} autoPlay muted loop className={classes.video} />
      {/* <div className={classes.content}> */}
        <div className={classes.landingcontainer}>
          <h1 className={classes.landingtitle}>MeetWise</h1>
          <p className={classes.landingsubtitle}>Make meetings more productive</p>
          <div className={classes.register}><Link to='/sign-up'>Register Now</Link></div>
        </div>
      {/* </div> */}
    </div>
  );
};

export default HomeNew;
