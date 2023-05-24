import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector3, Matrix4 } from "three";
import './scene.css';

const pointsGeometryCache = {}
const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });

const PointCloud = ({frameIndex}) => {
  const loader = new PLYLoader();
  const [geometry, setGeometry] = useState(null);
  const pointsRef = useRef();
  
  useEffect(() => {
    if (!pointsGeometryCache[frameIndex]) {
      loader.load(`/data/119-120_${frameIndex}.ply`, (geometry) => {
        const points = new THREE.Points(geometry, material);
        pointsRef.current = points;
          
        const positions = geometry.attributes.position.array;
        const c = geometry.attributes.color.array;

        for (let i = 0; i < positions.length; i += 3) {       
          // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
          const luminance = (0.2126 * c[i] + 0.7152 * c[i+1] + 0.0722 * c[i+2])
          
          // Hide points that are too dark or too light
          if (luminance > 0.6 || luminance < 0.05)
            positions[i] = positions[i + 1] = positions[i + 2] = 0;
        }

        setGeometry(geometry);
        pointsGeometryCache[frameIndex] = geometry;
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('Error loading .ply file:', error);
      });
    }
    else
    {
      // cache hit
      const points = new THREE.Points(geometry, material);
      pointsRef.current = points;
      setGeometry(pointsGeometryCache[frameIndex]);
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
        <PointCloud frameIndex={value} />
        <OrbitControls />
        <axesHelper />
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
