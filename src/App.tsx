import "@mantine/core/styles.css";

import { Button, MantineProvider } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
// import { Capacitor } from "@capacitor/core";
// import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import * as faceapi from "face-api.js";

const data = {
  width: 1280,
  height: 720,
};

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        faceapi.loadSsdMobilenetv1Model("/face-api/models"),
        faceapi.loadTinyFaceDetectorModel("/face-api/models"),
        faceapi.loadFaceLandmarkModel("/face-api/models"),
        faceapi.loadFaceRecognitionModel("/face-api/models"),
        faceapi.loadFaceExpressionModel("/face-api/models"),
      ]).then(() => {
        setModelsLoaded(true);
      });
    };

    const startVideo = async () => {
      try {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: data.width,
              height: data.height,
            },
            audio: false,
          })
          .then((stream) => {
            videoRef.current!.srcObject = stream;
          });
      } catch (err) {
        console.error(err);
      }
    };

    loadModels();
    startVideo();
  }, []);

  const handleVideoOnPlay = () => {
    if (videoRef.current && canvasRef.current && modelsLoaded) {
      const canvas = canvasRef.current!;
      const displaySize = { width: data.width, height: data.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current!,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();
        const resized = faceapi.resizeResults(detections, displaySize);
        canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvasRef.current!, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current!, resized);
        faceapi.draw.drawFaceExpressions(canvasRef.current!, resized);
      }, 100);
    }
  };
  return (
    <MantineProvider>
      <main className="flex w-full">
        <div className="mx-auto">
          <div className="text-center font-bold">
            Face Recognition With React Typescript
          </div>
          <div className="text-center font-semibold -mt-1 text-slate-400 text-sm mb-3">
            By Adi Aulia Rahman
          </div>
          <div></div>
          <div className="grid row grid-cols-2 gap-2 mb-4">
            <Button>Start Video</Button>
            <Button color="red">Stop Video</Button>
          </div>

          {/* Detail Video */}
          <section
            className="section-video flex justify-center items-center"
            style={{
              width: data.width,
              height: data.height,
            }}
          >
            <video
              className="border-2 border-blue-500"
              style={{
                width: data.width,
                height: data.height,
              }}
              ref={videoRef}
              id="video"
              autoPlay={true}
              onPlay={handleVideoOnPlay}
            ></video>
            <canvas
              className="border-2 border-red-500 absolute"
              id="canvas"
              style={{
                position: "absolute",
                width: data.width,
                height: data.height,
              }}
              ref={canvasRef}
            ></canvas>
          </section>
        </div>
      </main>
    </MantineProvider>
  );
}
