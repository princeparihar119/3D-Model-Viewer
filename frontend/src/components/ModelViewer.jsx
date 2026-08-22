import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Grid,
  GizmoHelper,
  GizmoViewport,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";

import "../css/ModelViewer.css";

const API_URL = import.meta.env.VITE_API_URL;

const API_BASE_URL = `${API_URL}/api/models`;
const AXIOS_CONFIG = { withCredentials: true };

const SceneContent = ({
  modelUrl,
  wireframe,
  controlsRef,
  resetCameraRef,
  animationAction,
  onAnimationsLoaded,
}) => {
  const { camera } = useThree();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, scene);

  useEffect(() => {
    if (onAnimationsLoaded) {
      onAnimationsLoaded(animations || []);
    }

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.wireframe = wireframe;
      }
    });
  }, [scene, animations, wireframe, onAnimationsLoaded]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const distance = Math.max(maxSize * 2.5, 5);

    camera.position.set(
      center.x + distance,
      center.y + distance,
      center.z + distance
    );

    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    } else {
      camera.lookAt(center);
    }

    camera.updateProjectionMatrix();
  }, [camera, scene, controlsRef]);

  useEffect(() => {
    resetCameraRef.current = () => {
      camera.position.set(4, 4, 4);

      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      } else {
        camera.lookAt(0, 0, 0);
      }

      camera.updateProjectionMatrix();
    };
  }, [camera, resetCameraRef, controlsRef]);

  useEffect(() => {
    if (animations && animations.length > 0) {
      const firstClipName = animations[0].name;
      animationAction.current = actions[firstClipName];
    } else {
      animationAction.current = null;
    }
  }, [animations, actions, animationAction]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  return <primitive object={scene} scale={2} />;
};

const ModelViewer = ({
  modelId,
  modelUrl,
  wireframe = false,
  backgroundColor = "#202020",
}) => {
  const viewerRef = useRef(null);
  const resetCameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationAction = useRef(null);

  const [animations, setAnimations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (modelUrl) {
      useGLTF.preload(modelUrl);
    }
  }, [modelUrl]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const resetCamera = () => {
    if (resetCameraRef.current) {
      resetCameraRef.current();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const takeScreenshot = () => {
    const canvas = viewerRef.current?.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `3d-model-${Date.now()}.png`;
    link.click();
  };

  const saveCameraState = async () => {
    try {
      if (!controlsRef.current) {
        alert("Camera controls are not ready");
        return;
      }

      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;

      const cameraData = {
        position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
        target: { x: target.x, y: target.y, z: target.z },
        zoom: camera.zoom,
      };

      await axios.post(`${API_BASE_URL}/${modelId}/camera`, cameraData, AXIOS_CONFIG);
      alert("Camera view saved successfully");
    } catch (error) {
      console.error("Save camera state error:", error);
      alert(error.response?.data?.message || "Failed to save camera view");
    }
  };

  const restoreCameraState = useCallback(async () => {
    try {
      if (!controlsRef.current || !modelId) return;

      const response = await axios.get(`${API_BASE_URL}/${modelId}/camera`, AXIOS_CONFIG);
      const savedState = response.data?.cameraState;

      if (!savedState) return;

      const camera = controlsRef.current.object;

      if (savedState.position) {
        camera.position.set(
          savedState.position.x,
          savedState.position.y,
          savedState.position.z
        );
      }

      if (savedState.target) {
        controlsRef.current.target.set(
          savedState.target.x,
          savedState.target.y,
          savedState.target.z
        );
      }

      if (savedState.zoom !== undefined) {
        camera.zoom = savedState.zoom;
      }

      camera.updateProjectionMatrix();
      controlsRef.current.update();
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Restore camera state error:", error);
      }
    }
  }, [modelId]);

  useEffect(() => {
    if (!modelId) return;

    const timer = setTimeout(() => {
      restoreCameraState();
    }, 500);

    return () => clearTimeout(timer);
  }, [modelId, restoreCameraState]);

  const playAnimation = () => {
    const action = animationAction.current;
    if (!action) return;

    action.reset();
    action.paused = false;
    action.play();
    setIsPlaying(true);
  };

  const pauseAnimation = () => {
    const action = animationAction.current;
    if (!action) return;

    action.paused = true;
    setIsPlaying(false);
  };

  const stopAnimation = () => {
    const action = animationAction.current;
    if (!action) return;

    action.stop();
    setIsPlaying(false);
  };

  return (
    <div className="model-viewer-wrapper" ref={viewerRef}>
      <div className="viewer-toolbar">
        <div className="viewer-title">
          <h3>3D Viewer</h3>
          <span>Interactive Model Preview</span>
        </div>

        <div className="viewer-actions">
          <button className="btn btn-outline-secondary" onClick={resetCamera}>
            ↻ Reset
          </button>
          <button className="btn btn-outline-primary" onClick={saveCameraState}>
            💾 Save View
          </button>
          <button className="btn btn-outline-success" onClick={takeScreenshot}>
            📷 Screenshot
          </button>
          <button className="btn btn-dark" onClick={toggleFullscreen}>
            {isFullscreen ? "⛶ Exit" : "⛶ Fullscreen"}
          </button>
        </div>
      </div>
      
      {animations.length > 0 && (
        <div className="animation-controls">
          <span className="animation-label">Animation Controls</span>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-success"
              onClick={playAnimation}
              disabled={isPlaying}
            >
              ▶ Play
            </button>
            <button
              className="btn btn-warning"
              onClick={pauseAnimation}
              disabled={!isPlaying}
            >
              ⏸ Pause
            </button>
            <button className="btn btn-danger" onClick={stopAnimation}>
              ⏹ Stop
            </button>
          </div>
        </div>
      )}

      {/* 3D CANVAS */}
      <div className="viewer-canvas">
        <Canvas
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [4, 4, 4], fov: 50, near: 0.1, far: 1000 }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />

          <SceneContent
            modelUrl={modelUrl}
            wireframe={wireframe}
            controlsRef={controlsRef}
            resetCameraRef={resetCameraRef}
            animationAction={animationAction}
            onAnimationsLoaded={setAnimations}
          />

          <Grid
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={1}
            sectionSize={2}
            sectionThickness={1.5}
            fadeDistance={30}
            fadeStrength={1}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableRotate
            enableZoom
            enablePan
          />

          <GizmoHelper alignment="bottom-right" margin={[100, 160]}>
            <GizmoViewport
              axisColors={["red", "green", "blue"]}
              labelColor="white"
            />
          </GizmoHelper>
        </Canvas>
      </div>
    </div>
  );
};

export default ModelViewer;