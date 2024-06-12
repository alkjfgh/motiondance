import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MotionFileSelector = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/motion-files');
        setFiles(response.data);
      } catch (error) {
        console.error('Error fetching motion files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };

  return (
    <div>
      <label htmlFor="motion-files">Select a motion file: </label>
      <select id="motion-files" value={selectedFile} onChange={handleFileChange}>
        <option value="">--Select a file--</option>
        {files.map((file, index) => (
          <option key={index} value={file}>{file}</option>
        ))}
      </select>
    </div>
  );
};

export default MotionFileSelector;
