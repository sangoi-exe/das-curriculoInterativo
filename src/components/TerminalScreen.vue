<template>
  <main class="terminal-screen">
    <div class="msdos-container">
      <!-- Header -->
      <div class="cmd-header">
        <p>Microsoft MS-DOS version 2.11</p>
        <p>Copyright 1981,82,83 Microsoft Corp.</p>
        <p>{{ translations[language].helptip }}</p>
      </div>
      
      <!-- Main Content -->
      <div class="msdos-prompt">
        <div
          class="vefor"
          v-for="(item, index) in commandHistoryComputed"
          :key="index"
          :ref="item.ref"
        >
          <p class="commandline">
            <span class="cdoispontosOld" v-if="item.command">C:\sangoi-exe&gt;</span>
            <span class="command">{{ item.command }}</span>
          </p>
          <span
            v-if="item.response"
            v-html="item.response"
            v-intersection-observer="linkAnimation"
          ></span>
        </div>
        <div v-if="!waitingForEnter" class="inpute">
          <p class="cdoispontosNew" ref="inputScroll">
            C:\sangoi-exe&gt;
            <input
              v-model="inputValue"
              @keydown.enter="handleCommand(inputValue)"
              ref="inputFocus"
              v-intersection-observer="focaNoInput"
            />
          </p>
        </div>
        <div
          v-if="waitingForEnter"
          class="pressEnter"
          @keydown.enter="handleEnter"
          tabindex="0"
          ref="focusPressEnter"
          v-intersection-observer="focaNoPressEnter"
        >
          <strong>{{ translations[language].pressEnter }}</strong>
        </div>
        <div v-if="rebootCmd">{{ rebootCmd }}</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue'
import { vIntersectionObserver } from '@vueuse/components'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrPush(['target', '_blank'])
  return defaultRender(tokens, idx, options, env, self)
}
/*
const isPortrait = ref(false)
const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
)

const checkOrientation = () => {
  if (isMobileDevice) {
    isPortrait.value = window.orientation === 0 || window.orientation === 180
  }
}

onMounted(() => {
  if (isMobileDevice) {
    checkOrientation()
    window.addEventListener('orientationchange', checkOrientation)
  }
})

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener('orientationchange', checkOrientation)
  }
})*/

const emit = defineEmits(['rebootSystem'])

const rebootCmd = ref('')
const focusPressEnter = ref(null)
const inputScroll = ref(null)
const inputFocus = ref(null)
const language = ref('en-us')
const inputValue = ref('')
const waitingForEnter = ref(false)
const currentSection = ref(0)
const sections = ref([])

const docsWithPagination = ['historicodiretor', 'historicotld', 'projetos']
const sectionsToRender = 3

const commandHistoryComputed = computed(() => state.commandHistory)

const state = reactive({
  commandHistory: []
})

const characters = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-=_+[]{}|;':,.<>?"

function randomCharacter() {
  return characters.charAt(Math.floor(Math.random() * characters.length))
}

function matrixEffect(el, originalText) {
  let newText = ''
  for (let i = 0; i < originalText.length; i++) {
    if (Math.random() > 0.9) {
      newText += randomCharacter()
    } else {
      newText += originalText[i]
    }
  }
  el.innerText = newText
}

const translations = {
  'en-us': {
    helptip: "Type 'help' for a list of available commands.",
    unknown_command: "Unknown command. Type 'help' for a list of available commands.",
    language_switched: 'Language switched to English.',
    pressEnter: 'Press Enter to continue...'
  },
  'pt-br': {
    helptip: "Digite 'help' para ver a lista de comandos disponíveis.",
    unknown_command:
      "Comando não reconhecido. Digite 'help' para ver a lista de comandos disponíveis.",
    language_switched: 'Idioma alterado para Português.',
    pressEnter: 'Pressione Enter para continuar...'
  }
}

