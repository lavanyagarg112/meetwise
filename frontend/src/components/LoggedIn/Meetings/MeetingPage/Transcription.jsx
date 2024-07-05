import React, { useEffect, useState } from 'react';
import Loading from '../../../ui/Loading';
import CollapsibleSection from '../../../ui/CollapsableSection';
import styles from './Transcription.module.css';
import { useRef } from 'react';

const Transcription = ({ type, team, organisation, meetingid }) => {
  const [canEdit, setCanEdit] = useState(false);
  const [id, setTranscriptionId] = useState(null);
  const [transcriptionType, setTranscriptionType] = useState('');
  const [transcription, setTranscription] = useState('');
  const [uncommonWords, setUncommonWords] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalTranscription, setOriginalTranscription] = useState('');
  const [wordColors, setWordColors] = useState({});
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

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

    // to be removed once endpoint works
    setCanEdit(true)

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


    // to be removed once endpoint works:
    setTranscriptionId(0);
    setTranscriptionType('ai');
    setTranscription('this is a sample transcription');
    setOriginalTranscription('this is a sample transcription');
    setUncommonWords(['sample']);

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

    // to be removed once endpoint works
    setTranscriptionType('user');
    setTranscription(transcription);
    setUncommonWords(uncommonWords);

  };

  const generateLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 85%)`;
  };

  const highlightWords = (text) => {
    if (!text) return { __html: '' };
    let highlightedText = text;
    uncommonWords.forEach((word) => {
      if (!wordColors[word]) {
        setWordColors(prev => ({ ...prev, [word]: generateLightColor() }));
      }
      const color = wordColors[word];
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark style="background-color: ${color}; color: transparent;">${word}</mark>`
      );
    });
    return { __html: highlightedText };
  };

  const handleTranscriptionChange = (e) => {
    setTranscription(e.target.value);
    syncScroll();
  };

  const syncScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };


  return (
    <CollapsibleSection title="Meeting Transcription" onToggle={getMeetingTranscription}>
      {loading && <Loading />}
      <div className={styles.transcriptionContainer}>
      {canEdit && (
        <button className={styles.editButton} onClick={handleEditTranscription}>
          Edit Transcription
        </button>

      )}

        {canEdit && transcriptionType === 'ai' && (
          <button className={styles.submitButton} onClick={handleSubmitTranscription}>
            Confirm Transcription
          </button>
        )}
        {!isEditing ? (
          <div>
            {/* <div
              className={styles.transcriptionContent}
              dangerouslySetInnerHTML={highlightWords(transcription)}
            /> */}
            <div className={styles.transcriptionContent}>{transcription}</div>
          </div>
        ) : (
          <div className={styles.editContainer}>
            <div className={styles.textareaWrapper}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={transcription}
                onChange={handleTranscriptionChange}
                onScroll={syncScroll}
              />
              <div 
                ref={overlayRef}
                className={styles.highlightOverlay}
                dangerouslySetInnerHTML={highlightWords(transcription)}
              />
            </div>
            <div>Uncommon words found which may have been generated correctly: </div>
            <div className={styles.uncommonWordsContainer}>
              {uncommonWords.map((word, index) => (
                <span 
                  key={index} 
                  className={styles.uncommonWord}
                  style={{ backgroundColor: wordColors[word] || generateLightColor() }}
                >
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
