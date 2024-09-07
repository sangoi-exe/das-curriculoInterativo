<template>
  <div class="boot-screen">
    <!-- Header section -->
    <div class="boot-screen-header">
      <div class="boot-text">
        <div>Award Modular BIOS v4.51PG, An Energy Star Ally</div>
        <div>Copyright (C) 1984-97, Award Software, Inc.</div>
        <div>(55XWVQ0E) Intel i430VX PCIset(TM)</div>
      </div>
      <img src="@/assets/imgs/epa.png" alt="Energy Star Logo" class="energy-star-logo" />
    </div>
    <!-- Main section -->
    <div class="boot-screen-main">
      <p>Intel(R) Pentium(R) PRO-MMX CPU at 120MHz</p>
      <p>Memory Test : {{ memory <= 16384 ? memory : 16384 }}K {{ testComplete ? 'OK' : '' }}</p>
      <table class="detection-table">
        <tbody>
          <tr v-for="(step, index) in filteredDetectionSteps" :key="index">
            <td>{{ step.message }}</td>
            <!-- Acessar usando .message -->
            <td style="text-align: left">{{ '.'.repeat(step.dots) }}</td>
            <!-- Acessar usando .dots -->
            <td style="text-align: left">{{ step.none ? 'None' : '' }}</td>
            <!-- Acessar usando .none -->
          </tr>
        </tbody>
      </table>
      <p v-if="stage === 4" class="wait">WAIT{{ waitDots }}</p>
    </div>
    <!-- Footer section -->
    <div class="boot-screen-footer">
      <div
        @keydown="handleDel"
        v-intersection-observer="focaNoDel"
        tabindex="0"
        ref="enterSetup"
        class="pressEnter"
      >
        Press <strong>&lt;DEL&gt;</strong> to enter SETUP
      </div>
      <div>12/10/97-i430VX,UMC8669-2A59GH2BC-00</div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { vIntersectionObserver } from '@vueuse/components'

const showDetection = ref(false)
const testComplete = ref(false)
const memory = ref(0)
const currentStep = ref(0)
const stage = ref(0)
const waitDots = ref('')
const bootComplete = ref(false)
const enterSetup = ref(null)

const detectionSteps = ref([
  { message: 'Detecting IDE Primary Master ', dots: 0, none: false },
  { message: 'Detecting IDE Primary Slave ', dots: 0, none: false },
  { message: 'Detecting IDE Secondary Master ', dots: 0, none: false },
  { message: 'Detecting IDE Secondary Slave ', dots: 0, none: false }
])

watch(bootComplete, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      emit('bootComplete')
    }, 500)
  }
})

watch(testComplete, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      detectAnimation()
    }, 500)
  }
})

onMounted(() => {
  memoryTest()
  sendVisitorInfo()
})

onMounted(async () => {
  await nextTick()
  if (enterSetup.value) {
    enterSetup.value.focus()
  }
})

async function sendVisitorInfo() {
  try {
    const userInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }   

    await axios.get('https://hook.us1.make.com/qnd2ksbs7tinl6r7muw72om99zk4s19y', {
      params: userInfo
    })
  } catch (error) {
    console.error('Falha ao enviar informações do usuário', error)
  }
}

function focaNoDel([{ isIntersecting }]) {
  if (isIntersecting) {
    enterSetup.value.focus()
  }
}

const handleDel = (event) => {
  if (event.keyCode === 110) {
    event.preventDefault()
    emit('bootComplete')
  }
}

const filteredDetectionSteps = computed(() => {
  if (showDetection.value) {
    return detectionSteps.value.filter((_, index) => index <= stage.value)
  } else {
    return []
  }
})

const emit = defineEmits(['bootComplete'])

const memoryTest = () => {
  let iterations = 0
  let waiting = false
  let waitCounter = 0

  const interval = setInterval(() => {
    if (waiting) {
      if (waitCounter < 50) {
        // 50 * 10ms = 500ms
        waitCounter++
      } else {
        memory.value = 0
        iterations++
        waiting = false
        waitCounter = 0
      }
    } else if (memory.value < 16384) {
      memory.value += 128
    } else if (iterations < 2) {
      waiting = true // Comece a esperar 500ms
    } else {
      // Agendar a conclusão do teste após 500ms
      setTimeout(() => {
        testComplete.value = true
      }, 500)
      clearInterval(interval) // Parar o intervalo
    }
  }, 10)
}

const detectAnimation = () => {
  // Adicionar um atraso após o "OK" da memória, e depois iniciar a detecção
  setTimeout(() => {
    showDetection.value = true // Controlar a renderização da detecção
    currentStep.value = 0
    stage.value = 0
    animateDots()
  }, 1500) // Intervalo de 1500ms após o "OK" da memória
}

const updateDetectionStep = (stepIndex, newValues) => {
  detectionSteps.value[stepIndex] = { ...detectionSteps.value[stepIndex], ...newValues }
}

const animateDots = () => {
  const interval = setInterval(() => {
    let step = detectionSteps.value[currentStep.value]
    if (step.dots < 3) {
      updateDetectionStep(currentStep.value, { dots: step.dots + 1 })
    } else if (!step.none) {
      updateDetectionStep(currentStep.value, { none: true })
    } else {
      clearInterval(interval) // Limpar o intervalo da etapa atual
      // Adicionar um intervalo após "None"
      setTimeout(() => {
        currentStep.value++
        if (currentStep.value < detectionSteps.value.length) {
          // Iniciar a animação da próxima linha
          stage.value = currentStep.value
          animateDots()
        } else {
          // Finaliza a animação
          stage.value = 4
          // Iniciar a animação WAIT
          const waitInterval = setInterval(() => {
            if (waitDots.value.length < 3) {
              waitDots.value += '.'
            } else {
              bootComplete.value = true
              clearInterval(waitInterval)
            }
          }, 500) // Wait dots interval
        }
      }, 1000) // "None" interval
    }
  }, 500) // Detection dots interval
}
</script>
