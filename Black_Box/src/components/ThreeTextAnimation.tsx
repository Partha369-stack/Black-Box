import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

interface ThreeTextAnimationProps {
  text: string
  className?: string
}

const ThreeTextAnimation = ({ text, className = '' }: ThreeTextAnimationProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const textMeshRef = useRef<THREE.Mesh>()
  const animationIdRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // Transparent background
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Create proper 3D extruded text like trae.ai
    const createText = async () => {
      const textGroup = new THREE.Group()

      // Create a simple font using shapes (since loading external fonts can be complex)
      const createLetterGeometry = (letter: string) => {
        // Create extruded text geometry
        const shape = new THREE.Shape()

        // Simple letter shapes - you can enhance this
        switch(letter.toUpperCase()) {
          case 'B':
            // Create B shape
            shape.moveTo(0, 0)
            shape.lineTo(0, 2)
            shape.lineTo(1.2, 2)
            shape.bezierCurveTo(1.6, 2, 1.8, 1.8, 1.8, 1.5)
            shape.bezierCurveTo(1.8, 1.2, 1.6, 1, 1.2, 1)
            shape.lineTo(1.4, 1)
            shape.bezierCurveTo(1.7, 1, 1.9, 0.8, 1.9, 0.5)
            shape.bezierCurveTo(1.9, 0.2, 1.7, 0, 1.4, 0)
            shape.lineTo(0, 0)
            break
          case 'L':
            shape.moveTo(0, 0)
            shape.lineTo(0, 2)
            shape.lineTo(0.3, 2)
            shape.lineTo(0.3, 0.3)
            shape.lineTo(1.5, 0.3)
            shape.lineTo(1.5, 0)
            shape.lineTo(0, 0)
            break
          case 'A':
            shape.moveTo(0.75, 2)
            shape.lineTo(0, 0)
            shape.lineTo(0.3, 0)
            shape.lineTo(0.5, 0.6)
            shape.lineTo(1, 0.6)
            shape.lineTo(1.2, 0)
            shape.lineTo(1.5, 0)
            shape.lineTo(0.75, 2)
            break
          case 'C':
            shape.moveTo(1.5, 0.3)
            shape.bezierCurveTo(1.5, 0.1, 1.3, 0, 1, 0)
            shape.bezierCurveTo(0.4, 0, 0, 0.4, 0, 1)
            shape.bezierCurveTo(0, 1.6, 0.4, 2, 1, 2)
            shape.bezierCurveTo(1.3, 2, 1.5, 1.9, 1.5, 1.7)
            shape.lineTo(1.2, 1.7)
            shape.bezierCurveTo(1.2, 1.8, 1.1, 1.8, 1, 1.8)
            shape.bezierCurveTo(0.6, 1.8, 0.3, 1.5, 0.3, 1)
            shape.bezierCurveTo(0.3, 0.5, 0.6, 0.2, 1, 0.2)
            shape.bezierCurveTo(1.1, 0.2, 1.2, 0.2, 1.2, 0.3)
            shape.lineTo(1.5, 0.3)
            break
          case 'K':
            shape.moveTo(0, 0)
            shape.lineTo(0, 2)
            shape.lineTo(0.3, 2)
            shape.lineTo(0.3, 1.2)
            shape.lineTo(1, 2)
            shape.lineTo(1.4, 2)
            shape.lineTo(0.8, 1.1)
            shape.lineTo(1.4, 0)
            shape.lineTo(1, 0)
            shape.lineTo(0.6, 0.8)
            shape.lineTo(0.3, 0.5)
            shape.lineTo(0.3, 0)
            shape.lineTo(0, 0)
            break
          case 'O':
            shape.moveTo(0.75, 0)
            shape.bezierCurveTo(0.3, 0, 0, 0.4, 0, 1)
            shape.bezierCurveTo(0, 1.6, 0.3, 2, 0.75, 2)
            shape.bezierCurveTo(1.2, 2, 1.5, 1.6, 1.5, 1)
            shape.bezierCurveTo(1.5, 0.4, 1.2, 0, 0.75, 0)
            // Inner hole
            const hole = new THREE.Path()
            hole.moveTo(0.75, 0.3)
            hole.bezierCurveTo(1, 0.3, 1.2, 0.5, 1.2, 1)
            hole.bezierCurveTo(1.2, 1.5, 1, 1.7, 0.75, 1.7)
            hole.bezierCurveTo(0.5, 1.7, 0.3, 1.5, 0.3, 1)
            hole.bezierCurveTo(0.3, 0.5, 0.5, 0.3, 0.75, 0.3)
            shape.holes.push(hole)
            break
          case 'X':
            shape.moveTo(0, 0)
            shape.lineTo(0.4, 0)
            shape.lineTo(0.75, 0.6)
            shape.lineTo(1.1, 0)
            shape.lineTo(1.5, 0)
            shape.lineTo(0.95, 1)
            shape.lineTo(1.5, 2)
            shape.lineTo(1.1, 2)
            shape.lineTo(0.75, 1.4)
            shape.lineTo(0.4, 2)
            shape.lineTo(0, 2)
            shape.lineTo(0.55, 1)
            shape.lineTo(0, 0)
            break
          default:
            // Default rectangle for unknown letters
            shape.moveTo(0, 0)
            shape.lineTo(0, 2)
            shape.lineTo(1, 2)
            shape.lineTo(1, 0)
            shape.lineTo(0, 0)
        }

        const extrudeSettings = {
          depth: 0.4,
          bevelEnabled: true,
          bevelSegments: 8,
          steps: 1,
          bevelSize: 0.05,
          bevelThickness: 0.05
        }

        return new THREE.ExtrudeGeometry(shape, extrudeSettings)
      }

      const letters = text.split('')
      let xOffset = 0

      letters.forEach((letter, index) => {
        if (letter === ' ') {
          xOffset += 1
          return
        }

        const geometry = createLetterGeometry(letter)

        // Create gradient-like material
        const material = new THREE.MeshPhongMaterial({
          color: 0x000000,
          shininess: 100,
          transparent: false,
        })

        const letterMesh = new THREE.Mesh(geometry, material)

        // Position letters
        letterMesh.position.x = xOffset - (text.length * 0.8)
        letterMesh.position.y = -1
        letterMesh.position.z = 0

        letterMesh.userData = {
          originalPosition: letterMesh.position.clone(),
          index
        }

        textGroup.add(letterMesh)
        xOffset += 1.8
      })

      return textGroup
    }

    // Create text asynchronously
    createText().then(textMesh => {
      textMeshRef.current = textMesh
      scene.add(textMesh)
    })

    // Enhanced lighting for 3D text
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(10, 10, 5)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-10, -10, -5)
    scene.add(directionalLight2)

    // Add point light for dramatic effect
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 100)
    pointLight.position.set(0, 5, 5)
    scene.add(pointLight)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      if (textMeshRef.current) {
        const time = Date.now() * 0.001

        // Smooth rotation of entire text group - like trae.ai
        textMeshRef.current.rotation.y = time * 0.2
        textMeshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1

        // Animate individual letters
        textMeshRef.current.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh && child.userData.originalPosition) {
            const letterIndex = child.userData.index || 0
            const waveOffset = letterIndex * 0.3

            // Floating animation - each letter moves independently
            child.position.y = child.userData.originalPosition.y + Math.sin(time * 1.5 + waveOffset) * 0.3
            child.position.z = child.userData.originalPosition.z + Math.sin(time * 2 + waveOffset) * 0.2

            // Individual letter rotation
            child.rotation.x = Math.sin(time * 0.8 + waveOffset) * 0.1
            child.rotation.z = Math.sin(time * 1.2 + waveOffset) * 0.05

            // Subtle scaling
            const scale = 1 + Math.sin(time * 2 + waveOffset) * 0.03
            child.scale.setScalar(scale)

            // Material color animation
            if (child.material instanceof THREE.MeshPhongMaterial) {
              const intensity = 0.1 + Math.sin(time + waveOffset) * 0.05
              child.material.color.setRGB(intensity, intensity, intensity)
            }
          }
        })
      }

      // Smooth camera movement - like trae.ai
      if (cameraRef.current) {
        const time = Date.now() * 0.0002
        cameraRef.current.position.x = Math.sin(time) * 2
        cameraRef.current.position.y = Math.cos(time * 0.8) * 1
        cameraRef.current.position.z = 8 + Math.sin(time * 0.3) * 1
        cameraRef.current.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      window.removeEventListener('resize', handleResize)
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js objects
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      renderer.dispose()
    }
  }, [text])

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-64 ${className}`}
      style={{ 
        background: 'transparent',
        overflow: 'hidden'
      }}
    />
  )
}

export default ThreeTextAnimation
