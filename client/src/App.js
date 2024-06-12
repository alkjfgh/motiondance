import React from 'react';
import './App.css';
import ThreeDModel from './ThreeDModel';
import MediapipeHolisticWebcam from './MediapipeHolisticWebcam';
import MotionFileSelector from './MotionFileSelector';

function App() {
  return (
    <div className="App">
      <ThreeDModel/>
      <MediapipeHolisticWebcam/>
      <MotionFileSelector/>
    </div>
  );
}

export default App;
