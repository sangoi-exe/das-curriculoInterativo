<template>
  <div :class="{ 'rotate-screen': isMobileDevice && isPortrait }">
    <AppHeader />
    <BootScreen v-if="showBootScreen" @bootComplete="toggleScreen" />
    <TerminalScreen v-if="showTerminalScreen" @rebootSystem="toggleScreen" />
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

onMounted(() => {
  if (isMobileDevice) {
    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
  }
});

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener('orientationchange', checkOrientation);
  }
});
</script>