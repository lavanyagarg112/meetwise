import React, { useEffect, useState } from 'react';
import styles from './OrganisationMeetingsList.module.css';

const DUMMY_DATA = [
  {
    id: 0,
    title: 'meeting 1',
    date: '10-06-2024'
  },
  {
    id: 1,
    title: 'meeting 2',
    date: '10-06-2024'
  },
  {
    id: 3,
    title: 'meeting 3',
    date: '10-06-2024'
  }
];

const OrganisationMeetingsList = ({ organisationName, goToMeeting }) => {
  const [meetings, setMeetings] = useState([]);

  const getOrganisationMeetings = async () => {
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

    // to be removed after endpoint works
    setMeetings(DUMMY_DATA);
  };

  useEffect(() => {
    getOrganisationMeetings();
  }, [organisationName]);

  return (
    <div>
      {meetings.length === 0 ? (
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
