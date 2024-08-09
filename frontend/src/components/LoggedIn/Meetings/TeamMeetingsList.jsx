import React, { useEffect, useState } from 'react';
import styles from './TeamMeetingsList.module.css';

import Loading from '../../ui/Loading';

const TeamMeetingsList = ({ teamName, organisationName, goToMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false)

  const getTeamMeetings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-team-meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: teamName,
          organisation: organisationName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching your organisations.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setMeetings(data.teams);
    } catch (error) {
      console.log('ERROR');
    }
    setLoading(false)
  };

  useEffect(() => {
    if (teamName) {
      getTeamMeetings();
    } else {
        setMeetings([])
    }
  }, [teamName]);

  return (
    <div>
      {loading ? <Loading /> : !meetings || meetings.length === 0 ? (
        <p>No meetings available for the team.</p>
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

export default TeamMeetingsList;
