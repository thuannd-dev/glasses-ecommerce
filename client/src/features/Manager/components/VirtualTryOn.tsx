import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import DownloadIcon from "@mui/icons-material/Download";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";

declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

interface VariantImage {
  id: string;
  variantName?: string;
  color?: string;
  imageUrl: string;
}

interface VirtualTryOnProps {
  open: boolean;
  onClose: () => void;
  variantImages: VariantImage[];
  productName?: string;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function VirtualTryOn({
  open,
  onClose,
  variantImages,
  productName,
}: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Smoothing state
  const smoothRef = useRef({
    x: 0,
    y: 0,
    angle: 0,
    width: 0,
    yaw: 0,
  });

  // Preload glasses images as blob URLs to avoid cross-origin canvas tainting
  const glassesImagesRef = useRef<HTMLImageElement[]>([]);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    async function loadImages() {
      const images: HTMLImageElement[] = [];
      for (const v of variantImages) {
        try {
          const resp = await fetch(v.imageUrl);
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          blobUrls.push(url);
          const img = new Image();
          img.src = url;
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
          images.push(img);
        } catch {
          // Fallback: load with crossOrigin attribute
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = v.imageUrl;
          images.push(img);
        }
      }
      if (!cancelled) {
        glassesImagesRef.current = images;
        blobUrlsRef.current = blobUrls;
      }
    }

    loadImages();

    return () => {
      cancelled = true;
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [variantImages]);

  const initFaceMesh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );

