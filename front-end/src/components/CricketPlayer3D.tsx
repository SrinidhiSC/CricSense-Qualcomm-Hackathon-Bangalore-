import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// ── Shared materials ──────────────────────────────────────────────────────────

const m = (color: string, roughness = 0.75, metalness = 0.0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

const MAT = {
  skin:    m('#C8936A', 0.78),
  jersey:  m('#0038A8', 0.68, 0.05),
  helmet:  m('#002C8C', 0.38, 0.15),
  visor:   m('#001C6A', 0.32, 0.18),
  grille:  m('#8EA8C0', 0.42, 0.45),
  pads:    m('#F2EEE5', 0.88),
  padLine: m('#D0C8B8', 0.92),
  glove:   m('#8B3510', 0.88),
  bat:     m('#A8822A', 0.74),
  batFace: m('#C09840', 0.76),
  handle:  m('#3D2008', 0.92),
  grip:    m('#2A1205', 0.96),
  shoe:    m('#131820', 0.68, 0.05),
  sole:    m('#2A3A50', 0.62),
  pants:   m('#001A60', 0.72),
  neck:    m('#C08A5A', 0.78),
  jersey7: m('#FFFFFF', 0.72),
  strap:   m('#162040', 0.82),
}

// ── Player geometry ───────────────────────────────────────────────────────────

function Player() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.06
    }
  })

  // All positions are in world space. Player feet at y=0, head top ~y=2.1
  return (
    <group ref={ref}>

      {/* SHOES */}
      <mesh position={[ 0.14, 0.06, 0.06]} material={MAT.shoe} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.07, 0.28]} />
      </mesh>
      <mesh position={[-0.14, 0.06, 0.06]} material={MAT.shoe} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.07, 0.28]} />
      </mesh>
      <mesh position={[ 0.14, 0.03, 0.06]} material={MAT.sole}>
        <boxGeometry args={[0.18, 0.025, 0.30]} />
      </mesh>
      <mesh position={[-0.14, 0.03, 0.06]} material={MAT.sole}>
        <boxGeometry args={[0.18, 0.025, 0.30]} />
      </mesh>

      {/* PADS */}
      <mesh position={[ 0.14, 0.38, 0.07]} material={MAT.pads} castShadow>
        <boxGeometry args={[0.19, 0.58, 0.12]} />
      </mesh>
      <mesh position={[-0.14, 0.38, 0.07]} material={MAT.pads} castShadow>
        <boxGeometry args={[0.19, 0.58, 0.12]} />
      </mesh>
      {[0.2, 0.34, 0.48, 0.6].map((y, i) => (
        <group key={i}>
          <mesh position={[ 0.14, y, 0.135]} material={MAT.padLine}>
            <boxGeometry args={[0.19, 0.016, 0.008]} />
          </mesh>
          <mesh position={[-0.14, y, 0.135]} material={MAT.padLine}>
            <boxGeometry args={[0.19, 0.016, 0.008]} />
          </mesh>
        </group>
      ))}

      {/* UPPER LEGS */}
      <mesh position={[ 0.13, 0.82, 0]} material={MAT.pants} castShadow>
        <capsuleGeometry args={[0.105, 0.34, 8, 16]} />
      </mesh>
      <mesh position={[-0.13, 0.82, 0]} material={MAT.pants} castShadow>
        <capsuleGeometry args={[0.105, 0.34, 8, 16]} />
      </mesh>

      {/* WAIST/HIPS */}
      <mesh position={[0, 1.02, 0]} material={MAT.pants} castShadow>
        <capsuleGeometry args={[0.23, 0.06, 8, 16]} />
      </mesh>

      {/* TORSO */}
      <mesh position={[0, 1.34, 0]} material={MAT.jersey} castShadow>
        <capsuleGeometry args={[0.235, 0.46, 10, 20]} />
      </mesh>
      {/* Jersey number */}
      <mesh position={[0, 1.3, 0.236]} material={MAT.jersey7}>
        <boxGeometry args={[0.09, 0.13, 0.003]} />
      </mesh>

      {/* NECK */}
      <mesh position={[0, 1.63, 0]} material={MAT.neck} castShadow>
        <capsuleGeometry args={[0.082, 0.09, 8, 12]} />
      </mesh>

      {/* HEAD */}
      <mesh position={[0, 1.86, 0]} material={MAT.skin} castShadow>
        <sphereGeometry args={[0.215, 32, 32]} />
      </mesh>
      {/* Ears */}
      <mesh position={[ 0.215, 1.86, 0]} material={MAT.skin}>
        <sphereGeometry args={[0.055, 16, 16]} />
      </mesh>
      <mesh position={[-0.215, 1.86, 0]} material={MAT.skin}>
        <sphereGeometry args={[0.055, 16, 16]} />
      </mesh>

      {/* HELMET DOME */}
      <mesh position={[0, 1.94, 0]} material={MAT.helmet} castShadow>
        <sphereGeometry args={[0.228, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
      </mesh>

      {/* Left ear guard */}
      <mesh position={[0.21, 1.82, -0.02]} rotation={[0, -0.2, 0]} material={MAT.visor} castShadow>
        <capsuleGeometry args={[0.07, 0.12, 8, 12]} />
      </mesh>

      {/* VISOR */}
      <mesh position={[-0.215, 1.82, 0.04]} rotation={[0.2, 0.25, 0.15]} material={MAT.visor} castShadow>
        <boxGeometry args={[0.16, 0.042, 0.16]} />
      </mesh>

      {/* FACE GUARD — vertical bars */}
      {[-0.06, -0.02, 0.02, 0.06].map((z, i) => (
        <mesh key={i} position={[-0.19, 1.80, z]} rotation={[0, 0, Math.PI / 2]} material={MAT.grille} castShadow>
          <capsuleGeometry args={[0.007, 0.12, 6, 8]} />
        </mesh>
      ))}
      {/* Horizontal bars */}
      {[1.76, 1.83].map((y, i) => (
        <mesh key={i} position={[-0.19, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={MAT.grille}>
          <capsuleGeometry args={[0.006, 0.15, 6, 8]} />
        </mesh>
      ))}

      {/* Chin straps */}
      <mesh position={[ 0.1, 1.65, 0.12]} rotation={[0.5, 0.3, -0.25]} material={MAT.strap} castShadow>
        <capsuleGeometry args={[0.018, 0.17, 6, 8]} />
      </mesh>
      <mesh position={[-0.1, 1.65, 0.12]} rotation={[0.5, -0.3, 0.25]} material={MAT.strap} castShadow>
        <capsuleGeometry args={[0.018, 0.17, 6, 8]} />
      </mesh>

      {/* LEFT ARM */}
      <mesh position={[0.365, 1.44, 0]} rotation={[0, 0, -0.38]} material={MAT.jersey} castShadow>
        <capsuleGeometry args={[0.086, 0.28, 8, 14]} />
      </mesh>
      <mesh position={[0.46, 1.17, 0.05]} rotation={[0.1, 0, 0.22]} material={MAT.jersey} castShadow>
        <capsuleGeometry args={[0.073, 0.24, 8, 12]} />
      </mesh>
      <mesh position={[0.44, 1.01, 0.05]} material={MAT.glove} castShadow>
        <sphereGeometry args={[0.098, 20, 20]} />
      </mesh>

      {/* RIGHT ARM */}
      <mesh position={[-0.365, 1.44, 0]} rotation={[0, 0, 0.38]} material={MAT.jersey} castShadow>
        <capsuleGeometry args={[0.086, 0.28, 8, 14]} />
      </mesh>
      <mesh position={[-0.46, 1.17, 0.05]} rotation={[0.1, 0, -0.22]} material={MAT.jersey} castShadow>
        <capsuleGeometry args={[0.073, 0.24, 8, 12]} />
      </mesh>
      <mesh position={[-0.44, 1.01, 0.05]} material={MAT.glove} castShadow>
        <sphereGeometry args={[0.098, 20, 20]} />
      </mesh>

      {/* BAT */}
      <mesh position={[0, 0.6, -0.2]} material={MAT.bat} castShadow>
        <boxGeometry args={[0.1, 0.82, 0.04]} />
      </mesh>
      <mesh position={[0.001, 0.6, -0.178]} material={MAT.batFace}>
        <boxGeometry args={[0.093, 0.78, 0.005]} />
      </mesh>
      <mesh position={[0, 1.05, -0.19]} material={MAT.handle} castShadow>
        <capsuleGeometry args={[0.022, 0.27, 8, 12]} />
      </mesh>
      {[0.95, 1.01, 1.07, 1.13].map((y, i) => (
        <mesh key={i} position={[0, y, -0.19]} rotation={[0, 0, Math.PI / 2]} material={MAT.grip}>
          <torusGeometry args={[0.026, 0.006, 6, 16]} />
        </mesh>
      ))}

    </group>
  )
}

// ── Lights ────────────────────────────────────────────────────────────────────

function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} color="#F5F0EA" />
      {/* Key light — warm front-top */}
      <directionalLight
        position={[2.5, 4.5, 3]}
        intensity={1.6}
        color="#FFF5E8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={3}
        shadow-camera-bottom={-1}
      />
      {/* Fill light — cool left */}
      <directionalLight position={[-3, 2, 1]} intensity={0.5} color="#C8D8F8" />
      {/* Rim light — back */}
      <directionalLight position={[0, 2, -4]} intensity={0.4} color="#E8F0FF" />
    </>
  )
}

// ── Ground shadow plane ───────────────────────────────────────────────────────

function GroundShadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[4, 4]} />
      <shadowMaterial transparent opacity={0.28} />
    </mesh>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

interface Props {
  className?: string
  style?: React.CSSProperties
}

export function CricketPlayer3D({ className, style }: Props) {
  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ position: [0, 1.05, 3.4], fov: 44 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Lights />
        <GroundShadow />
        <Player />
        <OrbitControls
          target={[0, 1.0, 0]}
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 2.2}
          rotateSpeed={0.65}
        />
      </Canvas>
    </div>
  )
}
