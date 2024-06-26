import React, { useRef, useEffect, useState } from 'react';
import { Holistic } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import './MediapipeHolisticWebcam.css';
import axios from 'axios';

const MediapipeHolisticWebcam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const holistic = useRef(null);
  const isRecordingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [poseData, setPoseData] = useState([]);
  const [shouldSendData, setShouldSendData] = useState(false);

  useEffect(() => {
    if (!holistic.current) {
      holistic.current = new Holistic({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }
      });

      holistic.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      holistic.current.onResults((results) => {
        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.poseLandmarks) {
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS);
          if (isRecordingRef.current) {
            setPoseData(prevData => [...prevData, results.poseLandmarks]);
          }
        }

        if (results.leftHandLandmarks) {
          for (const landmark of results.leftHandLandmarks) {
            const x = landmark.x * canvasRef.current.width;
            const y = landmark.y * canvasRef.current.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
            canvasCtx.fill();
          }
        }

        if (results.rightHandLandmarks) {
          for (const landmark of results.rightHandLandmarks) {
            const x = landmark.x * canvasRef.current.width;
            const y = landmark.y * canvasRef.current.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 3, 0, 2 * Math.PI);
            canvasCtx.fill();
          }
        }

        if (results.faceLandmarks) {
          for (const landmark of results.faceLandmarks) {
            const x = landmark.x * canvasRef.current.width;
            const y = landmark.y * canvasRef.current.height;
            canvasCtx.beginPath();
            canvasCtx.arc(x, y, 1, 0, 2 * Math.PI);
            canvasCtx.fill();
          }
        }

        canvasCtx.restore();
      });

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            await holistic.current.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });
        camera.start();
      }
    }
  }, []);

  useEffect(() => {
    if (!isRecording && shouldSendData) {
      sendPoseDataToServer();
      setShouldSendData(false);
    }
  }, [isRecording, shouldSendData]);

  const POSE_CONNECTIONS = [
    // 팔과 몸통
    [11, 13], [13, 15], [15, 17], [17, 19], [19, 21], [21, 15], // 왼쪽 팔
    [12, 14], [14, 16], [16, 18], [18, 20], [20, 22], [22, 16], // 오른쪽 팔
    [11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], // 몸통과 엉덩이
    [25, 27], [27, 29], [29, 31], // 왼쪽 다리
    [26, 28], [28, 30], [30, 32]  // 오른쪽 다리
  ];

  const connect = (ctx, connectors) => {
    const canvasCtx = ctx;
    canvasCtx.beginPath();
    for (let i = 0; i < connectors.length; i++) {
      const [start, end] = connectors[i];
      canvasCtx.moveTo(start.x, start.y);
      canvasCtx.lineTo(end.x, end.y);
    }
    canvasCtx.stroke();
  };

  const drawConnectors = (canvasCtx, landmarks, connections) => {
    const offsetLandmarks = landmarks.map(landmark => ({
      x: landmark.x * canvasCtx.canvas.width,
      y: landmark.y * canvasCtx.canvas.height,
    }));
    connect(canvasCtx, connections.map(([start, end]) => [offsetLandmarks[start], offsetLandmarks[end]]));
  };

  const startRecording = () => {
    setPoseData([]);
    setIsRecording(true);
    isRecordingRef.current = true;
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setShouldSendData(true);
  };

  const sendPoseDataToServer = async () => {
    try {
      const response = await axios.post('http://localhost:5000/save-motion', { poseData });
      console.log(response.data.message);
    } catch (error) {
      console.error('Error sending pose data:', error);
    }
  };

  return (
    <div className="mediapipe-holistic-webcam-container">
      <div className="controls">
        <button onClick={startRecording}>Start Recording</button>
        <button onClick={stopRecording}>Stop Recording</button>
      </div>
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} width="640" height="480"></canvas>
    </div>
  );
};

export default MediapipeHolisticWebcam;
