"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

let universeAudioSingleton: HTMLAudioElement | null = null;
let universeAudioEndedHandler: (() => void) | null = null;

export default function UniverseSphere() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playlist = ["/agora-hills.mp3", "/kiss-me-more.mp3", "/maneater.mp3"];

    if (universeAudioSingleton) {
      if (universeAudioEndedHandler) {
        universeAudioSingleton.removeEventListener("ended", universeAudioEndedHandler);
      }
      universeAudioSingleton.pause();
      universeAudioSingleton.currentTime = 0;
      universeAudioSingleton = null;
      universeAudioEndedHandler = null;
    }

    const getRandomIndex = (exclude: number) => {
      const candidates = playlist
        .map((_, i) => i)
        .filter((i) => i !== exclude);
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    let currentTrackIndex = Math.floor(Math.random() * playlist.length);
    const audio = new Audio(playlist[currentTrackIndex]);
    audio.volume = 0.65;
    audioRef.current = audio;

    const playCurrentTrack = () => {
      audio.src = playlist[currentTrackIndex];
      audio.play().catch(() => {});
    };

    const handleTrackEnded = () => {
      currentTrackIndex = getRandomIndex(currentTrackIndex);
      playCurrentTrack();
    };

    audio.addEventListener("ended", handleTrackEnded);
    universeAudioSingleton = audio;
    universeAudioEndedHandler = handleTrackEnded;
    playCurrentTrack();

    // ===== SCENE =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050010");

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 4, 21);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ✅ FIX COLOR (Three.js mới)
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const mountEl = mountRef.current;
    if (!mountEl) {
      return;
    }
    mountEl.appendChild(renderer.domElement);

    // ===== BLOOM =====
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // ===== RESIZE =====
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // ===== CONTROL =====
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    // ===== PARTICLES =====
    const gu = { time: { value: 0 } };

    const sizes: number[] = [];
    const shift: number[] = [];

    const pushShift = () => {
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    };

    let pts = new Array(25000).fill(0).map(() => {
      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
      return new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(Math.random() * 0.5 + 9.5);
    });

    for (let i = 0; i < 50000; i++) {
      let r = 10,
        R = 40;
      let rand = Math.pow(Math.random(), 1.5);
      let radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);

      pts.push(
        new THREE.Vector3().setFromCylindricalCoords(
          radius,
          Math.random() * 2 * Math.PI,
          (Math.random() - 0.5) * 2
        )
      );

      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
    }

    const g = new THREE.BufferGeometry().setFromPoints(pts);
    g.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
    g.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));

    const m = new THREE.PointsMaterial({
      size: 0.12,
      transparent: true,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    m.onBeforeCompile = (shader: any) => {
      shader.uniforms.time = gu.time;

      shader.vertexShader = `
          uniform float time;
          attribute float sizes;
          attribute vec4 shift;
          varying vec3 vColor;
          ${shader.vertexShader}
        `
        .replace(`gl_PointSize = size;`, `gl_PointSize = size * sizes;`)
        .replace(
  `#include <color_vertex>`,
  `#include <color_vertex>
  float d = length(abs(position) / vec3(40., 10., 40.));
  d = clamp(d, 0., 1.);

  vec3 blue = vec3(80.,160.,255.) / 255.;
  vec3 pink = vec3(255.,105.,180.) / 255.;
  vec3 purple = vec3(140.,0.,255.) / 255.;

  vec3 color1 = mix(blue, pink, smoothstep(0.0, 0.5, d));
  vec3 color2 = mix(pink, purple, smoothstep(0.5, 1.0, d));

  vColor = mix(color1, color2, step(0.5, d));
`
)
        .replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            float t = time;
            float moveT = mod(shift.x + shift.z * t, PI2);
            float moveS = mod(shift.y + shift.z * t, PI2);
            transformed += vec3(
              cos(moveS) * sin(moveT),
              cos(moveT),
              sin(moveS) * sin(moveT)
            ) * shift.a;
          `
        );

      shader.fragmentShader = `
          varying vec3 vColor;
          ${shader.fragmentShader}
        `
        .replace(
          `void main() {`,
          `void main() {
              float d = length(gl_PointCoord.xy - 0.5);
              if (d > 0.5) discard;
            `
        )
        .replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `vec4 diffuseColor = vec4(vColor, smoothstep(0.1, 0.5, d));`
        );
    };

    const particles = new THREE.Points(g, m);
    particles.rotation.z = 0.2;
    scene.add(particles);

    // ===== IMAGE GROUP =====
    const imageGroup = new THREE.Group();
    // scene.add(imageGroup);

    const textureLoader = new THREE.TextureLoader();
    const imagePaths = Array.from({ length: 35 }, (_, i) => `/universeImages/${i + 1}.png`);

    imagePaths.forEach((path) => {
      textureLoader.load(path, (texture) => {
        // ✅ FIX COLOR
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: true,
          opacity: 0.75,
        });

        material.toneMapped = false;

        const sprite = new THREE.Sprite(material);

        // ===== RANDOM TRÊN VÀNH ĐAI =====
        const r = 10;
        const R = 40;

        const rand = Math.pow(Math.random(), 1.5);
        const radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);

        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 2;

        sprite.position.set(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );

        // ✅ SCALE THEO DEPTH
        const scale = THREE.MathUtils.mapLinear(radius, r, R, 2.2, 1.0);
        sprite.scale.set(scale, scale, scale);

        // random rotation nhẹ
        // sprite.material.rotation = Math.random() * Math.PI;

        imageGroup.add(sprite);
      });
    });

    // ===== ANIMATE =====
    const clock = new THREE.Clock();

    const animate = () => {
      controls.update();

      const t = clock.getElapsedTime() * 0.5;
      gu.time.value = t * Math.PI;

      particles.rotation.y = t * 0.05;

      // ảnh quay cùng hệ
      // imageGroup.rotation.y = particles.rotation.y;
      
      composer.render();
    };
    particles.add(imageGroup);

    renderer.setAnimationLoop(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      audio.removeEventListener("ended", handleTrackEnded);
      audio.pause();
      audio.currentTime = 0;
      if (universeAudioSingleton === audio) {
        universeAudioSingleton = null;
        universeAudioEndedHandler = null;
      }
      audioRef.current = null;
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          top: "24px",
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontSize: "1.6rem",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textShadow: "0 0 12px #a855f7, 0 0 24px #ec4899",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Ú òa, bạn đã lạc vào Vũ trụ này chỉ có Lỏ &lt;3
      </div>
    </div>
  );
}