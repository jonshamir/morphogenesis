import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { useMemo, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import "./scene.css";
import disc from "./public/dics.png";
import { useCallback } from "react";

const discSprite = new THREE.TextureLoader().load(disc);

const material = new THREE.PointsMaterial({
  size: 0.024,
  vertexColors: true,
  // map: discSprite,
  // alphaTest: 0.75,
  // transparent: true,
});

const loader = new PLYLoader();

const processSproutGeometry = (g, frameIndex) => {
  const p = g.attributes.position.array;
  const c = g.attributes.color.array;

  for (let i = 0; i < p.length; i += 3) {
    // https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
    const luminance = 0.2126 * c[i] + 0.7152 * c[i + 1] + 0.0722 * c[i + 2];

    // Hide points that are too dark or too light
    if (luminance > 0.6 || luminance < 0.05 || p[i + 1] < 0)
      p[i] = p[i + 1] = p[i + 2] = 0;
    else if (frameIndex >= 80) {
      // Temp fix for rotation in data
      const v = new THREE.Vector3(p[i], p[i + 1], p[i + 2]);
      v.applyEuler(new THREE.Euler(0, 0.1, 0));
      p[i] = v.x;
      p[i + 1] = v.y;
      p[i + 2] = v.z;
    }
  }

  return g;
};

const processFlowerGeometry = (g, frameIndex) => {
  const p = g.attributes.position.array;
  const c = g.attributes.color.array;
  const scale = 0.25;

  for (let i = 0; i < p.length; i += 3) {
    const luminance = 0.2126 * c[i] + 0.7152 * c[i + 1] + 0.0722 * c[i + 2];

    // Temp fix for rotation in data
    const v = new THREE.Vector3(p[i], p[i + 1], p[i + 2]);
    // p[i] = (p[i] + 40) * scale;
    // p[i + 1] = (p[i + 1] + 20) * scale;
    // p[i + 2] = (p[i + 2] + 10) * scale;

    // Hide points that are too dark
    if (luminance < 0.03) p[i] = p[i + 1] = p[i + 2] = 0;
  }

  return g;
};

let timer = 0;
const frameTime = 1 / 30;

const PointCloud = ({
  currFrame,
  setCurrFrame,
  frameCount,
  onProgressChanged,
  isPlaying,
  playSpeed,
}) => {
  const [points, setPoints] = useState(null);
  const geometryCacheRef = useRef({});
  const filesLoadedRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying) {
      timer += delta * playSpeed;
      let deltaFrames = 0;
      while (timer > frameTime) {
        timer -= frameTime;
        deltaFrames++;
      }
      setCurrFrame((currFrame + deltaFrames) % frameCount);
    }
  });

  // Load frames
  useEffect(() => {
    (async () => {
      for (let i = 0; i < frameCount; i++) {
        if (!geometryCacheRef.current[i]) {
          loader.load(
            `data/flower/monst_${i}.ply`,
            (g) => {
              filesLoadedRef.current++;
              onProgressChanged(filesLoadedRef.current / frameCount);
              geometryCacheRef.current[i] = processFlowerGeometry(g, i);

              if (i == currFrame) {
                setPoints(
                  new THREE.Points(
                    geometryCacheRef.current[currFrame],
                    material
                  )
                );
              }
            },
            () => {},
            (e) => console.error(e)
          );
          await new Promise((r) => setTimeout(r, 10));
        }
      }
    })();
  }, []);

  // Show frames
  useEffect(() => {
    if (geometryCacheRef.current[currFrame]) {
      setPoints(
        new THREE.Points(geometryCacheRef.current[currFrame], material)
      );
    } else {
      console.error(`Missing frame ${currFrame}`);
      setPoints(undefined);
    }
  }, [currFrame]);

  return <points>{points && <primitive object={points} />}</points>;
};

const Controls = () => {};

const App = () => {
  const frameCount = 353;
  const [loadProgress, setLoadProgress] = useState(0);
  const [currFrame, setCurrFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);

  const handleSliderChange = (event) => {
    setIsPlaying(false);
    setCurrFrame(event.target.value);
  };

  const handleProgressChange = useCallback(
    (progress) => setLoadProgress(progress),
    []
  );

  return (
    <>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <PointCloud
          currFrame={currFrame}
          setCurrFrame={setCurrFrame}
          frameCount={frameCount}
          onProgressChanged={handleProgressChange}
          isPlaying={isPlaying}
          playSpeed={playSpeed}
        />
        <OrbitControls />
        <gridHelper />
      </Canvas>
      <div className="overlay">
        <div className="controls">
          <button
            className="material-icons"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "pause" : "play_arrow"}
          </button>
          <button
            onClick={() => setPlaySpeed(playSpeed > 8 ? 1 : 2 * playSpeed)}
          >
            {playSpeed}x
          </button>
          {loadProgress < 0.98 && (
            <span>
              <span className="material-icons loader">sync</span>
              {(loadProgress * 100).toFixed(0)}%
            </span>
          )}
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
