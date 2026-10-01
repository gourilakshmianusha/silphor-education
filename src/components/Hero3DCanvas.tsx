import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00A896, 2.0);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x38BDF8, 3, 50);
    blueLight.position.set(-10, 5, -10);
    scene.add(blueLight);

    const tealLight = new THREE.PointLight(0x2DD4BF, 2.5, 40);
    tealLight.position.set(10, 8, 10);
    scene.add(tealLight);

    // Main Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. PCB Substrate (Matte dark blue-green)
    const boardGeo = new THREE.BoxGeometry(20, 0.4, 16);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x071320,
      metalness: 0.3,
      roughness: 0.6,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // 2. Copper PCB Traces
    const traceMat = new THREE.MeshBasicMaterial({ color: 0x00A896 });
    const traceActiveMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });

    const createTrace = (x1: number, z1: number, x2: number, z2: number, active = false) => {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(x2 - x1, z2 - z1);
      const geo = new THREE.PlaneGeometry(0.12, length);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, active ? traceActiveMat : traceMat);
      mesh.position.set((x1 + x2) / 2, 0.22, (z1 + z2) / 2);
      mesh.rotation.y = angle;
      group.add(mesh);
    };

    createTrace(-8, -6, 0, 0, true);
    createTrace(0, 0, 8, 5, true);
    createTrace(-6, 4, 0, 0, false);
    createTrace(0, 0, -4, -6, false);
    createTrace(5, -5, 0, 0, true);
    createTrace(0, 0, 6, -5, false);
    createTrace(-7, 2, -2, 2, true);
    createTrace(-2, 2, 0, 0, true);

    // 3. Central Microcontroller (QFN / BGA Processor)
    const icGeo = new THREE.BoxGeometry(4.2, 0.7, 4.2);
    const icMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ic = new THREE.Mesh(icGeo, icMat);
    ic.position.y = 0.55;
    group.add(ic);

    // Silphor Emblem on top of processor
    const chipCoreGeo = new THREE.BoxGeometry(2.2, 0.05, 2.2);
    const chipCoreMat = new THREE.MeshStandardMaterial({
      color: 0x00A896,
      emissive: 0x00A896,
      emissiveIntensity: 0.6,
      metalness: 0.5,
    });
    const chipCore = new THREE.Mesh(chipCoreGeo, chipCoreMat);
    chipCore.position.y = 0.92;
    group.add(chipCore);

    // 4. IC Pins
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xD1D5DB, metalness: 0.9, roughness: 0.1 });
    for (let i = -1.6; i <= 1.6; i += 0.8) {
      const pinLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), pinMat);
      pinLeft.position.set(-2.2, 0.35, i);
      group.add(pinLeft);

      const pinRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.15), pinMat);
      pinRight.position.set(2.2, 0.35, i);
      group.add(pinRight);
    }

    // 5. Discrete SMD Capacitors & Inductors
    const capMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.4, roughness: 0.3 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rad = 5.5 + (i % 2) * 1.5;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16), capMat);
      cap.position.set(Math.cos(angle) * rad, 0.8, Math.sin(angle) * rad);
      group.add(cap);
    }

    // 6. Signal Pulses traveling on traces
    const pulseGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
    const pulseCount = 10;
    const pulses: { mesh: THREE.Mesh; progress: number; speed: number; start: THREE.Vector3; end: THREE.Vector3 }[] = [];

    for (let i = 0; i < pulseCount; i++) {
      const mesh = new THREE.Mesh(pulseGeo, pulseMat);
      group.add(mesh);
      const angle = (i / pulseCount) * Math.PI * 2;
      const start = new THREE.Vector3(Math.cos(angle) * 7.5, 0.35, Math.sin(angle) * 6);
      const end = new THREE.Vector3(0, 0.35, 0);
      pulses.push({
        mesh,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.008,
        start,
        end,
      });
    }

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.3;
    let targetRotationY = -0.5;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle smooth tilt toward mouse
      targetRotationY = -0.4 + mouseX * 0.4;
      targetRotationX = 0.4 - mouseY * 0.3;
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

      // Pulse Core Glow
      chipCoreMat.emissiveIntensity = 0.4 + Math.sin(elapsedTime * 4) * 0.3;

      // Move signal pulses
      pulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        p.mesh.position.lerpVectors(p.start, p.end, p.progress);
        p.mesh.position.y = 0.35 + Math.sin(p.progress * Math.PI) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] lg:min-h-[460px] cursor-grab active:cursor-grabbing relative"
    >
      <div className="absolute bottom-3 right-3 text-[10px] font-mono uppercase tracking-wider text-teal-400/80 bg-slate-900/80 px-2.5 py-1 rounded-md border border-teal-500/20 pointer-events-none">
        Interactive 3D Substrate • Real-time Shaders
      </div>
    </div>
  );
};
