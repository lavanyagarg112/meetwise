import React, { useEffect, useState } from 'react';
import styles from './OrganisationMeetingsList.module.css';

import Loading from '../../ui/Loading';

const OrganisationMeetingsList = ({ organisationName, goToMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setIsLoading] = useState(false)

  const getOrganisationMeetings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-organisation-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: organisationName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setMeetings(data.organisations);
    } catch (error) {
      console.log('ERROR');
    }
    setIsLoading(false)
  };

  useEffect(() => {
    getOrganisationMeetings();
  }, [organisationName]);

  return (
    <div>
      {loading ? <Loading /> : meetings.length === 0 ? (
        <p>No meetings available for the organisation.</p>
      ) : (
        meetings.map((meeting) => (
          <div key={meeting.id} className={styles.meetingItem}>
            <span>{meeting.title}</span>
            <div>
              <span className={styles.meetingDate}>{meeting.date}</span>
              <span className={styles.viewDetails} onClick={() => goToMeeting(meeting.id)}>View Details</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrganisationMeetingsList;
