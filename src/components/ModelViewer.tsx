import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelDimensions {
  width: number;
  height: number;
  depth: number;
  volume: number;
  scale: number;
}

interface ModelViewerProps {
  modelUrl?: string;
  onDimensionsCalculated?: (dimensions: ModelDimensions) => void;
  scale?: number;
}

function Model({ url, onDimensionsCalculated, scale = 1 }: { 
  url: string; 
  onDimensionsCalculated?: (dimensions: ModelDimensions) => void;
  scale?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [baseSize, setBaseSize] = useState<THREE.Vector3 | null>(null);
  
  const { scene } = useGLTF(url, true) as any;
  
  useEffect(() => {
    if (!scene) return;

    try {
      // Center and scale the model - this stays constant
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const baseScale = 2 / maxDim;
      
      scene.position.copy(center.multiplyScalar(-1));
      scene.scale.setScalar(baseScale); // Don't apply user scale to the model

      // Store base size for dimension calculations
      setBaseSize(size);

      // Calculate scaled dimensions
      const dimensions: ModelDimensions = {
        width: (size.x / 10) * scale,
        height: (size.y / 10) * scale,
        depth: (size.z / 10) * scale,
        volume: (size.x * size.y * size.z * Math.pow(scale, 3)) / 1000,
        scale
      };
      
      onDimensionsCalculated?.(dimensions);
      setIsLoaded(true);
    } catch (err) {
      console.error('Error processing model:', err);
      setError(err instanceof Error ? err.message : 'Failed to process model');
    }
  }, [scene, onDimensionsCalculated]);

  // Update dimensions when scale changes
  useEffect(() => {
    if (!baseSize) return;

    const dimensions: ModelDimensions = {
      width: (baseSize.x / 10) * scale,
      height: (baseSize.y / 10) * scale,
      depth: (baseSize.z / 10) * scale,
      volume: (baseSize.x * baseSize.y * baseSize.z * Math.pow(scale, 3)) / 1000,
      scale
    };
    
    onDimensionsCalculated?.(dimensions);
  }, [scale, baseSize, onDimensionsCalculated]);

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

export default function ModelViewer({ modelUrl, scale = 1 }: ModelViewerProps) {
  const [dimensions, setDimensions] = useState<ModelDimensions | null>(null);
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
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={1} />
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
            {modelUrl ? (
              <Model 
                url={modelUrl} 
                onDimensionsCalculated={setDimensions}
                scale={scale}
              />
            ) : (
              <PlaceholderBox />
            )}
          </Suspense>
        </ModelErrorBoundary>
      </Canvas>

      {/* Dimensions Overlay - moved to top right */}
      {dimensions && (
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg text-sm space-y-1">
          <div className="font-medium text-gray-300">Model Dimensions</div>
          <div className="text-gray-400">
            {dimensions.width.toFixed(2)} × {dimensions.height.toFixed(1)} × {dimensions.depth.toFixed(1)} cm
          </div>
          <div className="text-gray-400">
            Volume: {dimensions.volume.toFixed(3)} cm³
          </div>
        </div>
      )}
    </div>
  );
}