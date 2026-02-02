<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useMouse } from '@vueuse/core'
import { useBunny } from './composables/useBunny'
import { useEmotions, EMOTIONS } from './composables/useEmotions'

const canvasContainer = ref(null)
const yesButton = ref(null)
const noButton = ref(null)

const { x: mouseX, y: mouseY } = useMouse()
const bunny = useBunny()
const {
  emotion,
  yesClicked,
  noButtonScale,
  yesButtonScale,
  noButtonText,
  handleNoClick,
  handleYesClick,
  checkSavedState,
  getEmotionIntensity,
} = useEmotions()

const showConfetti = ref(false)
const confettiPieces = ref([])
const isWaitingState = ref(false)

const showButtons = computed(() => !yesClicked.value && !isWaitingState.value)

const yesButtonStyle = computed(() => ({
  '--btn-scale': yesButtonScale.value,
}))

const noButtonStyle = computed(() => ({
  '--btn-scale': noButtonScale.value,
}))

const createConfetti = () => {
  const colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF6B6B', '#98D8AA', '#FFD700']
  const pieces = []

  for (let i = 0; i < 100; i++) {
    pieces.push({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 360,
    })
  }

  confettiPieces.value = pieces
  showConfetti.value = true

  setTimeout(() => {
    showConfetti.value = false
    confettiPieces.value = []
  }, 5000)
}

const onYesClick = () => {
  handleYesClick()
  createConfetti()
}

// Update emotions based on mouse position
const updateEmotionFromPosition = () => {
  if (!canvasContainer.value || isWaitingState.value || yesClicked.value) return

  const x = mouseX.value
  const y = mouseY.value

  bunny.updateEyes(x, y, window.innerWidth, window.innerHeight)

  if (yesButton.value && noButton.value) {
    const intensity = getEmotionIntensity(x, y, yesButton.value, noButton.value)
    bunny.updateEmotion(emotion.value, intensity)
  }
}

let emotionInterval = null

watch(emotion, (newEmotion) => {
  bunny.updateEmotion(newEmotion)
})

onMounted(() => {
  if (canvasContainer.value) {
    bunny.init(canvasContainer.value)

    if (checkSavedState()) {
      isWaitingState.value = true
      bunny.updateEmotion(EMOTIONS.WAITING)
    } else {
      // Continuously check position for hover detection
      emotionInterval = setInterval(updateEmotionFromPosition, 50)
    }
  }
})

onUnmounted(() => {
  bunny.dispose()
  if (emotionInterval) {
    clearInterval(emotionInterval)
  }
})
</script>

<template>
  <div ref="canvasContainer" class="bunny-canvas"></div>

  <div class="content-layer">
    <h1 v-if="!yesClicked && !isWaitingState" class="question-text">
      Любимая моя Линочка, ты пойдешь со мной на День Святого Валентина? 💕
    </h1>

    <h1 v-if="yesClicked && !isWaitingState" class="celebration-text">
      Ураааа! 🎉
    </h1>

    <p v-if="isWaitingState" class="waiting-text">
      Увидимся 14 февраля! 💝
    </p>
  </div>

  <div v-if="showButtons" class="buttons-container">
    <button
      ref="yesButton"
      class="valentine-btn yes"
      :style="yesButtonStyle"
      @click="onYesClick"
    >
      Да
    </button>

    <button
      ref="noButton"
      class="valentine-btn no"
      :style="noButtonStyle"
      @click="handleNoClick"
    >
      {{ noButtonText }}
    </button>
  </div>

  <div v-if="showConfetti" class="confetti-container">
    <div
      v-for="piece in confettiPieces"
      :key="piece.id"
      class="confetti"
      :style="{
        left: `${piece.left}%`,
        backgroundColor: piece.color,
        width: `${piece.size}px`,
        height: `${piece.size}px`,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        transform: `rotate(${piece.rotation}deg)`,
        borderRadius: Math.random() > 0.5 ? '50%' : '0',
      }"
    />
  </div>
</template>
