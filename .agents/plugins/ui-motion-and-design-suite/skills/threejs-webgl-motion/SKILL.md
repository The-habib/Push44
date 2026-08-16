---
name: threejs-webgl-motion
description: >-
  Expert guidelines for 3D web animations, WebGL canvas effects, interactive shader backgrounds,
  particle meshes, lighting gradients, and Three.js / React Three Fiber (R3F) performance optimization.
---

# Three.js & WebGL Motion Skill

Guidelines for building high-performance 3D canvas visuals, interactive shader backgrounds, and ambient spatial effects without degrading DOM interactivity.

---

## 1. Core Principles

1. **Background Spatial Enhancement**: 3D canvases should complement content, not fight it for visual dominance or focus.
2. **Strict Performance Throttling**:
   - Limit `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)`.
   - Pause render loop when canvas is offscreen using `IntersectionObserver`.
   - Use instanced meshes (`InstancedMesh`) for particle systems exceeding 50 elements.
3. **Clean Teardown**: Always dispose geometries, materials, and textures when unmounting React components to prevent WebGL context memory leaks.

---

## 2. Interactive Ambient Shader Background

```tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AmbientGlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
          vec2 st = gl_FragCoord.xy / uResolution.xy;
          float dist = distance(st, uMouse);
          vec3 col = mix(vec3(0.05, 0.04, 0.03), vec3(0.95, 0.35, 0.05), (1.0 - dist) * 0.15);
          gl_FragColor = vec4(col, 0.4);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let animationFrameId: number;
    const render = (time: number) => {
      material.uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!container) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      material.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}
```
