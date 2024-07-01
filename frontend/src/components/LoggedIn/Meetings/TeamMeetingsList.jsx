import React from 'react';
import styles from './TeamMeetingsList.module.css';

const TeamMeetingsList = ({ meetings, goToMeeting }) => {
  return (
    <div>
      {meetings.length === 0 ? (
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
