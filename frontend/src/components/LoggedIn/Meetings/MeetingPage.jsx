import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Transcription from './MeetingPage/Transcription';
import Summary from './MeetingPage/Summary';
import MeetingTodos from './MeetingPage/MeetingTodos';

import NotPermittedPage from '../../../pages/NotPermittedPage';
import Loading from '../../ui/Loading';

import styles from './MeetingPage.module.css';
import { useAuth } from '../../../store/auth-context';

const MeetingPage = () => {
  const { id, organisation } = useParams();

  const { user } = useAuth()

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [team, setTeam] = useState(null);
  const [transcriptionGenerated, setTranscriptionGenerated] = useState(false)
  const [isPermitted, setIsPermitted] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getMeetingDetails();
  }, []);

  const getMeetingDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-meeting-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid: id,
          organisation: organisation,
        }),
        credentials: 'include',
      });

      if (response.status === 403) {
        console.log('403 Forbidden: You do not have access to this resource.');
        setIsPermitted(false)
        return;
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred adding the user.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTitle(data.title);
      setDate(data.date);
      setType(data.type);
      setTeam(data.team);
      setIsPermitted(true)
      setTranscriptionGenerated(data.transcriptionGenerated)
    } catch (error) {
      console.log('Error: ', error);
      setIsPermitted(false)
    }
    setLoading(false)
  };

  if (!user || !isPermitted) {
    return <NotPermittedPage />
  }


  return (
    <div className={styles.meetingPage}>
      {loading && <Loading />}
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.date}>{date}</div>
      </div>
      <div className={styles.sections}>
        <div className={styles.thissection}>
          <Transcription type={type} team={team} organisation={organisation} meetingid={id} onconfirm={setTranscriptionGenerated} />
        </div>
        {transcriptionGenerated && <div>
            <div className={styles.thissection}>
              <Summary organisation={organisation} meetingid={id} />
            </div>
            <div className={styles.thissection}>
              <MeetingTodos organisation={organisation} meetingid={id} type={type} team={team} />
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default MeetingPage;
