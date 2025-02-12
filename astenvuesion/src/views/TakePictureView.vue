<template>
  <div class="take-picture-container">
    <div v-if="isCameraActive">
      <video ref="videoRef" class="camera-video" playsinline :style="{ width: '100%', maxWidth: '600px', maxHeight: '70vh', borderRadius: '16px', objectFit: 'cover' }"></video>
    </div>
    <div v-else>
      <canvas v-if="capturedPhoto && detections.length > 0" ref="canvasRef" class="camera-canvas" :style="{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px', objectFit: 'cover' }"></canvas>
      <img v-else-if="capturedPhoto" :src="capturedPhoto" alt="Imagem capturada" :style="{ width: '100%', maxWidth: '600px', maxHeight: '70vh', borderRadius: '16px', objectFit: 'cover' }" />
    </div>

    <div style="margin-top: 16px;">
      <button v-if="isCameraActive" @click="capturePhoto" class="capture-button">
        Capturar Foto
      </button>
      <button v-else @click="retakePhoto" class="retake-button">
        Tirar Outra Foto
      </button>
    </div>

    <div v-if="loading" style="margin-top: 16px;">
      <div class="loading-spinner"></div>
      <p>Processando detecção...</p>
    </div>

    <p v-if="error" style="color: red; margin-top: 16px;">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from "vue";
import exifr from "exifr";

async function fixImageOrientationAndForcePortrait(originalBlob: Blob): Promise<Blob> {
  // Lê a orientação EXIF (1..8)
  const orientation = await exifr.orientation(originalBlob);

  // Carrega imagem original
  const arrayBuffer = await originalBlob.arrayBuffer();
  const base64Url = URL.createObjectURL(new Blob([arrayBuffer]));
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = base64Url;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return originalBlob;

  let w = img.naturalWidth;
  let h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  ctx.save();
  switch (orientation) {
    case 2:
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5:
      canvas.width = h;
      canvas.height = w;
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
      ctx.scale(1, -1);
      w = canvas.width;
      h = canvas.height;
      break;
    case 6:
      canvas.width = h;
      canvas.height = w;
      ctx.translate(h, 0);
      ctx.rotate(Math.PI / 2);
      w = canvas.width;
      h = canvas.height;
      break;
    case 7:
      canvas.width = h;
      canvas.height = w;
      ctx.translate(h, w);
      ctx.rotate(Math.PI / 2);
      ctx.scale(1, -1);
      w = canvas.width;
      h = canvas.height;
      break;
    case 8:
      canvas.width = h;
      canvas.height = w;
      ctx.translate(0, w);
      ctx.rotate(-Math.PI / 2);
      w = canvas.width;
      h = canvas.height;
      break;
    default:
      break;
  }
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  URL.revokeObjectURL(base64Url);

  // Força retrato
  if (canvas.width > canvas.height) {
    const rotatedCanvas = document.createElement("canvas");
    const rctx = rotatedCanvas.getContext("2d");
    if (!rctx) {
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || originalBlob), "image/jpeg", 0.8);
      });
    }
    rotatedCanvas.width = canvas.height;
    rotatedCanvas.height = canvas.width;

    rctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    rctx.rotate(-Math.PI / 2);
    rctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    return new Promise<Blob>((resolve) => {
      rotatedCanvas.toBlob(
        (b) => resolve(b || originalBlob),
        "image/jpeg",
        0.8
      );
    });
  }

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || originalBlob), "image/jpeg", 0.8);
  });
}

