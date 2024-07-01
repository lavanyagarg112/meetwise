import React from 'react';
import styles from './OrganisationMeetingsList.module.css';

const OrganisationMeetingsList = ({ meetings, goToMeeting }) => {
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
