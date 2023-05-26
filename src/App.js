import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector3, Matrix4 } from "three";
import './scene.css';

const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });

const PointCloud = ({ currFrame, setCurrFrame, frameCount, setLoadProgress, isPlaying }) => {
  const loader = new PLYLoader();
  const [geometry, setGeometry] = useState(null);
  const pointsRef = useRef();
  const geometryCacheRef = useRef({});
  const filesLoadedRef = useRef(0);
  
  useFrame((_, delta) => {
    if (isPlaying)
    {
      setCurrFrame((currFrame + 1) % frameCount);
    }
  });

  // Load frames
  useEffect(() => {
    for (let i = 1; i < frameCount + 1; i++)
    {
      if (!geometryCacheRef.current[i]) {
        loader.load(`/data/119-120_${i}.ply`, (g) => {
          filesLoadedRef.current++;
          setLoadProgress(filesLoadedRef.current / frameCount);
            
          const p = g.attributes.position.array;
          const c = g.attributes.color.array;

          for (let i = 0; i < p.length; i += 3) {
            // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
            const luminance = (0.2126 * c[i] + 0.7152 * c[i+1] + 0.0722 * c[i+2])
            
            // Hide points that are too dark or too light
            if (luminance > 0.6 || luminance < 0.05)
              p[i] = p[i + 1] = p[i + 2] = 0;
          }
          geometryCacheRef.current[i] = g;
        },
        () => {}, // loading
        error =>  console.error('Error loading .ply file:', error));
      }
    }
  }, []);

  // Show frames
  useEffect(() => {
    if (geometryCacheRef.current[currFrame]) {
      // Temp fix for rotation in data
      if (currFrame >= 80) { 
        const p = geometryCacheRef.current[currFrame].attributes.position.array;
        const v = new Vector3(p[currFrame], p[currFrame+1], p[currFrame+2])
        v.applyEuler(new THREE.Euler(0, 0.5, 0))
        p[currFrame] = v.x;
        p[currFrame+1] = v.y;
        p[currFrame+2] = v.z;
      }
      setGeometry(geometryCacheRef.current[currFrame]);
      pointsRef.current = new THREE.Points(geometry, material);
    }
    else
      setGeometry(undefined);
  }, [currFrame]);

  return (
    <points>
      {geometry && <primitive object={pointsRef.current} />}
    </points>
  );
};

const Controls = () => {

}


const App = () => {
  const frameCount = 243;
  const [loadProgress, setLoadProgress] = useState(0);
  const [currFrame, setCurrFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); 

  const handleSliderChange = (event) => {
    setCurrFrame(event.target.value);
  };

  return (
    <>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <PointCloud
        currFrame={currFrame}
        setCurrFrame={setCurrFrame}
        frameCount={frameCount}
        setLoadProgress={setLoadProgress}
        isPlaying={isPlaying} />
        <OrbitControls />
        <gridHelper  />
      </Canvas>
      <div className="overlay">
        <div className="controls">
          <button className="material-icons" onClick={()=> setIsPlaying(!isPlaying)}>
              {isPlaying ? 'pause' : 'play_arrow'}
          </button>
          <button onClick={()=> setPlaySpeed(playSpeed > 8 ? 1 : 2*playSpeed)}>
            {playSpeed}x
          </button>
          {loadProgress < 0.98 && <span>
            <span className="material-icons loader">sync</span>
            { (loadProgress*100).toFixed(0)}%
            </span>}
          <div className="fillSpace"></div>
          <span>{`${currFrame} / ${frameCount}`}</span>
        </div>
        <input
          className="slider"
          type="range"
          min="1"
          max={frameCount}
          value={currFrame}
          onChange={handleSliderChange}
        />
      </div>
    </>
  );
};

export default App;
