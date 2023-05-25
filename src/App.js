import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector3, Matrix4 } from "three";
import './scene.css';

const pointsGeometryCache = {}
const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });

const PointCloud = ({frameIndex, numFrames}) => {
  const loader = new PLYLoader();
  const [geometry, setGeometry] = useState(null);
  const pointsRef = useRef();
  
  useEffect(() => {
    for (let i = 1; i < numFrames; i++)
    {
      if (!pointsGeometryCache[i]) {
        loader.load(`/data/119-120_${i}.ply`, (geometry) => {
          console.log(`frame ${i} loaded`);
    
          const positions = geometry.attributes.position.array;
          const c = geometry.attributes.color.array;

          for (let i = 0; i < positions.length; i += 3) {
            // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
            const luminance = (0.2126 * c[i] + 0.7152 * c[i+1] + 0.0722 * c[i+2])
            
            // Hide points that are too dark or too light
            if (luminance > 0.5 || luminance < 0.05 || c[i+1] < 0.15)
              positions[i] = positions[i + 1] = positions[i + 2] = 0;
          }
          pointsGeometryCache[i] = geometry;
          // setGeometry(geometry);
        },
        (xhr) => {
          const progress = xhr.loaded / xhr.total;
        },
        (error) => {
          console.error('Error loading .ply file:', error);
        });
      }
    }

    if (pointsGeometryCache[frameIndex]) {
      const geometry = pointsGeometryCache[frameIndex];
      const points = new THREE.Points(geometry, material);
      pointsRef.current = points;
      setGeometry(geometry);
    }
  }, [frameIndex]);

  return (
    <points>
      {geometry && <primitive object={pointsRef.current} />}
    </points>
  );
};


const App = () => {

  const [value, setValue] = useState(50); // Initial value of the slider

  const handleSliderChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <PointCloud frameIndex={value} numFrames={243} />
        <OrbitControls />
        {/* <axesHelper /> */}
        <gridHelper  />
      </Canvas>
      <div className="overlay">
        <input
          className="slider"
          type="range"
          min="1"
          max="243"
          value={value}
          onChange={handleSliderChange}
        />
      </div>
    </>
  );
};

export default App;
