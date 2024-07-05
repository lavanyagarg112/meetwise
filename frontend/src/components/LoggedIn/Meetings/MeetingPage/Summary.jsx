import React, { useState } from 'react';
import CollapsibleSection from '../../../ui/CollapsableSection';
import styles from './Summary.module.css';

const Summary = ({ organisation, meetingid }) => {
  const [summary, setSummary] = useState('');

  const getSummary = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingid, organisation }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('An error occurred fetching the summary.');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.log('error: ', error);
    }

  };

  return (
    <CollapsibleSection title="Meeting Summary" onToggle={getSummary}>
      <div className={styles.summaryContent}>{summary ? summary : "No summary available"}</div>
    </CollapsibleSection>
  );
};

export default Summary;
