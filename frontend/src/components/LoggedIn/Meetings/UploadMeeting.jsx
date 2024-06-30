import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const UploadMeeting = () => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    const initFFmpeg = async () => {
      const ffmpegInstance = new FFmpeg();
      await ffmpegInstance.load();
      setFFmpeg(ffmpegInstance);
    };

    initFFmpeg();
  }, []);

  const sendUploadAudio = async (event) => {
    const file = event.target.files[0];
    if (!file || !ffmpeg) return;

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

      // Optionally download the file for testing
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Send the MP3 file to the backend
      const formData = new FormData();
      formData.append('file', blob, 'output.mp3');

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
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" onChange={sendUploadAudio} accept="video/*" />
      {loading && <p>Loading...</p>}
      {fileUrl && (
        <div>
          <a href={fileUrl} download="output.mp3">Download MP3</a>
        </div>
      )}
    </div>
  );
};

export default UploadMeeting;
