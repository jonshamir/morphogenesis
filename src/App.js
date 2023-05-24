import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector3, Matrix4 } from "three";
import './scene.css';

const PointCloud = () => {
  const loader = new PLYLoader();
  const [geometry, setGeometry] = useState(null);
  const pointsRef = useRef();
  

  useEffect(() => {
    loader.load('/data/119-120_1.ply', (geometry) => {
      const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
      const points = new THREE.Points(geometry, material);
      pointsRef.current = points;

      const box = new THREE.Box3().setFromObject(pointsRef.current);
      const center = box.getCenter(new Vector3());

      const rotation = new THREE.Euler(-0.22,-0.33,-0.038);
        
      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color.array;

      for (let i = 0; i < positions.length; i += 3) {       
        // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
        const luminance = (0.2126 * colors[i] +
                           0.7152 * colors[i+1] +
                           0.0722 * colors[i+2])
        
        // Hide points that are too dark or too light
        if (luminance > 0.6 || luminance < 0.05)
        {
          positions[i] = positions[i + 1] = positions[i + 2] = 0;
        }
      }

      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      setGeometry(geometry);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
      console.error('Error loading .ply file:', error);
    });
  }, []);

  return (
    <points>
      {geometry && <primitive object={pointsRef.current} />}
    </points>
  );
};


const Scene = () => {
  return (
    <Canvas camera={{ position: [2, 2, 2] }}>
      <PointCloud />
      <OrbitControls />
      <axesHelper />
      <gridHelper  />
    </Canvas>
  );
};

export default Scene;
