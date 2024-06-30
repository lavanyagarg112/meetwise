import React, { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const UploadMeeting = () => {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [ffmpeg] = useState(new FFmpeg({ log: true }));

  const loadFFmpeg = async () => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const sendUploadAudio = async () => {
    if (!file) return;

    setConverting(true);

    await loadFFmpeg();

    const inputFile = file.name;
    const outputFile = 'output.mp3';

    ffmpeg.FS('writeFile', inputFile, await file.arrayBuffer());
    await ffmpeg.run('-i', inputFile, outputFile);

    const data = ffmpeg.FS('readFile', outputFile);

    const mp3Blob = new Blob([data.buffer], { type: 'audio/mpeg' });
    const mp3File = new File([mp3Blob], 'output.mp3', { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('file', mp3File);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload-meeting`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      alert('Upload successful');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <div onClick={sendUploadAudio} style={{ cursor: 'pointer', color: converting ? 'gray' : 'blue' }}>
        {converting ? 'Converting...' : 'Upload Meeting'}
      </div>
    </div>
  );
};

export default UploadMeeting;
