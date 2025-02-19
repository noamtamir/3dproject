import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelViewerProps {
  modelUrl?: string;
}

function Model({ url }: { url: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load the model with error handling
  const { scene } = useGLTF(url, true, (error) => {
    console.error('Error loading model:', error);
    setError(error.message);
  });
  
  useEffect(() => {
    if (!scene) return;

    try {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      
      scene.position.copy(center.multiplyScalar(-1));
      scene.scale.setScalar(scale);
      
      // Mark as successfully loaded
      setIsLoaded(true);
    } catch (err) {
      console.error('Error processing model:', err);
      setError(err instanceof Error ? err.message : 'Failed to process model');
    }

    // Cleanup function
    return () => {
      try {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose();
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      } catch (err) {
        console.error('Error cleaning up model:', err);
      }
    };
  }, [scene]);

  // Handle loading errors
  if (error) {
    throw new Error(error);
  }

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  return <primitive object={scene} />;
}

function LoadingSpinner() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation(prev => (prev + 0.02) % (Math.PI * 2));
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <mesh rotation={[0, rotation, 0]}>
      <torusGeometry args={[1, 0.2, 16, 32]} />
      <meshStandardMaterial color="#4444ff" wireframe />
    </mesh>
  );
}

function PlaceholderBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
}

function ErrorDisplay() {
  return (
    <mesh>
      <octahedronGeometry args={[1]} />
      <meshStandardMaterial color="#661111" wireframe />
    </mesh>
  );
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Model loading error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay />;
    }

    return this.props.children;
  }
}

export default function ModelViewer({ modelUrl }: ModelViewerProps) {
  // Reset error boundary when URL changes
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
    
    if (modelUrl) {
      try {
        // Preload the model
        useGLTF.preload(modelUrl);
      } catch (err) {
        console.error('Error preloading model:', err);
      }
    }
    
    return () => {
      if (modelUrl) {
        try {
          // Cleanup previous model
          useGLTF.clear(modelUrl);
        } catch (err) {
          console.error('Error clearing model:', err);
        }
      }
    };
  }, [modelUrl]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
        />
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={0.5} 
          castShadow 
        />
        <OrbitControls 
          makeDefault
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={2}
          maxDistance={10}
        />
        <ModelErrorBoundary key={key}>
          <Suspense fallback={<LoadingSpinner />}>
            {modelUrl ? <Model url={modelUrl} /> : <PlaceholderBox />}
          </Suspense>
        </ModelErrorBoundary>
      </Canvas>
    </div>
  );
}