import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './UploadMeeting.module.css';
import moment from 'moment';

import Loading from '../../ui/Loading';

const UploadMeeting = ({ organisationName, team, allTeams=[] }) => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [fileUrl, setFileUrl] = useState(null);
  const [type, setType] = useState('organisation');
  const [meetingName, setMeetingName] = useState('');
  const [meetingDate, setMeetingDate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showError, setShowError] = useState(false);
  const [teams, setTeams] = useState(allTeams);

  const [canUploadOrg, setCanUploadOrg] = useState(false)

  const [teamName, setTeamName] = useState(team);

  useEffect(() => {
    if (team) {
      setType('team');
    } else {
      setType('organisation');
    }
  }, [team]);

  useEffect(() => {
    const initFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    initFFmpeg();
  }, []);

  useEffect(() => {
    if (type === 'team' && !team) {
      if (teams.length === 0){
        getOrganisationTeams();
      }
    }
  }, [type]);

  // useEffect(() => {
  //   setTeams(allTeams)
  // }, [allTeams])

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organisationName,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      if (data.role != 'user') {
        setCanUploadOrg(true)
        setType('organisation')
      } else {
        setCanUploadOrg(false)
        setType('team')
      }


    } catch (error) {
      console.log('ERROR', error);
    }
  }

  const getOrganisationTeams = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get-admin-teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: organisationName,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorText = 'An error occurred fetching the teams.';
        throw new Error(errorText);
      }

      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      console.log('ERROR', error);
    }
  };

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const sendUploadAudio = async () => {
    if (!selectedFile || !ffmpeg || !meetingName || !meetingDate) {
      alert('Please fill all the fields and select a file.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);

      await ffmpeg.writeFile('input.mp4', uint8Array);
      await ffmpeg.exec(['-i', 'input.mp4', 'output.mp3']);
      const data = await ffmpeg.readFile('output.mp3');

      const blob = new Blob([data], { type: 'audio/mpeg' });

      // test download
      // const url = URL.createObjectURL(blob);
      // setFileUrl(url);

      // Send the MP3 file to the backend
      const formData = new FormData();
      formData.append('file', blob, 'output.mp3');
      formData.append('type', type);
      formData.append('organisation', organisationName);
      formData.append('team', teamName);
      formData.append('meetingName', meetingName);
      formData.append('meetingDate', formatDate(meetingDate));
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-meeting`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        if (response.ok) {
          console.log('File successfully uploaded to the backend');
          setLoading(false);
          setMeetingName('');
          setMeetingDate(null);
          setSelectedFile(null);
          if (!team) {
            setTeamName('')
          }
          document.getElementById('fileInput').value = '';
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000); // Hide the popup after 3 seconds
        } else {
          setLoading(false);
          console.error('Failed to upload file to the backend');
          setShowError(true);
          setTimeout(() => setShowError(false), 5000);
        }
      } catch (error) {
        setLoading(false);
        console.error('Error uploading file:', error);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className={styles.uploadMeeting}>
      <h2>Upload Meeting</h2>
      <div className={styles.formGroup}>
        
        {team ? <div> Team: {team}</div> : (
          <label>
            Meeting Type:
            <select value={type} onChange={(e) => setType(e.target.value)} className={styles.selectInput}>
              {canUploadOrg && <option value="organisation">Organisation</option>}
              <option value="team">Team</option>
            </select>
          </label>
        )}
      </div>
      {type === 'team' && !team && (
        <div className={styles.formGroup}>
          <label>
            Select Team:
            <select value={teamName} onChange={(e) => setTeamName(e.target.value)} className={styles.selectInput}>
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <div className={styles.formGroup}>
        <label>
          Meeting Name:
          <input
            type="text"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            required
            className={styles.textInput}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <label>
          Meeting Date:
          <DatePicker
            selected={meetingDate}
            onChange={(date) => setMeetingDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            required
            className={styles.dateInput}
            maxDate={moment().toDate()}
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <input id="fileInput" type="file" onChange={handleFileChange} accept="video/*" className={styles.fileInput} />
      </div>
      <button
        onClick={sendUploadAudio}
        disabled={loading || !selectedFile || !meetingName || !meetingDate || (type === 'team' && !teamName)}
        className={styles.uploadButton}
      >
        {loading ? 'Uploading...' : 'Send Upload'}
      </button>
      {/* {fileUrl && (
        <div className={styles.downloadLink}>
          <a href={fileUrl} download="output.mp3">Download test MP3</a>
        </div>
      )} */}
      {showPopup && <div className={styles.popup}>Video uploaded!</div>}
      {showError && <div className={styles.error}>Error uploading video</div>}
      {loading && <Loading />}
    </div>
  );
};

export default UploadMeeting;

