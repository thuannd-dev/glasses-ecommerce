import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { Box, CircularProgress, Typography } from "@mui/material";

const HDR_URL = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr";

export type InlineGlbViewerProps = {
  modelUrl: string;
  /** WebGL clear color (matches landing tile) */
  clearColor?: string;
  /** Brighter lights + softer shadow for light backgrounds */
  variant?: "dark" | "light";
  /** Optional loading overlay background (e.g. hero gradient mid-tone) */
  loadingBackdropColor?: string;
  /** Optional error panel background */
  errorBackdropColor?: string;
  /** Turntable when idle (stops while user drags) */
  autoRotate?: boolean;
  /** OrbitControls default ~2; higher = faster */
  autoRotateSpeed?: number;
};

/**
 * Embedded Three.js GLB viewer for editorial grids (resize-safe, OrbitControls).
 */
export default function InlineGlbViewer({
  modelUrl,
  clearColor = "#0D0D0E",
  variant = "dark",
  loadingBackdropColor,
  errorBackdropColor,
  autoRotate = true,
  autoRotateSpeed = 1.6,
}: InlineGlbViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let frameId = 0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    try {
      renderer.setClearColor(new THREE.Color(clearColor), 1);
    } catch {
      renderer.setClearColor(variant === "light" ? 0xf6f4f2 : 0x0d0d0e, 1);
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = variant === "light" ? 1.05 : 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.position.set(0, 0, 2.8);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.panSpeed = 0.55;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.9;
    controls.minPolarAngle = 0.15 * Math.PI;
    controls.maxPolarAngle = 0.85 * Math.PI;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = autoRotateSpeed;

    const isLight = variant === "light";
    const lightRig = new THREE.Group();
    const ambient = new THREE.AmbientLight(0xffffff, isLight ? 0.38 : 0.15);
    lightRig.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, isLight ? 1.85 : 2.2);
    key.position.set(2.6, 4.4, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.03;
    lightRig.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, isLight ? 1.0 : 1.05);
    fill.position.set(-4.6, 2.2, 1.6);
    lightRig.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, isLight ? 0.48 : 0.55);
    rim.position.set(-1.0, 3.4, -4.8);
    lightRig.add(rim);
    scene.add(lightRig);

    const setSize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();

    const ro = new ResizeObserver(() => {
      if (disposed) return;
      setSize();
    });
    ro.observe(container);

    const frameModel = (root: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z);
      const radius = Math.max(maxDim * 0.5, 0.01);

      const planeGeo = new THREE.PlaneGeometry(10, 10);
      const shadowMat = new THREE.ShadowMaterial({ opacity: isLight ? 0.09 : 0.22 });
      const shadowPlane = new THREE.Mesh(planeGeo, shadowMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.set(center.x, box.min.y - 0.002, center.z);
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      controls.target.copy(center);
      controls.update();

      const fov = THREE.MathUtils.degToRad(camera.fov);
      const fitHeightDistance = radius / Math.tan(fov * 0.5);
      const fitWidthDistance = fitHeightDistance / camera.aspect;
      const distance = 1.25 * Math.max(fitHeightDistance, fitWidthDistance);
      const dir = new THREE.Vector3(0.9, 0.35, 1.0).normalize();
      camera.position.copy(center).addScaledVector(dir, distance);
      camera.near = Math.max(0.01, distance / 200);
      camera.far = Math.max(50, distance * 20);
      camera.updateProjectionMatrix();
      controls.minDistance = distance * 0.55;
      controls.maxDistance = distance * 2.4;
    };

    const animate = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    (async () => {
      try {
        setError(null);
        setLoading(true);
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const rgbe = new RGBELoader();
        rgbe.setDataType(THREE.HalfFloatType);
        const hdr = await rgbe.loadAsync(HDR_URL);
        const envMap = pmrem.fromEquirectangular(hdr).texture;
        scene.environment = envMap;
        hdr.dispose();
        pmrem.dispose();

        if (disposed) return;

        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(modelUrl);
        const root = gltf.scene || gltf.scenes?.[0];
        if (!root) throw new Error("Model loaded but no scene found in the GLB.");

        root.traverse((obj: THREE.Object3D) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat && "envMapIntensity" in mat) {
              (mat as THREE.MeshStandardMaterial & { envMapIntensity?: number }).envMapIntensity = 1.1;
            }
            if (mat && "metalness" in mat && "roughness" in mat) {
              mat.metalness = Math.min(1, mat.metalness);
              mat.roughness = Math.min(1, Math.max(0.04, mat.roughness));
            }
          }
        });

        if (disposed) return;
        scene.add(root);
        frameModel(root);
        setLoading(false);
        animate();
      } catch (err) {
        if (!disposed) {
          setLoading(false);
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, [modelUrl, clearColor, variant, autoRotate, autoRotateSpeed]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          outline: "none",
        }}
      />
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              loadingBackdropColor ??
              (variant === "light" ? "rgba(246,244,242,0.82)" : "rgba(13,13,14,0.72)"),
            zIndex: 1,
          }}
        >
          <CircularProgress
            size={36}
            sx={{
              color: variant === "light" ? "rgba(17,24,39,0.55)" : "rgba(255,255,255,0.85)",
            }}
          />
        </Box>
      )}
      {error && !loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            bgcolor:
              errorBackdropColor ??
              (variant === "light" ? "rgba(255,255,255,0.92)" : "rgba(13,13,14,0.9)"),
            zIndex: 1,
          }}
        >
          <Typography
            sx={{
              color: variant === "light" ? "rgba(17,24,39,0.72)" : "rgba(255,255,255,0.7)",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
