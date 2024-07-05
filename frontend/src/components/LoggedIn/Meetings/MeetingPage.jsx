import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Transcription from './MeetingPage/Transcription';
import Summary from './MeetingPage/Summary';
import MeetingTodos from './MeetingPage/MeetingTodos';

import styles from './MeetingPage.module.css';

const MeetingPage = () => {
  const { id, organisation } = useParams();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [team, setTeam] = useState(null);
  const [transcriptionGenerated, setTranscriptionGenerated] = useState(false)

  useEffect(() => {
    getMeetingDetails();
  }, []);

  const getMeetingDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-meeting-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          organisation: organisation,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred adding the user.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTitle(data.id);
      setDate(data.date);
      setType(data.type);
      setTeam(data.team);
      setTranscriptionGenerated(data.transcriptionGenerated)
    } catch (error) {
      console.log('Error: ', error);
    }

    // to be removed after end point works
    setTitle('Meeting Title');
    setDate('Meeting Date');
    setType('organisation');
    setTeam('team name');
    setTranscriptionGenerated(true)

  };

  return (
    <div className={styles.meetingPage}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{date}</div>
      </div>
      <div className={styles.sections}>
        <div className={styles.thissection}>
          <Transcription type={type} team={team} organisation={organisation} meetingid={id} />
        </div>
        {transcriptionGenerated && <div>
            <div>
              <Summary />
            </div>
            <div>
              <MeetingTodos />
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default MeetingPage;
