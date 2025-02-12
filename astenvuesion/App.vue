<template>
  <div id="app">
    <Navbar />
    <div class="main-container">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "./src/components/Navbar.vue";
import Footer from "./src/components/Footer.vue";

export default defineComponent({
  name: "App",
  components: {
    Navbar,
    Footer,
  },
});
</script>

<style>
.main-container {
  flex: 1;
  padding: 16px;
}
</style>