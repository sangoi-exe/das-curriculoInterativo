<template>
  <header class="gradient-app-bar">
    <div class="toolbar">
      <button class="menu-icon" @click="toggleDrawer">☰</button>
      <h1 class="title">Asten Vuesion</h1>
      <nav class="nav-links" v-if="!isMobile">
        <router-link v-for="item in navItems" :key="item.text" :to="item.path" class="nav-button">
          {{ item.text }}
        </router-link>
      </nav>
    </div>
    <transition name="drawer-transition">
      <div class="drawer" v-if="drawerOpen">
        <div class="drawer-content">
          <router-link v-for="item in navItems" :key="item.text" :to="item.path" class="drawer-link" @click="toggleDrawer">
            {{ item.text }}
          </router-link>
        </div>
      </div>
    </transition>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";

const navItems = [
  { text: "Detection by Upload", path: "/prediction" },
  { text: "Detection by Picture", path: "/takePicture" },
  { text: "Detection History", path: "/history" },
];

export default defineComponent({
  name: "Navbar",
  setup() {
    const drawerOpen = ref(false);
    const isMobile = ref(false);

    const toggleDrawer = () => {
      drawerOpen.value = !drawerOpen.value;
    };

    const checkIsMobile = () => {
      isMobile.value = window.innerWidth < 600;
    };

    onMounted(() => {
      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", checkIsMobile);
    });

    return {
      drawerOpen,
      isMobile,
      toggleDrawer,
      navItems,
    };
  },
});
</script>

<style scoped>
.gradient-app-bar {
  background: linear-gradient(45deg, #ff8c00, #e65100);
  padding: 0 16px;
  color: #fff;
}

.toolbar {
  display: flex;
  align-items: center;
  height: 56px;
}

.menu-icon {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: none;
}

.title {
  flex-grow: 1;
  margin: 0;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 16px;
}

.nav-button {
  color: #fff;
  text-decoration: none;
  font-size: 16px;
}

@media (max-width: 599px) {
  .menu-icon {
    display: block;
  }

  .nav-links {
    display: none;
  }
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: #222;
  padding-top: 56px;
  z-index: 999;
}

.drawer-content {
  display: flex;
  flex-direction: column;
}

.drawer-link {
  color: white;
  padding: 16px;
  text-decoration: none;
  border-bottom: 1px solid #333;
}

.drawer-transition-enter-active,
.drawer-transition-leave-active {
  transition: all 0.3s ease;
}

.drawer-transition-enter {
  transform: translateX(-100%);
}

.drawer-transition-leave-to {
  transform: translateX(-100%);
}
</style>