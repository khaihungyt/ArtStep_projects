"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, useTexture } from "@react-three/drei"
import { useSnapshot } from "valtio"
import state from "./canvas/store"

function ShoeModel() {
    const { nodes } = useGLTF("/models/shoe.glb") as any
    const snap = useSnapshot(state)

    const logoTexture = useTexture(snap.logoDecal)

    return (
        <mesh geometry={nodes.Shoe.geometry}>
            <meshStandardMaterial
                color={snap.color}
                map={snap.isLogoTexture ? logoTexture : null}
            />
        </mesh>
    )
}

export default function Shoe3DViewer() {
    return (
        <div className="w-full h-[500px] bg-white rounded border">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <ShoeModel />
                <OrbitControls />
            </Canvas>
        </div>
    )
}