const sectionToFileMapping = {
  'Resumo Profissional': `resumo`,
  'Formação Acadêmica ': 'formacao',
  'Atividades Extracurriculares': 'atividades',
  'Habilidades Técnicas': 'habilidades',
  'Experiência em Arquitetura': 'experiencia',
  'Proficiência em Idiomas': `idiomas`,
  'Competências Interpessoais': 'competencias',
  'Projetos Desenvolvidos': 'projetos',
  'Histórico com os Computadores – TL;DR;': 'historicotld',
  'Histórico com os Computadores – Versão do Diretor': 'historicodiretor'
}

function focaNoInput([{ isIntersecting }]) {
  if (isIntersecting) {
    inputFocus.value.focus()
  }
}

function focaNoPressEnter([{ isIntersecting }]) {
  if (isIntersecting) {
    focusPressEnter.value.focus()
  }
}

function linkAnimation([{ isIntersecting }]) {
  if (isIntersecting) {
    const links = document.querySelectorAll('.vefor a')
    links.forEach((link) => {
      link.classList.remove('abluble')
      void link.offsetWidth
      link.classList.add('abluble')
      applyMatrixEffectToLinks()
    })
  }
}

const applyMatrixEffectToLinks = () => {
  const links = document.querySelectorAll('.abluble')
  links.forEach((link) => {
    const originalText = link.innerText
    let intervalId = setInterval(() => matrixEffect(link, originalText), 1000)

    // Quando o mouse entra no link, cancela o efeito e retorna ao texto original
    link.addEventListener('mouseenter', () => {
      clearInterval(intervalId)
      link.innerText = originalText
    })

    // Quando o mouse sai, reinicia o efeito
    link.addEventListener('mouseleave', () => {
      intervalId = setInterval(() => matrixEffect(link, originalText), 1000)
    })
  })
}

const handleCommand = (command) => {
  command = command.toLowerCase()
  if (command === 'cls') {
    handleClear()
  } else if (command === 'help') {
    handleHelp()
  } else if (command === 'list') {
    handleList()
  } else if (command === 'en-us') {
    handleLanguage(command)
  } else if (command === 'pt-br') {
    handleLanguage(command)
  } else if (command === 'reboot') {
    handleReboot()
  } else if (command === 'exit') {
    handleExit()
  } else if (!isNaN(command) && command >= 0 && command <= 9) {
    const optionTitles = Object.keys(sectionToFileMapping)
    const option = optionTitles[parseInt(command)]
    if (option) {
      state.commandHistory.push({ command: command, response: '' })
      handleMenuSelection(option)
    }
  } else {
    state.commandHistory.push({
      command: command,
      response: translations[language.value].unknown_command
    })
  }
  inputValue.value = ''
}

const handleMenuSelection = async (option) => {
  const filename = sectionToFileMapping[option]
  try {
    const response = await fetch(`/markdown/${filename}_${language.value}.md`)
    if (!response.ok || !response.headers.get('content-type')?.includes('text/markdown')) {
      throw new Error('Não foi possível carregar o arquivo ou o arquivo não é um Markdown válido.')
    }
    const content = await response.text()

    if (docsWithPagination.includes(filename)) {
      waitingForEnter.value = true
      sections.value = splitContent(content, sectionsToRender)
      renderSection(0)
    } else {
      // Se o arquivo não estiver na lista para paginação, renderize o conteúdo normalmente
      const renderedContent = md.render(content)

      // Adicione a seção renderizada ao histórico
      const lastCommandIndex = state.commandHistory.length - 1
      if (lastCommandIndex >= 0) {
        const lastCommand = state.commandHistory[lastCommandIndex]
        state.commandHistory[lastCommandIndex] = {
          ...lastCommand,
          response: renderedContent
        }
      }
    }
    inputValue.value = ''
  } catch (error) {
    console.error('Erro ao carregar arquivo:', error)
    state.commandHistory.push({
      command: option,
      response: 'Erro ao carregar o conteúdo. Tente novamente mais tarde.'
    })
  }
}

