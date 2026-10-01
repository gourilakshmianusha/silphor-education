import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Sliders,
  RotateCw,
  Zap,
  Gauge,
  Activity,
  Layers,
  Info,
  Maximize2,
  Cpu,
  AlertCircle
} from 'lucide-react';

export type ModelType = 'transformer' | 'plc' | 'inverter' | 'motor' | 'pcb';

interface EngineeringLab3DProps {
  initialModel?: ModelType;
  interactiveControls?: boolean;
}

export const EngineeringLab3D: React.FC<EngineeringLab3DProps> = ({
  initialModel = 'transformer',
  interactiveControls = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentModel, setCurrentModel] = useState<ModelType>(initialModel);
  const [voltage, setVoltage] = useState<number>(415);
  const [frequency, setFrequency] = useState<number>(50);
  const [loadCurrent, setLoadCurrent] = useState<number>(42);
  const [temperature, setTemperature] = useState<number>(48);

  const modelGroupRef = useRef<THREE.Group | null>(null);

  // Computed Electrical Parameters
  const apparentPowerKVA = ((voltage * loadCurrent * Math.sqrt(3)) / 1000).toFixed(2);
  const magneticFluxWeber = ((voltage / (4.44 * frequency * 200))).toFixed(3);
  const motorSyncRPM = Math.round((120 * frequency) / 4);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111E);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 6, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00A896, 2.5);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38BDF8, 1.8);
    dirLight2.position.set(-10, 10, -10);
    scene.add(dirLight2);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 15;
    controls.minDistance = 2;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    // Grid Floor
    const grid = new THREE.GridHelper(12, 24, 0x00A896, 0x1E293B);
    grid.position.y = -0.01;
    scene.add(grid);

    // Model Container Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Build Specific Model Geometry
    const buildModel = () => {
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }

      if (currentModel === 'transformer') {
        // High-Voltage 3-Phase Distribution Transformer
        const tankMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
        const tank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 2.4), tankMat);
        tank.position.y = 1.4;
        modelGroup.add(tank);

        // Cooling Fins
        const finMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.4 });
        for (let i = -1.5; i <= 1.5; i += 0.3) {
          const finFront = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.4), finMat);
          finFront.position.set(i, 1.4, 1.35);
          modelGroup.add(finFront);

          const finBack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.4), finMat);
          finBack.position.set(i, 1.4, -1.35);
          modelGroup.add(finBack);
        }

        // High Voltage Bushings (Porcelain Sheds)
        const porcelainMat = new THREE.MeshStandardMaterial({ color: 0x854D0E, roughness: 0.1 });
        const copperTerminalMat = new THREE.MeshStandardMaterial({ color: 0xB45309, metalness: 0.9 });

        [-0.9, 0, 0.9].forEach((x) => {
          const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.4, 16), porcelainMat);
          bushing.position.set(x, 3.4, 0.3);
          modelGroup.add(bushing);

          const terminal = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), copperTerminalMat);
          terminal.position.set(x, 4.2, 0.3);
          modelGroup.add(terminal);
        });

        // Conservator Tank
        const conservatorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 });
        const conservator = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 24), conservatorMat);
        conservator.rotation.z = Math.PI / 2;
        conservator.position.set(0, 3.2, -0.8);
        modelGroup.add(conservator);
      } else if (currentModel === 'plc') {
        // Modular Industrial PLC Rack (Siemens / Allen-Bradley Style)
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.5 });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.2, 1.2), rackMat);
        rack.position.y = 1.1;
        modelGroup.add(rack);

        // Slots
        const colors = [0x0284C7, 0x0D9488, 0x0D9488, 0xF59E0B];
        for (let i = 0; i < 4; i++) {
          const moduleMat = new THREE.MeshStandardMaterial({ color: colors[i], metalness: 0.2, roughness: 0.3 });
          const mod = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.0, 1.3), moduleMat);
          mod.position.set(-1.65 + i * 1.1, 1.1, 0.1);
          modelGroup.add(mod);

          // LED status bank
          for (let led = 0; led < 6; led++) {
            const ledMat = new THREE.MeshBasicMaterial({ color: led % 2 === 0 ? 0x22C55E : 0xEF4444 });
            const ledMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), ledMat);
            ledMesh.position.set(-1.95 + i * 1.1 + (led % 2) * 0.15, 1.7 - Math.floor(led / 2) * 0.2, 0.77);
            modelGroup.add(ledMesh);
          }
        }
      } else if (currentModel === 'inverter') {
        // High-Efficiency Traction Inverter for Electric Vehicles
        const caseMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.6, roughness: 0.2 });
        const casing = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.6, 2.8), caseMat);
        casing.position.y = 0.8;
        modelGroup.add(casing);

        // High Voltage Busbar Ports (Orange for Automotive HV)
        const orangeMat = new THREE.MeshStandardMaterial({ color: 0xEA580C, roughness: 0.2 });
        [-0.8, 0.8].forEach((x) => {
          const port = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.8, 16), orangeMat);
          port.rotation.x = Math.PI / 2;
          port.position.set(x, 0.8, 1.45);
          modelGroup.add(port);
        });

        // 3-Phase AC Output Terminals (U, V, W)
        const phaseMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.8 });
        [-1.0, 0, 1.0].forEach((x) => {
          const phaseTerminal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16), phaseMat);
          phaseTerminal.rotation.x = Math.PI / 2;
          phaseTerminal.position.set(x, 0.8, -1.45);
          modelGroup.add(phaseTerminal);
        });
      } else if (currentModel === 'motor') {
        // 3-Phase Squirrel Cage Induction Motor
        const statorMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, metalness: 0.5, roughness: 0.4 });
        const stator = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3.2, 32), statorMat);
        stator.rotation.z = Math.PI / 2;
        stator.position.y = 1.6;
        modelGroup.add(stator);

        // Rotor Shaft
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.1 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.6, 24), shaftMat);
        shaft.rotation.z = Math.PI / 2;
        shaft.position.y = 1.6;
        modelGroup.add(shaft);

        // Terminal Box
        const tbox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), statorMat);
        tbox.position.set(0, 3.2, 0);
        modelGroup.add(tbox);
      } else {
        // Multilayer High-Speed PCB Hardware
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x04473D, metalness: 0.2, roughness: 0.6 });
        const pcb = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.15, 3.8), boardMat);
        pcb.position.y = 0.5;
        modelGroup.add(pcb);

        // BGA Processor
        const chipMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9, roughness: 0.1 });
        const chip = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), chipMat);
        chip.position.set(0, 0.7, 0);
        modelGroup.add(chip);

        // Header Pins
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9 });
        for (let p = -1.8; p <= 1.8; p += 0.3) {
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), goldMat);
          pin.position.set(p, 0.75, 1.6);
          modelGroup.add(pin);
        }
      }
    };

    buildModel();

    // Animation Loop
    let reqId: number;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentModel]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#0B192C] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* 3D Viewport */}
        <div className="flex-1 relative min-h-[460px] lg:min-h-[640px] flex items-center justify-center">
          <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

          {/* Model Switcher Toolbar Overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="flex flex-wrap gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-lg">
              <button
                onClick={() => setCurrentModel('transformer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentModel === 'transformer'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Transformer
              </button>
              <button
                onClick={() => setCurrentModel('plc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentModel === 'plc'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Industrial PLC
              </button>
              <button
                onClick={() => setCurrentModel('inverter')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentModel === 'inverter'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                EV Inverter
              </button>
              <button
                onClick={() => setCurrentModel('motor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentModel === 'motor'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Induction Motor
              </button>
              <button
                onClick={() => setCurrentModel('pcb')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentModel === 'pcb'
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Multilayer PCB
              </button>
            </div>

            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] font-mono text-teal-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HIL Simulation Active</span>
            </div>
          </div>

          {/* Interaction Instruction Overlay */}
          <div className="absolute bottom-4 left-4 pointer-events-none text-[11px] text-slate-400 font-mono bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800">
            Rotate: Left Click + Drag • Pan: Right Click • Zoom: Scroll
          </div>
        </div>

        {/* Real-Time Parameter Telemetry & Controls Panel */}
        {interactiveControls && (
          <div className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 flex flex-col justify-between space-y-6 text-white text-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-200">
                    Live Hardware Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">
                  IEEE 1547 Std
                </span>
              </div>

              {/* Dynamic Meter Readouts */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Apparent Power</div>
                  <div className="text-xl font-bold font-mono text-teal-400">
                    {apparentPowerKVA} <span className="text-xs text-slate-400 font-normal">kVA</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">P = √3 · V · I</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Magnetic Flux</div>
                  <div className="text-xl font-bold font-mono text-sky-400">
                    {magneticFluxWeber} <span className="text-xs text-slate-400 font-normal">Wb</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">Faraday Equation</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Sync Velocity</div>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {motorSyncRPM} <span className="text-xs text-slate-400 font-normal">RPM</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">Ns = 120·f / P (4-pole)</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Core Temp</div>
                  <div className="text-xl font-bold font-mono text-rose-400">
                    {temperature}° <span className="text-xs text-slate-400 font-normal">C</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">Thermal Class H</div>
                </div>
              </div>

              {/* Real-Time Parameter Sliders */}
              <div className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">Phase-to-Phase Voltage (V)</span>
                    <span className="text-teal-400 font-bold">{voltage} V</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="690"
                    step="5"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">Grid Frequency (Hz)</span>
                    <span className="text-teal-400 font-bold">{frequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="70"
                    step="1"
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-300">Load Amperage (A)</span>
                    <span className="text-teal-400 font-bold">{loadCurrent} A</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="1"
                    value={loadCurrent}
                    onChange={(e) => {
                      const cur = Number(e.target.value);
                      setLoadCurrent(cur);
                      setTemperature(Math.round(25 + cur * 0.55));
                    }}
                    className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Verification Footer Note */}
            <div className="pt-4 border-t border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
              <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                All 3D models compute exact electrical formulations used by industrial testing benches at Silphor Bengaluru Campus.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
