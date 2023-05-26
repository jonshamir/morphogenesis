import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector3, Matrix4 } from "three";
import './scene.css';

const pointsGeometryCache = {}
let filesLoaded = 0;
const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });

const PointCloud = ({frameIndex, frameCount}) => {
  const loader = new PLYLoader();
  const [geometry, setGeometry] = useState(null);
  const pointsRef = useRef();
  
  // Load frames
  useEffect(() => {
    for (let i = 1; i < frameCount + 1; i++)
    {
      if (!pointsGeometryCache[i]) {
        loader.load(`/data/119-120_${i}.ply`, (geometry) => {
          filesLoaded++;
          console.log(`loading ${((filesLoaded / frameCount)*100).toFixed(2)}%`);
            
          const p = geometry.attributes.position.array;
          const c = geometry.attributes.color.array;

          for (let i = 0; i < p.length; i += 3) {
            // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
            const luminance = (0.2126 * c[i] + 0.7152 * c[i+1] + 0.0722 * c[i+2])
            
            // Hide points that are too dark or too light
            if (luminance > 0.6 || luminance < 0.05)
              p[i] = p[i + 1] = p[i + 2] = 0;
            else if (i >= 80) { // Temp fix for rotation in data
              const v = new Vector3(p[i], p[i+1], p[i+2])
              v.applyEuler(new THREE.Euler(0, 0.1, 0))
              p[i] = v.x;
              p[i+1] = v.y;
              p[i+2] = v.z;
            }
          }

          pointsGeometryCache[i] = geometry;

        },
        (xhr) => {
          const progress = (xhr.loaded / xhr.total);
        },
        (error) => {
          console.error('Error loading .ply file:', error);
        });
      }
    }
  }, []);

  // Show frames
  useEffect(() => {
    if (pointsGeometryCache[frameIndex]) {
      setGeometry(pointsGeometryCache[frameIndex]);
      pointsRef.current = new THREE.Points(geometry, material);
    }
    else
      setGeometry(undefined);
  }, [frameIndex]);

  return (
    <points>
      {geometry && <primitive object={pointsRef.current} />}
    </points>
  );
};


const App = () => {

  const frameCount = 50;
  const [value, setValue] = useState(1); // Initial value of the slider
  const [isPlaying, setIsPlaying] = useState(false); // Initial value of the slider

  const handleSliderChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <PointCloud frameIndex={value} frameCount={frameCount} />
        <OrbitControls />
        {/* <axesHelper /> */}
        <gridHelper  />
      </Canvas>
      <div className="overlay">
        <div className="controls">
          <button onClick={()=> setIsPlaying(!isPlaying)}>
            {isPlaying ? 'pause' : 'play'}
          </button>
          <div className="fillSpace"></div>
          <span>{`${value} / ${frameCount}`}</span>
        </div>
        <input
          className="slider"
          type="range"
          min="1"
          max={frameCount}
          value={value}
          onChange={handleSliderChange}
        />
      </div>
    </>
  );
};

export default App;