const renderSection = (sectionIndex) => {
  const lastCommandIndex = state.commandHistory.length - 1
  if (sectionIndex < sections.value.length) {
    const sectionContent = sections.value[sectionIndex]
    const renderedContent = md.render(sectionContent)

    if (sectionIndex === 0) {
      const lastCommand = state.commandHistory[lastCommandIndex]
      state.commandHistory[lastCommandIndex] = {
        ...lastCommand,
        response: renderedContent
      }
    } else {
      // Adicionar seções subsequentes ao histórico
      state.commandHistory.push({ command: '', response: renderedContent })
    }

    // Aguarde a entrada do usuário se houver mais seções
    if (sectionIndex < sections.value.length - 1) {
      waitingForEnter.value = true
      currentSection.value = sectionIndex
    }
  }
}

const splitContent = (content) => {
  const sections = content.split('¶')
  return sections
}

const handleReboot = () => {
  let dots = 0
  const maxDots = 3

  // Mostrar a mensagem "Rebooting" sem pontos inicialmente
  rebootCmd.value = 'Rebooting'

  const interval = setInterval(() => {
    if (dots < maxDots) {
      rebootCmd.value += '.' // Adicionar um ponto
      dots++
    } else {
      clearInterval(interval) // Parar a animação após imprimir o terceiro ponto
      setTimeout(() => {
        rebootCmd.value = ''
        emit('rebootSystem') // Reiniciar após 500ms
      }, 300)
    }
  }, 500) // Intervalo para adicionar pontos, incluindo a primeira espera de 500ms
}

const handleExit = () => {
  window.location.href = 'about:blank'
}

async function handleHelp() {
  try {
    const response = await fetch(`/markdown/help_${language.value}.md`)
    if (!response.ok || !response.headers.get('content-type')?.includes('text/markdown')) {
      throw new Error('Não foi possível carregar o arquivo ou o arquivo não é um Markdown válido.')
    }
    const content = await response.text()
    const renderedContent = md.render(content)
    state.commandHistory.push({ command: 'help', response: renderedContent })
  } catch (error) {
    console.error('Erro ao carregar arquivo:', error)
    state.commandHistory.push({
      command: 'help',
      response: 'Erro ao carregar o conteúdo de ajuda. Tente novamente mais tarde.'
    })
  }
}

async function handleList() {
  try {
    const response = await fetch(`/markdown/list_${language.value}.md`)
    if (!response.ok || !response.headers.get('content-type')?.includes('text/markdown')) {
      throw new Error('Não foi possível carregar o arquivo ou o arquivo não é um Markdown válido.')
    }
    const content = await response.text()
    const renderedContent = md.render(content)
    state.commandHistory.push({ command: 'list', response: renderedContent })
  } catch (error) {
    console.error('Erro ao carregar arquivo:', error)
    state.commandHistory.push({
      command: 'list',
      response: 'Erro ao carregar o conteúdo de ajuda. Tente novamente mais tarde.'
    })
  }
}

function handleLanguage(langCommand) {
  const langCode = langCommand
  language.value = langCode
  state.commandHistory.push({
    command: langCommand,
    response: translations[langCode].language_switched
  })
  return translations[langCode]['language_switched']
}

const handleEnter = () => {
  if (waitingForEnter.value) {
    waitingForEnter.value = false
    renderSection(currentSection.value + 1)
  }
}

function handleClear() {
  state.commandHistory = []
}

onMounted(async () => {
  await nextTick()
  if (inputFocus.value) {
    inputFocus.value.focus()
  }
})

watch(state, async () => {
  await nextTick()
  if (!waitingForEnter.value) {
    inputScroll.value.scrollIntoView({ behavior: 'smooth' })
  } else {
    focusPressEnter.value.scrollIntoView({ behavior: 'smooth' })
  }
})
</script>
