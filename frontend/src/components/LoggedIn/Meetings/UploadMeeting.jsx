import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './UploadMeeting.module.css';

const UploadMeeting = () => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [type, setType] = useState('organisation');
  const [meetingName, setMeetingName] = useState('');
  const [meetingDate, setMeetingDate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const initFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    initFFmpeg();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

      // Create a blob URL for the converted file
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setFileUrl(url);

      // Send the MP3 file to the backend
      const formData = new FormData();
      formData.append('file', blob, 'output.mp3');
      formData.append('type', type);
      formData.append('meetingName', meetingName);
      formData.append('meetingDate', formatDate(meetingDate));

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-meeting`, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          console.log('File successfully uploaded to the backend');
        } else {
          console.error('Failed to upload file to the backend');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }

      setLoading(false);
      setMeetingName('')
      setMeetingDate(null)
      setSelectedFile(false)
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className={styles.uploadMeeting}>
      <h2>Upload Meeting</h2>
      <div className={styles.formGroup}>
        <label>
          Meeting Type:
          <select value={type} onChange={(e) => setType(e.target.value)} className={styles.selectInput}>
            <option value="organisation">Organisation</option>
            <option value="team">Team</option>
          </select>
        </label>
      </div>
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
          />
        </label>
      </div>
      <div className={styles.formGroup}>
        <input type="file" onChange={handleFileChange} accept="video/*" className={styles.fileInput} />
      </div>
      <button
        onClick={sendUploadAudio}
        disabled={loading || !selectedFile || !meetingName || !meetingDate}
        className={styles.uploadButton}
      >
        {loading ? 'Uploading...' : 'Send Upload'}
      </button>
      {fileUrl && (
        <div className={styles.downloadLink}>
          <a href={fileUrl} download="output.mp3">Download test MP3</a>
        </div>
      )}
    </div>
  );
};

export default UploadMeeting;
