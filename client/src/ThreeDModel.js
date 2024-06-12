import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

function applyPose(model, poseData) {
  if (!poseData) return;

  // Map pose landmarks to the model's bones
  model.traverse((child) => {
    if (child.isBone) {
      const landmark = poseData.find(l => l.name === child.name);
      if (landmark) {
        child.position.set(landmark.x, landmark.y, landmark.z);
      }
    }
  });
}

function Model({ poseData }) {
  const group = useRef();
  const mixer = useRef();

  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/models/GawrGura/gawr_gura1k.glb', (gltf) => {
      const model = gltf.scene;
      group.current.add(model);
      mixer.current = new AnimationMixer(model);

      // Apply initial pose data
      applyPose(model, poseData);
    });

    return () => {
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, [poseData]);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);

    // Apply pose data continuously
    if (group.current && poseData) {
      applyPose(group.current, poseData);
    }
  });

  return <group ref={group} position={[0, -3, 0]} scale={[0.3, 0.3, 0.3]} />;
}

function ThreeDModel({ poseData }) {
  return (
    <Canvas style={{ height: '100vh', width: '100vw' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Model poseData={poseData} />
      <OrbitControls />
    </Canvas>
  );
}

export default ThreeDModel;
