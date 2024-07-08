import React from 'react';
import classes from './AboutUs.module.css';

const AboutUs = () => {
  return (
    <div className={classes.aboutus}>
      <h1>About Us</h1>
      <p>Welcome to MeetWise! We are a passionate team dedicated to making your meetings more productive and efficient through the power of generative AI.</p>
      
      <hr className={classes.separator} />
      
      <h2>Our Team</h2>
      <ul>
        <li>Lavanya Garg</li>
        <li>Nikhil Sultania</li>
        <li>Kimaya Wanjari</li>
        <li>Sarthak Wanjari</li>
      </ul>
      
      <hr className={classes.separator} />
      
      <h2>Our Mission</h2>
      <p>Our mission is to transform the way meetings are conducted, making them more productive and insightful. By leveraging AI, we aim to provide real-time analysis, summarization, and task management, helping teams to stay organized and focused.</p>

      <hr className={classes.separator} />
      
      <h2>Our Vision</h2>
      <p>We envision a world where meetings are not just a routine task but a powerful tool for collaboration and innovation. MeetWise aims to be at the forefront of this transformation, making every meeting count.</p>
    </div>
  );
}

export default AboutUs;
