import React, { useEffect, useState } from 'react';
import Loading from '../../../ui/Loading';
import CollapsibleSection from '../../../ui/CollapsableSection';
import styles from './Transcription.module.css';
import { useRef } from 'react';
import { useCallback } from 'react';

const Transcription = ({ type, team, organisation, meetingid, onconfirm }) => {
  const [canEdit, setCanEdit] = useState(false);
  const [transcriptionType, setTranscriptionType] = useState(false);
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
      setTranscriptionType(data.type);
      setTranscription(data.transcription);
      setOriginalTranscription(data.transcription); // Store the original transcription
      setUncommonWords(data.uncommonWords);
    } catch (error) {
      console.log('error:', error);
    }
    setLoading(false);


    // // to be removed once endpoint works:
    // setTranscriptionType('ai');
    // setTranscription('this is a sample transcription');
    // setOriginalTranscription('this is a sample transcription');
    // setUncommonWords(['sample']);

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
    onconfirm(false);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/update-transcription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingid,
          organisation,
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
    onconfirm(true)

    // // to be removed once endpoint works
    // onconfirm();
    // setTranscriptionType('user');
    // setTranscription(transcription);
    // setUncommonWords(uncommonWords);

  };

  const generateLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 100%, 85%)`;
  };

  const highlightWords = useCallback((text) => {
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
        `<mark style="background-color: ${color};">${word}</mark>`
      );
    });
    return { __html: highlightedText };
  }, [uncommonWords, wordColors]);

  const handleTranscriptionChange = (e) => {
    setTranscription(e.target.value);
    updateHighlight(e.target.value);
  };

  const updateHighlight = (text) => {
    if (overlayRef.current) {
      overlayRef.current.innerHTML = highlightWords(text).__html;
    }
    syncScroll();
  };

  const syncScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (isEditing) {
      updateHighlight(transcription);
    }
  }, [transcription, isEditing, highlightWords]);


  return (
    <CollapsibleSection title="Meeting Transcription" onToggle={getMeetingTranscription}>
      {loading && <Loading />}
      <div className={styles.transcriptionContainer}>
      {canEdit && !isEditing && (
        <button className={styles.editButton} onClick={handleEditTranscription}>
          { !transcriptionType ? 'Confirm Transcription' : 'Edit Transcription' }
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
              />
            </div>
            <div>Uncommon words found which may have been generated incorrectly: </div>
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
            {transcriptionType && (
              <div className={styles.warning}>
                Warning: Summary and todos will be regenerated. You will lose manual todos if you click on submit. Click on cancel to cancel this edit
              </div>
            )}
            {!transcriptionType && (
              <div className={styles.warning}>
                Warning: Once you confirm, your summary and todos will be generated after which you can edit your
                todos. However, if you make any further edits to the transcription after confirmation, your work will be lost. Click on cancel to not confirm transcription.
              </div>
            )}
            <div className={styles.buttonContainer}>
              <button className={styles.cancelButton} onClick={handleCancelEdit}>
                Cancel Edit
              </button>
              <button className={styles.submitButton} onClick={handleSubmitTranscription}>
              { !transcriptionType ? 'Confirm Transcription' : 'Submit Transcription' }
              </button>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default Transcription;
