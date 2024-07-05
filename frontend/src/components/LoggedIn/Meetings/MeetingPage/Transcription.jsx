import React, { useEffect, useState } from 'react';
import Loading from '../../../ui/Loading';
import CollapsibleSection from '../../../ui/CollapsableSection';
import styles from './Transcription.module.css';

const Transcription = ({ type, team, organisation, meetingid }) => {
  const [canEdit, setCanEdit] = useState(false);
  const [id, setTranscriptionId] = useState(null);
  const [transcriptionType, setTranscriptionType] = useState('');
  const [transcription, setTranscription] = useState('');
  const [uncommonWords, setUncommonWords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalTranscription, setOriginalTranscription] = useState('');

  useEffect(() => {
    if (type === 'organisation') {
      getUserOrgRole(organisation);
    } else {
      getUserTeamRole(team, organisation);
    }
  }, [type, team, organisation]);

  const getUserOrgRole = async (organisationName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: organisationName }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the user role.');
      }

      const data = await response.json();
      setCanEdit(data.role !== 'user');
    } catch (error) {
      console.log('error:', error);
    }
  };

  const getUserTeamRole = async (teamName, organisationName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-team-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, organisationName }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the team role.');
      }

      const data = await response.json();
      setCanEdit(data.role !== 'user');
    } catch (error) {
      console.log('error:', error);
    }
  };

  const getMeetingTranscription = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-transcription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingid, organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the transcription.');
      }

      const data = await response.json();
      setTranscriptionId(data.id);
      setTranscriptionType(data.type);
      setTranscription(data.transcription);
      setOriginalTranscription(data.transcription); // Store the original transcription
      setUncommonWords(data.uncommonWords);
    } catch (error) {
      console.log('error:', error);
    }
    setLoading(false);
  };

  const handleEditTranscription = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTranscription(originalTranscription); // Revert to the original transcription
    setIsEditing(false);
  };

  const handleSubmitTranscription = async () => {
    setIsEditing(false);
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-transcription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
          transcriptionid: id,
          transcription,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred updating the transcription.');
      }

      const data = await response.json();
      setTranscriptionType(data.type);
      setTranscription(data.transcription);
      setUncommonWords(data.uncommonWords);
    } catch (error) {
      console.log('error:', error);
    }
    setLoading(false);
  };

  return (
    <CollapsibleSection title="Meeting Transcription" onToggle={getMeetingTranscription}>
      {loading && <Loading />}
      <div className={styles.transcriptionContainer}>
        {canEdit && !isEditing && (
          <button className={styles.editButton} onClick={handleEditTranscription}>
            Edit Transcription
          </button>
        )}
        {!isEditing ? (
          <div className={styles.transcriptionContent}>{transcription ? transcription : "No transcription available"}</div>
        ) : (
          <div className={styles.editContainer}>
            <textarea
              className={styles.textarea}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
            />
            <div className={styles.uncommonWordsContainer}>
              {uncommonWords.map((word, index) => (
                <span key={index} className={styles.uncommonWord}>
                  {word}
                </span>
              ))}
            </div>
            {transcriptionType === 'user' && (
              <div className={styles.warning}>
                Warning: Summary and todos will be regenerated. You will lose manual todos.
              </div>
            )}
            {transcriptionType === 'ai' && (
              <div className={styles.warning}>
                Warning: Once you submit, your summary and todos will be regenerated after which you can edit your
                todos. However, if you make any further edits to the transcription, your work will be lost.
              </div>
            )}
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={handleCancelEdit}>
                Cancel Edit
              </button>
              <button className={styles.submitButton} onClick={handleSubmitTranscription}>
                Submit Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default Transcription;
