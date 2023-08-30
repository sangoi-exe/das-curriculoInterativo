<template>
    <footer>
        <template v-for="(link, index) in linksArray" :key="link.text">
            <a :href="link.href" target="_blank" rel="noopener noreferrer">
                <BruteForce :text="link.text" />
            </a>
            <span v-if="index !== linksArray.length - 1"> | </span>
        </template>
    </footer>
</template>
    
<script setup>
import { computed } from 'vue';
import BruteForce from './BruteForce.vue';

const links = {
    "LinkedIn": "https://www.linkedin.com/in/lucas-sangoi/",
    "GitHub": "https://github.com/DevArqSangoi",
    "Instagram": "https://www.instagram.com/dev.arq.sangoi/",
};

const linksArray = computed(() => Object.entries(links).map(([text, href]) => ({ text, href })));
</script>
  