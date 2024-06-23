import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const CameraWithFaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          if (!videoRef || !canvasRef) return;

          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadedmetadata", () => {
            if (canvasRef.current) {
              canvasRef.current.width = videoRef.current?.videoWidth ?? 0;
              canvasRef.current.height = videoRef.current?.videoHeight ?? 0;
            }
          });
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    loadModels();
    startVideo();

    if (videoRef.current) {
      videoRef.current.addEventListener("play", () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
      });
    }
  }, []);

  return (
    <div>
      <h1>Camera with Face Detection</h1>
      <video ref={videoRef} autoPlay muted width="720" height="560" />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
};

export default CameraWithFaceDetection;
