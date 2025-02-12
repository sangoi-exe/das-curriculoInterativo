<template>
  <div class="prediction-container">
    <h2>Detection by Upload</h2>
    <div class="dropzone" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" :class="{ 'dropzone-active': isDragActive }" @click="openFileDialog">
      <p v-if="!isDragActive">Drag and drop an image here, or click to select one</p>
      <p v-else>Drop the image here...</p>
      <input type="file" accept="image/*" ref="fileInput" @change="handleFileChange" hidden />
    </div>

    <label for="segmentation-checkbox" class="segmentation-label">
      <input type="checkbox" id="segmentation-checkbox" v-model="segmentation" :disabled="loading" />
      Segmentation
    </label>

    <button :disabled="loading || !imageFile" @click="handlePredict" class="detect-button">
      {{ loading ? "Processing..." : "Detect" }}
    </button>

    <div class="canvas-container" v-if="previewUrl">
      <canvas ref="canvasRef" class="preview-canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "PredictionView",
  setup() {
    const fileInput = ref<HTMLInputElement | null>(null);
    const isDragActive = ref(false);
    const imageFile = ref<File | null>(null);
    const previewUrl = ref<string | null>(null);
    const segmentation = ref(false);
    const loading = ref(false);
    const detections = ref<any[]>([]);
    const canvasRef = ref<HTMLCanvasElement | null>(null);

    const onDragOver = () => {
      isDragActive.value = true;
    };
    const onDragLeave = () => {
      isDragActive.value = false;
    };
    const onDrop = (e: DragEvent) => {
      isDragActive.value = false;
      if (!e.dataTransfer) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        imageFile.value = files[0];
        detections.value = [];
        previewUrl.value = URL.createObjectURL(files[0]);
      }
    };

    const openFileDialog = () => {
      fileInput.value?.click();
    };

    const handleFileChange = () => {
      const files = fileInput.value?.files;
      if (files && files.length > 0) {
        imageFile.value = files[0];
        detections.value = [];
        previewUrl.value = URL.createObjectURL(files[0]);
      }
    };

    const handlePredict = async () => {
      if (!imageFile.value) return;
      loading.value = true;
      try {
        const formData = new FormData();
        formData.append("file", imageFile.value);

        const url = `${import.meta.env.VITE_API_URL}/predict?segmentation=${segmentation.value}`;
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        detections.value = data.detections || [];
      } catch (error) {
        console.error("[PredictionView] Prediction error:", error);
      } finally {
        loading.value = false;
      }
    };

    watch([previewUrl, detections, segmentation], () => {
      drawDetections();
    });

    const drawDetections = () => {
      if (!previewUrl.value) {
        clearCanvas();
        return;
      }
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const image = new Image();
      image.src = previewUrl.value;
      image.onload = () => {
        const margin = 50;
        canvas.width = image.width + margin * 2;
        canvas.height = image.height + margin * 2;

        // Fundo escuro + imagem
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, margin, margin, image.width, image.height);

        // Se não há detecções, para por aqui
        if (detections.value.length === 0) return;

        detections.value.forEach((det: any) => {
          if (segmentation.value && det.segmentation) {
            // A lógica do seu backend parece não implementar segmentation real,
            // mas manteremos a estrutura para um futuro caso seja implementado.
            const segPoints = det.segmentation;
            if (segPoints) {
              ctx.beginPath();
              ctx.moveTo(segPoints[0][0] + margin, segPoints[0][1] + margin);
              for (let j = 1; j < segPoints.length; j++) {
                ctx.lineTo(segPoints[j][0] + margin, segPoints[j][1] + margin);
              }
              ctx.closePath();
              ctx.strokeStyle = "#FF8C00";
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.font = "16px Arial";
              ctx.fillStyle = "#FF8C00";
              ctx.fillText(
                `Conf: ${det.score.toFixed(2)}`,
                segPoints[0][0] + margin,
                segPoints[0][1] + margin - 5
              );
            }
          } else {
            // bounding box normal
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
          }
        });
      };
    };

    const clearCanvas = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    return {
      fileInput,
      isDragActive,
      imageFile,
      previewUrl,
      segmentation,
      loading,
      detections,
      canvasRef,
      onDragOver,
      onDragLeave,
      onDrop,
      handleFileChange,
      handlePredict,
      openFileDialog,
    };
  },
});
</script>

<style scoped>
.prediction-container {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.dropzone {
  margin: 16px 0;
  padding: 32px;
  border: 2px dashed #ff8c00;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.dropzone:hover {
  border-color: #e65100;
}

.dropzone-active {
  background-color: rgba(255, 140, 0, 0.1);
}

.segmentation-label {
  display: inline-flex;
  align-items: center;
  margin-right: 16px;
}

.detect-button {
  background-color: #ff8c00;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detect-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.canvas-container {
  margin-top: 16px;
}

.preview-canvas {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
</style>