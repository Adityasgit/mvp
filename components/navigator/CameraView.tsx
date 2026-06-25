"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onReady?: () => void;
}

export default function CameraView({ onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
          onReady?.();
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "NotAllowedError") {
          setError("Camera permission denied. Please allow camera access and reload.");
        } else {
          setError("Could not access camera. AR view will be unavailable.");
        }
      }
    }

    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onReady]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="text-center px-6">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-white text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      playsInline
      muted
      autoPlay
    />
  );
}
