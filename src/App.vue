<template>
  <div class="main-container" :style="{ height: appHeight + 'px' }">
    <AppHeader />
    <main class="content">
      <BootScreen v-if="showBootScreen" @bootComplete="toggleScreen" />
      <TerminalScreen v-if="showTerminalScreen" @rebootSystem="toggleScreen" />
    </main>
    <AppFooter />
  </div>
</template>



<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import TerminalScreen from './components/TerminalScreen.vue';
import BootScreen from './components/BootScreen.vue';
import AppFooter from './components/AppFooter.vue';

const screenState = ref(true);

const showBootScreen = computed(() => screenState.value);
const showTerminalScreen = computed(() => !screenState.value);

const toggleScreen = () => {
  screenState.value = !screenState.value;
};

const isPortrait = ref(false);
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const checkOrientation = () => {
  if (isMobileDevice) {
    isPortrait.value = window.orientation === 0 || window.orientation === 180;
  }
};

// Ref para armazenar a altura do App
const appHeight = ref(window.innerHeight);

// Função para atualizar a altura
const updateAppHeight = () => {
  appHeight.value = window.innerHeight;
};

onMounted(() => {
  if (isMobileDevice) {
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
  }
  window.addEventListener('resize', updateAppHeight);
});

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener('orientationchange', checkOrientation);
  }
  window.removeEventListener('resize', updateAppHeight);
});
</script>
