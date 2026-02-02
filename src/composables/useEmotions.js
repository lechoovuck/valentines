import { ref, computed } from 'vue'

export const EMOTIONS = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  VERY_HAPPY: 'very_happy',
  SAD: 'sad',
  VERY_SAD: 'very_sad',
  CRYING: 'crying',
  CELEBRATION: 'celebration',
  WAITING: 'waiting'
}

const NO_BUTTON_TEXTS = [
  'Нет',
  'Ты уверена?',
  'Точно?',
  'Пожалуйста :(',
  "Не надо",
  'Я тебя люблю'
]

export function useEmotions() {
  const emotion = ref(EMOTIONS.NEUTRAL)
  const noClickCount = ref(0)
  const yesClicked = ref(false)
  const noButtonScale = ref(1)
  const yesButtonScale = ref(1)

  const noButtonText = computed(() => {
    return NO_BUTTON_TEXTS[noClickCount.value % NO_BUTTON_TEXTS.length]
  })

  const setEmotion = (newEmotion) => {
    if (!yesClicked.value || newEmotion === EMOTIONS.CELEBRATION || newEmotion === EMOTIONS.WAITING) {
      emotion.value = newEmotion
    }
  }

  const handleNoClick = () => {
    noClickCount.value++
    noButtonScale.value = noButtonScale.value - 0.1
    yesButtonScale.value = yesButtonScale.value + 0.15
    setEmotion(EMOTIONS.CRYING)

    setTimeout(() => {
      if (!yesClicked.value) {
        setEmotion(EMOTIONS.SAD)
      }
    }, 1500)
  }

  const handleYesClick = () => {
    yesClicked.value = true
    setEmotion(EMOTIONS.CELEBRATION)
    localStorage.setItem('valentine_accepted', 'true')
  }

  const checkSavedState = () => {
    if (localStorage.getItem('valentine_accepted') === 'true') {
      yesClicked.value = true
      setEmotion(EMOTIONS.WAITING)
      return true
    }
    return false
  }

  const getEmotionIntensity = (mouseX, mouseY, yesBtn, noBtn) => {
    if (yesClicked.value) return { happiness: 1, sadness: 0 }

    if (!yesBtn || !noBtn) return { happiness: 0, sadness: 0 }

    const yesBtnRect = yesBtn.getBoundingClientRect()
    const noBtnRect = noBtn.getBoundingClientRect()

    const yesCenterX = yesBtnRect.left + yesBtnRect.width / 2
    const yesCenterY = yesBtnRect.top + yesBtnRect.height / 2
    const noCenterX = noBtnRect.left + noBtnRect.width / 2
    const noCenterY = noBtnRect.top + noBtnRect.height / 2

    const distToYes = Math.sqrt(
      Math.pow(mouseX - yesCenterX, 2) + Math.pow(mouseY - yesCenterY, 2)
    )
    const distToNo = Math.sqrt(
      Math.pow(mouseX - noCenterX, 2) + Math.pow(mouseY - noCenterY, 2)
    )

    const maxDist = 400
    const happiness = Math.max(0, 1 - distToYes / maxDist)
    const sadness = Math.max(0, 1 - distToNo / maxDist)

    const isHoveringYes = mouseX >= yesBtnRect.left && mouseX <= yesBtnRect.right &&
                          mouseY >= yesBtnRect.top && mouseY <= yesBtnRect.bottom
    const isHoveringNo = mouseX >= noBtnRect.left && mouseX <= noBtnRect.right &&
                         mouseY >= noBtnRect.top && mouseY <= noBtnRect.bottom

    if (isHoveringYes) {
      setEmotion(EMOTIONS.VERY_HAPPY)
    } else if (isHoveringNo) {
      // Cry when hovering No after it's been clicked at least once
      setEmotion(noClickCount.value > 0 ? EMOTIONS.CRYING : EMOTIONS.VERY_SAD)
    } else if (happiness > 0.5) {
      setEmotion(EMOTIONS.HAPPY)
    } else if (sadness > 0.5) {
      // Stay sadder after No has been clicked
      setEmotion(noClickCount.value > 0 ? EMOTIONS.VERY_SAD : EMOTIONS.SAD)
    } else {
      // Stay slightly sad after No has been clicked
      setEmotion(noClickCount.value > 0 ? EMOTIONS.SAD : EMOTIONS.NEUTRAL)
    }

    return { happiness, sadness, isHoveringYes, isHoveringNo }
  }

  return {
    emotion,
    noClickCount,
    yesClicked,
    noButtonScale,
    yesButtonScale,
    noButtonText,
    setEmotion,
    handleNoClick,
    handleYesClick,
    checkSavedState,
    getEmotionIntensity,
    EMOTIONS
  }
}