export default defineComponent({
  name: "TakePictureView",
  setup() {
    const isCameraActive = ref(true);
    const capturedPhoto = ref<string | null>(null);
    const detections = ref<any[]>([]);
    const loading = ref(false);
    const error = ref("");
    const videoRef = ref<HTMLVideoElement | null>(null);
    const streamRef = ref<MediaStream | null>(null);
    const canvasRef = ref<HTMLCanvasElement | null>(null);

    onMounted(() => {
      if (isCameraActive.value) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          })
          .then((stream) => {
            streamRef.value = stream;
            if (videoRef.value) {
              videoRef.value.srcObject = stream;
              videoRef.value.play();
              videoRef.value.addEventListener("loadedmetadata", () => {
                console.log(
                  `[TakePictureView] Video resolution: ${videoRef.value?.videoWidth}x${videoRef.value?.videoHeight}`
                );
              });
            }
          })
          .catch((err) => {
            console.error("[TakePictureView] Error accessing camera:", err);
            error.value = "Erro ao acessar a câmera.";
          });
      }
    });

    onUnmounted(() => {
      if (streamRef.value) {
        streamRef.value.getTracks().forEach((track) => track.stop());
        streamRef.value = null;
        console.log("[TakePictureView] Video stream stopped");
      }
    });

    const capturePhoto = () => {
      if (!videoRef.value) return;
      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = videoRef.value.videoWidth;
      captureCanvas.height = videoRef.value.videoHeight;

      const ctx = captureCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.value, 0, 0, captureCanvas.width, captureCanvas.height);

      captureCanvas.toBlob(async (blob) => {
        if (!blob) return;
        const orientedBlob = await fixImageOrientationAndForcePortrait(blob);
        const photoUrl = URL.createObjectURL(orientedBlob);
        capturedPhoto.value = photoUrl;

        if (streamRef.value) {
          streamRef.value.getTracks().forEach((track) => track.stop());
          streamRef.value = null;
          console.log("[TakePictureView] Video stream stopped");
        }
        isCameraActive.value = false;

        // Envia ao backend para detecção
        loading.value = true;
        const formData = new FormData();
        const file = new File([orientedBlob], "capture.jpg", {
          type: "image/jpeg",
        });
        formData.append("file", file);

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/predict?segmentation=false`,
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await response.json();
          detections.value = data.detections || [];
        } catch (err) {
          console.error("[TakePictureView] Detection error:", err);
          error.value = "Falha na detecção.";
        } finally {
          loading.value = false;
        }
      }, "image/jpeg", 0.8);
    };

    const retakePhoto = () => {
      capturedPhoto.value = null;
      detections.value = [];
      error.value = "";
      isCameraActive.value = true;

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
        .then((stream) => {
          streamRef.value = stream;
          if (videoRef.value) {
            videoRef.value.srcObject = stream;
            videoRef.value.play();
          }
        })
        .catch((err) => {
          console.error("[TakePictureView] Error accessing camera:", err);
          error.value = "Erro ao acessar a câmera.";
        });
    };

    const drawCanvas = () => {
      if (!capturedPhoto.value || detections.value.length === 0) return;
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const image = new Image();
      image.src = capturedPhoto.value;
      image.onload = () => {
        const margin = 50;
        const w = image.width;
        const h = image.height;
        canvas.width = w + margin * 2;
        canvas.height = h + margin * 2;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, margin, margin, w, h);

        detections.value.forEach((det: any) => {
          const [x1, y1, x2, y2] = det.bbox;
          ctx.strokeStyle = "#FF8C00";
          ctx.lineWidth = 2;
          ctx.strokeRect(x1 + margin, y1 + margin, x2 - x1, y2 - y1);
          ctx.font = "16px Arial";
          ctx.fillStyle = "#FF8C00";
          ctx.fillText(
            `Conf: ${det.score.toFixed(2)}`,
            x1 + margin,
            y1 + margin - 5
          );
        });
      };
    };

    watch(() => detections.value, () => {
      if (!isCameraActive.value) {
        drawCanvas();
      }
    });

    return {
      isCameraActive,
      capturedPhoto,
      detections,
      loading,
      error,
      videoRef,
      streamRef,
      canvasRef,
      capturePhoto,
      retakePhoto,
    };
  },
});
</script>

<style scoped>
.take-picture-container {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.camera-video {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  background-color: black;
}

.camera-canvas {
  display: block;
  margin: 0 auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.capture-button,
.retake-button {
  background-color: #ff8c00;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #fff;
  border-top: 4px solid #ff8c00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>