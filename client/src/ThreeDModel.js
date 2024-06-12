import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

function Model() {
  const group = useRef();
  const mixer = useRef();

  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/models/GawrGura/gawr_gura1k.glb', (gltf) => {
      const model = gltf.scene;
      group.current.add(model);
      mixer.current = new AnimationMixer(model);
    });

    return () => {
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, []);

  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);
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
