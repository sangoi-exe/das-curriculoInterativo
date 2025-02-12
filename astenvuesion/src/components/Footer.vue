<template>
  <footer class="glass-footer">
    © {{ currentYear }} Asten Vuesion. Todos os direitos reservados.
  </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Footer",
  setup() {
    const currentYear = new Date().getFullYear();
    return { currentYear };
  },
});
</script>

<style scoped>
.glass-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  text-align: center;
  color: #b0b0b0;
}
</style>