      if (!window.FaceMesh || !window.Camera) {
        setError("Failed to load face detection libraries.");
        setIsLoading(false);
        return;
      }

      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!results.multiFaceLandmarks?.length) return;

        const lm = results.multiFaceLandmarks[0];
        const leftEye = lm[33];
        const rightEye = lm[263];
        const nose = lm[1];
        const leftEar = lm[234];
        const rightEar = lm[454];

        const x1 = leftEye.x * canvas.width;
        const y1 = leftEye.y * canvas.height;
        const x2 = rightEye.x * canvas.width;
        const y2 = rightEye.y * canvas.height;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const eyeDistance = Math.sqrt(dx * dx + dy * dy);

        let width = eyeDistance * 2.2;
        const depthScale = 1 + nose.z * -0.6;
        width *= depthScale;

        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const yaw = leftEar.x - rightEar.x;

        const s = smoothRef.current;
        s.yaw = s.yaw * 0.8 + yaw * 0.2;
        s.x = s.x * 0.85 + centerX * 0.15;
        s.y = s.y * 0.85 + centerY * 0.15;
        s.angle = s.angle * 0.85 + angle * 0.15;
        s.width = s.width * 0.85 + width * 0.15;

        const brightness = 1 + nose.z * 0.5;
        ctx.filter = `brightness(${brightness})`;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        if (s.yaw > 0) {
          ctx.scale(0.95, 1);
        } else {
          ctx.scale(1.05, 1);
        }

        const glasses = glassesImagesRef.current[selectedIdx];
        if (glasses) {
          const anchorX = s.width * 0.5;
          const anchorY = s.width * 0.42 * 0.5;
          ctx.drawImage(glasses, -anchorX, -anchorY, s.width, s.width * 0.42);
        }

        ctx.restore();
        ctx.filter = "none";
      });

      faceMeshRef.current = faceMesh;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            try {
              if (faceMeshRef.current && videoRef.current) {
                await faceMeshRef.current.send({ image: videoRef.current });
              }
            } catch (_) {
              // Silently ignore send errors (e.g. during unmount or camera stop)
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
        cameraRef.current = camera;
      }

      setIsLoading(false);
    } catch (err) {
      console.error("VirtualTryOn init error:", err);
      setError("Failed to initialize camera or face detection.");
      setIsLoading(false);
    }
  }, [selectedIdx]);

  useEffect(() => {
    if (open) {
      initFaceMesh();
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
        faceMeshRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [open]);

  // Update the selected glasses index in the onResults callback
  // by keeping a ref in sync
  const selectedIdxRef = useRef(selectedIdx);
  useEffect(() => {
    selectedIdxRef.current = selectedIdx;
  }, [selectedIdx]);

  // Override the facemesh onResults to use current selectedIdx
  useEffect(() => {
    if (!faceMeshRef.current) return;

    faceMeshRef.current.onResults((results: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks?.length) return;

      const lm = results.multiFaceLandmarks[0];
      const leftEye = lm[33];
      const rightEye = lm[263];
      const nose = lm[1];
      const leftEar = lm[234];
      const rightEar = lm[454];

      const x1 = leftEye.x * canvas.width;
      const y1 = leftEye.y * canvas.height;
      const x2 = rightEye.x * canvas.width;
      const y2 = rightEye.y * canvas.height;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);
      const eyeDistance = Math.sqrt(dx * dx + dy * dy);

      let width = eyeDistance * 2.2;
      const depthScale = 1 + nose.z * -0.6;
      width *= depthScale;

      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const yaw = leftEar.x - rightEar.x;

      const s = smoothRef.current;
      s.yaw = s.yaw * 0.8 + yaw * 0.2;
      s.x = s.x * 0.85 + centerX * 0.15;
      s.y = s.y * 0.85 + centerY * 0.15;
      s.angle = s.angle * 0.85 + angle * 0.15;
      s.width = s.width * 0.85 + width * 0.15;

      const brightness = 1 + nose.z * 0.5;
      ctx.filter = `brightness(${brightness})`;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      if (s.yaw > 0) {
        ctx.scale(0.95, 1);
      } else {
        ctx.scale(1.05, 1);
      }

      const glasses = glassesImagesRef.current[selectedIdxRef.current];
      if (glasses) {
        const anchorX = s.width * 0.5;
        const anchorY = s.width * 0.42 * 0.5;
        ctx.drawImage(glasses, -anchorX, -anchorY, s.width, s.width * 0.42);
      }

      ctx.restore();
      ctx.filter = "none";
    });
  }, [selectedIdx]);

  const handleCapture = () => {
    const video = videoRef.current;
    const overlay = canvasRef.current;
    if (!video || !overlay) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = overlay.width;
    tempCanvas.height = overlay.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw mirrored video
    tempCtx.save();
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.restore();

    // Redraw glasses overlay directly (avoids tainted canvas from cross-origin images)
    const s = smoothRef.current;
    const glasses = glassesImagesRef.current[selectedIdxRef.current];
    if (glasses && glasses.complete && s.width > 0) {
      const brightness = 1;
      tempCtx.filter = `brightness(${brightness})`;
      tempCtx.save();
      tempCtx.translate(s.x, s.y);
      tempCtx.rotate(s.angle);
      if (s.yaw > 0) {
        tempCtx.scale(0.95, 1);
      } else {
        tempCtx.scale(1.05, 1);
      }
      const anchorX = s.width * 0.5;
      const anchorY = s.width * 0.42 * 0.5;
      tempCtx.drawImage(glasses, -anchorX, -anchorY, s.width, s.width * 0.42);
      tempCtx.restore();
      tempCtx.filter = "none";
    }

    try {
      const dataUrl = tempCanvas.toDataURL("image/png");
      setCapturedImage(dataUrl);
    } catch (e) {
      console.warn("Capture failed (tainted canvas):", e);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = `tryon-${productName?.replace(/\s+/g, "-") || "glasses"}-${Date.now()}.png`;
    link.click();
  };

  const toggleCamera = () => {
    if (isCamOn && cameraRef.current) {
      cameraRef.current.stop();
      setIsCamOn(false);
    } else {
      if (cameraRef.current) {
        cameraRef.current.start();
        setIsCamOn(true);
      }
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        bgcolor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FlipCameraAndroidIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{ color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em" }}
            >
              Virtual Try-On
            </Typography>
            {productName && (
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                {productName}
              </Typography>
            )}
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          sx={{
            bgcolor: "rgba(255,255,255,0.12)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "flex-start",
          maxWidth: 1100,
          width: "100%",
          px: 3,
        }}
      >
        {/* Camera viewer */}
        <Box sx={{ flex: 1, position: "relative" }}>
          {capturedImage ? (
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={capturedImage}
                sx={{ width: "100%", display: "block" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1.5,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    bgcolor: "#fff",
                    color: "#111",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    px: 3,
                  }}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setCapturedImage(null)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "#fff",
                    "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                    px: 3,
                  }}
                >
                  Retake
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                position: "relative",
                bgcolor: "#000",
              }}
            >
              <video
                ref={videoRef}
                width={640}
                height={480}
                autoPlay
                playsInline
                muted
                style={{
                  display: "block",
                  width: "100%",
                  transform: "scaleX(-1)",
                }}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />

              {isLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.6)",
                    gap: 2,
                  }}
                >
                  <CircularProgress sx={{ color: "#fff" }} />
                  <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                    Initializing camera & face detection…
                  </Typography>
                </Box>
              )}

              {error && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.7)",
                    gap: 1.5,
                    px: 3,
                  }}
                >
                  <Typography sx={{ color: "#ef4444", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
                    {error}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={initFaceMesh}
                    sx={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.4)",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Retry
                  </Button>
                </Box>
              )}

              {/* Bottom controls */}
              {!isLoading && !error && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Tooltip title={isCamOn ? "Pause camera" : "Resume camera"}>
                    <IconButton
                      onClick={toggleCamera}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                        color: "#fff",
                      }}
                    >
                      {isCamOn ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Capture photo">
                    <IconButton
                      onClick={handleCapture}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "#fff",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                        color: "#111",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      <CameraAltIcon sx={{ fontSize: 26 }} />
                    </IconButton>
                  </Tooltip>

                  <Box sx={{ width: 44 }} />
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Variant selector panel */}
        {variantImages.length > 0 && (
          <Box
            sx={{
              width: 220,
              flexShrink: 0,
              bgcolor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              borderRadius: 3,
              p: 2.5,
              maxHeight: 500,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
              },
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                mb: 2,
              }}
            >
              Select Glasses
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {variantImages.map((v, idx) => (
                <Box
                  key={v.id}
                  onClick={() => {
                    setSelectedIdx(idx);
                    setCapturedImage(null);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    border:
                      idx === selectedIdx
                        ? "2px solid #fff"
                        : "1px solid rgba(255,255,255,0.15)",
                    bgcolor:
                      idx === selectedIdx
                        ? "rgba(255,255,255,0.12)"
                        : "transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      borderColor: "rgba(255,255,255,0.4)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={v.imageUrl}
                    alt={v.variantName || "Glasses"}
                    sx={{
                      width: "100%",
                      height: 70,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />
                  {(v.variantName || v.color) && (
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                      }}
                    >
                      {v.color && (
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: v.color,
                            border: "1px solid rgba(255,255,255,0.3)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {v.variantName || v.color}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Hidden capture canvas */}
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />
    </Box>
  );
}
