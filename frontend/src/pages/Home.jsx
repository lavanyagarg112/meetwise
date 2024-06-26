import classes from './Home.module.css'

import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className={classes.landingcontainer}>
      <div className={classes.landingcontainer}>
        <h1 className={classes.landingtitle}>Meet Space</h1>
        <p className={classes.landingsubtitle}>Make meetings more productive</p>
        <div className={classes.register}><Link to='/sign-up'>Register Now</Link></div>
      </div>
      <div className={classes.featuresguide}>
          <h2>Tagline</h2>
          <ul>
              <li>Feature 1</li>
              <li>Feature 1</li>
              <li>Feature 1</li>
              <li>Feature 1</li>
              <li>Feature 1</li>
              <li>Feature 1</li>
              <li>Feature 1</li>
          </ul>
      </div>

    </div>
  );
};

export default Home;
