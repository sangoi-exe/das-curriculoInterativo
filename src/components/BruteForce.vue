<template>
    <span>{{ displayedText }}</span>
</template>
  
<script setup>
import { ref, watchEffect, onUnmounted } from 'vue';

const props = defineProps({
    text: {
        type: String,
        default: ''
    },
    chars: {
        type: String,
        default: 'abcdefghijklmnopqrstuvwxyz1234567890'
    }
});

const displayedText = ref('');

watchEffect(() => {
    let currentText = '';
    let counter = 0;
    const revealDelay = 5;

    const interval = setInterval(() => {
        counter++;

        if (counter % revealDelay === 0) {
            currentText += props.text[currentText.length];
        }

        displayedText.value = currentText + randomString(props.text.length - currentText.length);

        if (currentText.length === props.text.length) {
            clearInterval(interval);
        }
    }, 100);

    onUnmounted(() => clearInterval(interval));
});

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?/{}[]|:;,.~';
    for (let i = 0, len = characters.length; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * len));
    }
    return result;
}
</script>
