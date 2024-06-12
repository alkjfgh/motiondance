import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ThreeDModel from './ThreeDModel';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [poseData, setPoseData] = useState(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    pose.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();

    function onResults(results) {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
      drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
      canvasCtx.restore();

      setPoseData(results.poseLandmarks);
    }
  }, []);

  const handleStartDance = () => {
    setIsPlaying(true);
  };

  const handleStartRecording = () => {
    setRecording(true);
    // Initialize video capture
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  };

  const handleStopRecording = () => {
    setRecording(false);
    // Send the captured pose data to the server
    fetch('/save-motion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ poseData }),
    }).then(() => {
      setIsPlaying(true);  // Automatically start dance after recording stops
    });
  };

  return (
    <div className="App">
      <div className="controls">
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
      </div>
      <video ref={videoRef} className="floating-video" width="320" height="240" />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
      <ThreeDModel poseData={isPlaying ? poseData : null} />
    </div>
  );
}

export default App;
