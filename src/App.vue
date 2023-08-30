<template>
  <AppHeader />
  <BootScreen v-if="showBootScreen" @bootComplete="toggleScreen" />
  <TerminalScreen v-if="showTerminalScreen" @rebootSystem="toggleScreen" />
  <AppFooter />
</template>

<script setup>
import { ref, computed } from 'vue';
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
</script>