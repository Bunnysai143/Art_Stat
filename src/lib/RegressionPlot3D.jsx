import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';



const generateData = (numPoints= 600)=> {
  const data= [];
  for (let i = 0; i < numPoints; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const baseZ = 2 * x - 1.5 * y + 3;
    const noise = (Math.random() - 0.5) * 2;
    const z = baseZ + noise;
    const classValue = baseZ > 3 ? 1 : 0;
    
    data.push({ x, y, z, class: classValue});
  }
  return data;
};

const DataPoints = ({ data }) => {
  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(data.length * 3);
    const colors = new Float32Array(data.length * 3);

    data.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      const color = point.class === 1 ? 
        new THREE.Color(0x3b82f6) : // Blue
        new THREE.Color(0xef4444); // Red

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, [data]);

  return (
    <points>
      <primitive object={pointsGeometry} />
      <pointsMaterial size={0.15} vertexColors />
    </points>
  );
};

const RegressionPlane= () => {
  const planeGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      positions[i + 2] = 2 * x - 1.5 * y + 3; // z = 2x - 1.5y + 3
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <mesh geometry={planeGeometry}>
      <meshPhongMaterial 
        color={0x22c55e}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const GridAndAxes= () => {
  return (
    <>
      <gridHelper args={[10, 10]} rotation={[Math.PI / 2, 0, 0]} />
      <axesHelper args={[5]} />
      <Text
        position={[6, 0, 0]}
        rotation={[0, 0, 0]}
        color="black"
        fontSize={0.5}
      >
        X
      </Text>
      <Text
        position={[0, 6, 0]}
        rotation={[0, 0, 0]}
        color="black"
        fontSize={0.5}
      >
        Y
      </Text>
      <Text
        position={[0, 0, 6]}
        rotation={[0, 0, 0]}
        color="black"
        fontSize={0.5}
      >
        Z
      </Text>
    </>
  );
};

const RegressionPlot3D= () => {
  const data = useMemo(() => generateData(200), []);

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [8, 8, 8], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <DataPoints data={data} />
        <RegressionPlane />
        <GridAndAxes />
        <OrbitControls enableDamping dampingFactor={0.05} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Legend</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Class 1 (Z {'>'} 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Class 0 (Z ≤ 3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 opacity-50"></div>
            <span className="text-sm">Regression Plane</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegressionPlot3D;