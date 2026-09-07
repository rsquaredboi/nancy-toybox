'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type NetControls = { serve: () => void; reset: () => void };
type Props = { still: boolean; active: boolean; onReady: () => void; onCatch: () => void; onServe: () => void; onFailure: () => void; onControls: (controls: NetControls | null) => void };

const clamp = THREE.MathUtils.clamp;
const ease = (t: number) => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };

// A choreographed surface, connected by spring motion, makes the embrace stable
// on every device. Input controls the ball; the final silhouette is authored.
export default function NetScene({ still, active, onReady, onCatch, onServe, onFailure, onControls }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ still, active, onCatch, onServe });
  useEffect(() => { live.current = { still, active, onCatch, onServe }; }, [still, active, onCatch, onServe]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch { onFailure(); return; }
    let disposed = false, visible = true, frame = 0, last = 0, clock = 0;
    let phase: 'waiting' | 'flying' | 'caught' = 'waiting';
    let flight = 0, embrace = 0, velocity = 0, dragging = false;
    const scene = new THREE.Scene();
    // Photograph supplies the room; this transparent scene supplies objects and contact shadows.
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .93;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.appendChild(renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const env = pmrem.fromScene(environment, .04);
    scene.environment = env.texture;
    scene.environmentIntensity = .45;
    environment.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight('#fff0db', '#49382a', 1.9));
    const sun = new THREE.DirectionalLight('#fff1da', 3.2);
    sun.position.set(-6, 10, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: .5, far: 35 });
    sun.shadow.normalBias = .025; sun.shadow.bias = -.0002;
    sun.shadow.radius = 3;
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#f29bb5', .8); fill.position.set(5, 4, 2); scene.add(fill);

    const noise = new Uint8Array(128 * 128 * 4);
    let seed = 817;
    for (let i = 0; i < noise.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const value = 95 + seed % 125;
      noise[i] = noise[i + 1] = noise[i + 2] = value; noise[i + 3] = 255;
    }
    const texture = new THREE.DataTexture(noise, 128, 128, THREE.RGBAFormat);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8); texture.needsUpdate = true;
    const floorMat = new THREE.ShadowMaterial({ color: '#3d2836', opacity: .27 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ivory = new THREE.MeshStandardMaterial({ color: '#fff0d5', roughness: .93, bumpMap: texture, bumpScale: .04 });
    const chrome = new THREE.MeshStandardMaterial({ color: '#e0e7df', metalness: .96, roughness: .17 });
    const group = new THREE.Group(); group.position.set(1.4, 0, 0); group.rotation.y = -.12; scene.add(group);
    for (const x of [-2.8, 2.8]) {
      const post = new THREE.Mesh(new THREE.CapsuleGeometry(.085, 3.18, 5, 14), chrome);
      post.position.set(x, 1.69, 0); post.castShadow = true; group.add(post);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.27, .3, .045, 32), chrome);
      base.position.set(x, .03, 0); base.castShadow = true; group.add(base);
      const fitting = new THREE.Mesh(new THREE.TorusGeometry(.095, .014, 8, 20), chrome);
      fitting.rotation.x = Math.PI / 2; fitting.position.set(x, 2.98, 0); group.add(fitting);
    }
    const ball = new THREE.Group(); group.add(ball);
    const ballMat = new THREE.MeshStandardMaterial({ color: '#d55c8a', roughness: 1, bumpMap: texture, bumpScale: .035 });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.98, 64, 40), ballMat); orb.castShadow = true; orb.receiveShadow = true; ball.add(orb);
    const seamPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) {
      const a = i / 160 * Math.PI * 2;
      const phi = Math.PI / 2 + .6 * Math.sin(a * 2);
      seamPoints.push(new THREE.Vector3(.986 * Math.sin(phi) * Math.cos(a), .986 * Math.cos(phi), .986 * Math.sin(phi) * Math.sin(a)));
    }
    const seam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seamPoints, true), 180, .027, 7, true), ivory); ball.add(seam);
    const start = new THREE.Vector3(-2.15, 1.01, 3.3);
    const end = new THREE.Vector3(0, 1.26, .22);
    ball.position.copy(start); ball.rotation.set(.3, .1, -.35);
    const fiberPositions = new Float32Array(2100 * 3);
    for (let i = 0; i < 2100; i++) {
      const a = i * 2.399963;
      const y = 1 - (i / 2099) * 2;
      const r = Math.sqrt(1 - y * y);
      fiberPositions.set([Math.cos(a) * r * .989, y * .989, Math.sin(a) * r * .989], i * 3);
    }
    const fiberGeo = new THREE.BufferGeometry(); fiberGeo.setAttribute('position', new THREE.BufferAttribute(fiberPositions, 3));
    ball.add(new THREE.Points(fiberGeo, new THREE.PointsMaterial({ color: '#f7aac6', size: .015, transparent: true, opacity: .4, depthWrite: false })));
    const cols = 36, rows = 17;
    const count = (cols + 1) * rows + (rows + 1) * cols;
    const ropes = new THREE.InstancedMesh(new THREE.CylinderGeometry(.0115, .0115, 1, 6), ivory, count);
    ropes.castShadow = true; ropes.receiveShadow = true; ropes.frustumCulled = false;
    ropes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(ropes);
    const binding = new THREE.InstancedMesh(new THREE.CylinderGeometry(.035, .035, 1, 8), ivory, cols * 2);
    binding.castShadow = true; binding.frustumCulled = false; binding.instanceMatrix.setUsage(THREE.DynamicDrawUsage); group.add(binding);
    const points = Array.from({ length: (cols + 1) * (rows + 1) }, () => new THREE.Vector3());
    const dummy = new THREE.Object3D(), direction = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    const pointer = new THREE.Vector2();
    let hover = 0, targetHover = 0;
    const updateNet = () => {
      for (let ix = 0; ix <= cols; ix++) for (let iy = 0; iy <= rows; iy++) {
        const u = ix / cols, v = iy / rows, x = (u - .5) * 5.6;
        const center = Math.pow(Math.sin(u * Math.PI), 2.1);
        const a = (v - .5) * Math.PI * 1.16;
        const idleY = 3.16 - v * 2.86 - Math.sin(u * Math.PI) * .17;
        const cupY = 1.26 - 1.04 * Math.cos(a);
        const cupZ = .22 + 1.04 * Math.sin(a);
        const blend = center * embrace;
        const ripple = live.current.still ? 0 : Math.sin(u * 8 + clock * .85) * Math.sin(v * Math.PI) * .028;
        points[ix * (rows + 1) + iy].set(x, THREE.MathUtils.lerp(idleY, cupY, blend), cupZ * blend + ripple + center * hover * .12);
      }
      const connect = (mesh: THREE.InstancedMesh, n: number, a: THREE.Vector3, b: THREE.Vector3) => {
        direction.subVectors(b, a); dummy.position.copy(a).add(b).multiplyScalar(.5);
        const length = direction.length();
        dummy.quaternion.setFromUnitVectors(up, direction.divideScalar(length || 1));
        dummy.scale.set(1, length, 1); dummy.updateMatrix(); mesh.setMatrixAt(n, dummy.matrix);
      };
      let n = 0;
      for (let x = 0; x <= cols; x++) for (let y = 0; y < rows; y++) connect(ropes, n++, points[x * (rows + 1) + y], points[x * (rows + 1) + y + 1]);
      for (let y = 0; y <= rows; y++) for (let x = 0; x < cols; x++) connect(ropes, n++, points[x * (rows + 1) + y], points[(x + 1) * (rows + 1) + y]);
      for (let x = 0; x < cols; x++) {
        connect(binding, x, points[x * (rows + 1)], points[(x + 1) * (rows + 1)]);
        connect(binding, x + cols, points[x * (rows + 1) + rows], points[(x + 1) * (rows + 1) + rows]);
      }
      ropes.instanceMatrix.needsUpdate = true; binding.instanceMatrix.needsUpdate = true;
    };
    const reset = () => { phase = 'waiting'; flight = 0; embrace = 0; velocity = 0; ball.position.copy(start); ball.scale.setScalar(1); updateNet(); renderOnce(); };
    let launch = start.clone();
    const serve = () => {
      if (phase !== 'waiting') return;
      dragging = false; phase = 'flying'; flight = 0; launch = ball.position.clone(); live.current.onServe();
      if (live.current.still) { phase = 'caught'; embrace = 1; ball.position.copy(end); updateNet(); renderOnce(); live.current.onCatch(); }
    };
    onControls({ serve, reset });
    const ray = new THREE.Raycaster(), hit = new THREE.Vector3();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3.1);
    const setPointer = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1); ray.setFromCamera(pointer, camera);
    };
    const down = (e: PointerEvent) => {
      if (phase !== 'waiting' || !live.current.active) return;
      setPointer(e);
      if (ray.intersectObject(orb).length) { dragPlane.constant = -ball.getWorldPosition(hit).z; dragging = true; el.setPointerCapture(e.pointerId); el.style.touchAction = 'none'; e.preventDefault(); }
    };
    const move = (e: PointerEvent) => {
      setPointer(e); targetHover = clamp(pointer.x, -1, 1);
      if (!dragging) return;
      if (ray.ray.intersectPlane(dragPlane, hit)) { group.worldToLocal(hit); ball.position.set(clamp(hit.x, -4, 3), clamp(hit.y, 1, 4), start.z); renderOnce(); }
    };
    const release = (e: PointerEvent) => { if (!dragging) return; dragging = false; if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId); el.style.touchAction = ''; serve(); };
    const cancel = (e: PointerEvent) => { if (!dragging) return; dragging = false; if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId); el.style.touchAction = ''; ball.position.copy(start); renderOnce(); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', release); el.addEventListener('pointercancel', cancel);
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h); camera.aspect = w / h;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      start.set(mobile ? -1.6 : -2.15, 1.01, mobile ? 2.7 : 3.3);
      if (phase === 'waiting' && !dragging) ball.position.copy(start);
      camera.fov = mobile ? 43 : 34;
      camera.position.set(mobile ? 5.1 : 7.6, mobile ? 6 : 5.5, mobile ? 14.8 : w < 1100 ? 18 : 15.5);
      camera.lookAt(mobile ? 1.2 : w < 1100 ? .3 : -.5, mobile ? 2.1 : w < 1100 ? 2.1 : 2.5, 0);
      camera.updateProjectionMatrix(); updateNet(); renderOnce();
    };
    function renderOnce() { if (!disposed) renderer.render(scene, camera); }
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const dt = Math.min((now - (last || now)) / 1000, .035); last = now;
      if (live.current.still && phase === 'flying') {
        phase = 'caught'; embrace = 1; velocity = 0; ball.position.copy(end); ball.scale.setScalar(1); updateNet(); renderOnce(); live.current.onCatch();
      }
      if (!visible || document.hidden || !live.current.active || live.current.still) return;
      clock += dt;
      hover += (targetHover - hover) * .035;
      if (phase === 'flying') {
        flight += dt;
        const p = clamp(flight / 1.85, 0, 1), q = ease(p);
        ball.position.lerpVectors(launch, end, q); ball.position.y += Math.sin(p * Math.PI) * 2.6;
        ball.rotation.y += dt * 1.1; ball.rotation.z += dt * .28;
        const target = ease((p - .36) / .53);
        velocity += (target - embrace) * 62 * dt; velocity *= Math.exp(-9 * dt); embrace += velocity * dt;
        if (p > .87) { const compress = Math.sin((p - .87) / .13 * Math.PI) * .1; ball.scale.set(1 + compress * .5, 1 - compress, 1 + compress * .5); }
        if (flight > 2.55) { phase = 'caught'; ball.position.copy(end); ball.scale.setScalar(1); live.current.onCatch(); }
      } else if (phase === 'caught') {
        velocity += (1 - embrace) * 40 * dt; velocity *= Math.exp(-8 * dt); embrace += velocity * dt;
        ball.position.y = end.y + Math.sin(clock * .8) * .014;
      }
      updateNet(); renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .02 }); observer.observe(el);
    const contextLost = (event: Event) => { event.preventDefault(); onFailure(); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    resize(); onReady(); frame = requestAnimationFrame(loop);
    return () => {
      disposed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); observer.disconnect(); onControls(null);
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', release); el.removeEventListener('pointercancel', cancel);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      const materials = new Set<THREE.Material>(), geometries = new Set<THREE.BufferGeometry>();
      scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Points) { geometries.add(object.geometry); for (const mat of Array.isArray(object.material) ? object.material : [object.material]) materials.add(mat); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); texture.dispose(); env.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [onControls, onReady, onFailure]);
  return <div ref={host} className="mo-net-canvas" data-testid="interactive-net" />;
}
