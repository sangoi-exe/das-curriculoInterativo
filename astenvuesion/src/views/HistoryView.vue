<template>
  <div class="history-container">
    <p v-if="error" style="color:red;">{{ error }}</p>
    <h2>Última Detecção</h2>
    <div v-if="latestImage">
      <img :src="latestImage" alt="Última detecção" style="width: 100%; max-width: 600px; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);" />
    </div>
    <div v-else>
      <p>Sem detecções recentes.</p>
    </div>

    <h3>Detection History</h3>
    <div v-if="historyList.length > 0" class="history-grid">
      <div class="history-item" v-for="(imgData, idx) in historyList" :key="idx">
        <img :src="'data:image/jpeg;base64,' + imgData" :alt="'Detecção ' + (idx + 1)" class="history-img" />
      </div>
    </div>
    <div v-else>
      <p>Nenhuma detecção no histórico.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";

export default defineComponent({
  name: "HistoryView",
  setup() {
    const latestImage = ref<string | null>(null);
    const historyList = ref<string[]>([]);
    const error = ref("");

    const fetchLatest = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/history/latest`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(
            `Falha ao buscar última detecção. Status: ${res.status}`
          );
        }
        const blob = await res.blob();
        if (blob.size === 0) {
          latestImage.value = null;
        } else {
          const url = URL.createObjectURL(blob);
          latestImage.value = url;
        }
      } catch (err) {
        console.error("Erro ao buscar última detecção:", err);
        error.value = "Não foi possível obter a última detecção.";
      }
    };

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/history/getHistory`
        );
        if (!res.ok) {
          throw new Error(`Falha ao buscar histórico. Status: ${res.status}`);
        }
        const data = await res.json();
        if (!data || !Array.isArray(data.history)) {
          historyList.value = [];
          return;
        }
        historyList.value = data.history;
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        error.value = "Não foi possível obter o histórico de detecções.";
        historyList.value = [];
      }
    };

    let intervalId: number | null = null;

    const refreshData = () => {
      fetchLatest();
      fetchHistory();
    };

    onMounted(() => {
      refreshData();
      intervalId = window.setInterval(refreshData, 3000);
    });

    onBeforeUnmount(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return {
      latestImage,
      historyList,
      error,
    };
  },
});
</script>

<style scoped>
.history-container {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.history-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.history-item {
  width: 120px;
  height: 80px;
  border-radius: 2px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: transform 0.3s;
}

.history-item:hover {
  transform: scale(1.05);
}

.history-img {
  width: 120px;
  height: 80px;
  object-fit: cover;
}
</style>