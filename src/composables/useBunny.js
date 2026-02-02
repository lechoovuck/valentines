import * as THREE from 'three'
import { EMOTIONS } from './useEmotions'

export function useBunny() {
  let scene, camera, renderer, bunnyGroup
  let leftEyeGroup, rightEyeGroup
  let leftEar, rightEar
  let smile, frown, happyMouth, openMouth
  let leftTear, rightTear, tearStreakLeft, tearStreakRight
  let leftArm, rightArm
  let bouquetGroup, peaceFingers
  let leftBlush, rightBlush
  let animationId
  let shakeOffset = { x: 0, y: 0 }
  let targetShakeOffset = { x: 0, y: 0 }
  let nodAngle = 0
  let isNodding = false
  let closedEyeLines = []
  let sadEyebrows = []
  let targetRotation = { x: 0, y: 0 }

  // Ear animation targets for smooth transitions
  let targetEarState = {
    leftY: 1.85,
    rightY: 1.85,
    leftRotZ: 0.15,
    rightRotZ: -0.15
  }
  let currentEmotion = null

  // Pure white kawaii colors
  const colors = {
    body: 0xFFFCFC,
    earInner: 0xFFCDD5,
    blush: 0xFFB6C1,
    pupil: 0x2C2C2C,
    peonyPink: 0xFFB6C1,
    peonyDark: 0xFF69B4,
    peonyLight: 0xFFF0F5,
    leaf: 0x7DC89C,
    tear: 0x7EC8E8
  }

  const init = (container) => {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 10

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Very bright ambient for nearly white appearance
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(ambientLight)

    // Very subtle directional light for minimal edge definition
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.08)
    directionalLight.position.set(2, 1, 5)
    scene.add(directionalLight)

    createBunny()

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    animate()

    return { scene, camera, renderer }
  }

  // White material with very subtle shading
  const createWhiteMaterial = () => {
    return new THREE.MeshStandardMaterial({
      color: colors.body,
      roughness: 0.7,
      metalness: 0,
      emissive: 0xffffff,
      emissiveIntensity: 0.3
    })
  }

  const createColorMaterial = (color) => {
    return new THREE.MeshBasicMaterial({ 
      color: color,
    roughness: 0.9,
    metalness: 0,
    emissive: color,
    emissiveIntensity: 0.15     // helps a lot on inner ears / blush / flowers
     })
  }

  const createBunny = () => {
    bunnyGroup = new THREE.Group()

    const whiteMat = createWhiteMaterial()

    // Head - large round for kawaii
    const headGeom = new THREE.SphereGeometry(1.4, 64, 64)
    const head = new THREE.Mesh(headGeom, whiteMat)
    head.position.y = 0.1
    bunnyGroup.add(head)

    // Body - smaller, rounder
    const bodyGeom = new THREE.SphereGeometry(1.1, 64, 64)
    bodyGeom.scale(1, 0.8, 0.65)
    const body = new THREE.Mesh(bodyGeom, whiteMat)
    body.position.y = -1.2
    bunnyGroup.add(body)

    // Ears - tall, flat, kawaii sticker style
    leftEar = createEar()
    leftEar.position.set(-0.35, 1.85, -0.05)
    leftEar.rotation.z = 0.15 // slight outward tilt
    bunnyGroup.add(leftEar)

    rightEar = createEar()
    rightEar.position.set(0.35, 1.85, -0.05)
    rightEar.rotation.z = -0.15
    bunnyGroup.add(rightEar)

    // Eyes with shine INSIDE
    createEyes()

    // Blush
    createBlush()

    // Mouths
    createMouths()

    // Arms
    createArms()

    // Tears
    createTears()

    // Bouquet
    createBouquet()

    // Peace sign
    createPeaceSign()

    bunnyGroup.position.y = 0.3
    scene.add(bunnyGroup)

    // Warm directional light for better shading
    const dirLight = new THREE.DirectionalLight(0xfff8f5, 1.4)
    dirLight.position.set(4, 5, 6)
    scene.add(dirLight)

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0xffffff, 0.35)
    fill.position.set(-3, 2, 4)
    scene.add(fill)
  }

  const createEar = () => {
    const earGroup = new THREE.Group()
    const whiteMat = createWhiteMaterial()

    // Simple flat elongated ear shape (kawaii sticker style)
    // Using capsule geometry, flattened in Z for 2D look
    const outerGeom = new THREE.CapsuleGeometry(0.22, 1.0, 8, 16)
    outerGeom.scale(1, 1, 0.35) // flatten for sticker-like appearance
    const outer = new THREE.Mesh(outerGeom, whiteMat)
    earGroup.add(outer)

    // Inner pink - smaller, offset forward
    const innerMat = createColorMaterial(colors.earInner)
    const innerGeom = new THREE.CapsuleGeometry(0.12, 0.75, 8, 16)
    innerGeom.scale(1, 1, 0.35)
    const inner = new THREE.Mesh(innerGeom, innerMat)
    inner.position.z = 0.08 // push forward so pink is visible
    earGroup.add(inner)

    return earGroup
  }



  const createEyes = () => {
    // Left eye group (pupil + shine together)
    leftEyeGroup = new THREE.Group()

    // Pupil - dark oval
    const pupilMat = createColorMaterial(colors.pupil)
    const pupilGeom = new THREE.SphereGeometry(0.13, 16, 16)
    pupilGeom.scale(1, 1.15, 0.4)
    const leftPupil = new THREE.Mesh(pupilGeom, pupilMat)
    leftEyeGroup.add(leftPupil)

    // White shine dot inside pupil
    const shineMat = createColorMaterial(0xFFFFFF)
    const shineGeom = new THREE.SphereGeometry(0.04, 8, 8)
    const leftShine = new THREE.Mesh(shineGeom, shineMat)
    leftShine.position.set(0.035, 0.04, 0.06)
    leftEyeGroup.add(leftShine)

    leftEyeGroup.position.set(-0.4, 0.2, 1.3)
    bunnyGroup.add(leftEyeGroup)

    // Right eye group
    rightEyeGroup = new THREE.Group()

    const rightPupil = new THREE.Mesh(pupilGeom.clone(), pupilMat)
    rightEyeGroup.add(rightPupil)

    const rightShine = new THREE.Mesh(shineGeom.clone(), shineMat)
    rightShine.position.set(0.035, 0.04, 0.06)
    rightEyeGroup.add(rightShine)

    rightEyeGroup.position.set(0.4, 0.2, 1.3)
    bunnyGroup.add(rightEyeGroup)
  }

const createBlush = () => {
  const blushMat = new THREE.MeshBasicMaterial({
    color: colors.blush,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  })

  // Start with a circle
  const blushGeom = new THREE.CircleGeometry(0.12, 32)

  // LEFT BLUSH
  leftBlush = new THREE.Mesh(blushGeom, blushMat)
  leftBlush.scale.set(1.6, 0.7, 1) // OVAL SHAPE 💕
  leftBlush.position.set(-0.6, 0, 1.27)
  leftBlush.rotation.y = -0.35
  bunnyGroup.add(leftBlush)

  // RIGHT BLUSH
  rightBlush = new THREE.Mesh(blushGeom, blushMat)
  rightBlush.scale.set(1.6, 0.7, 1)
  rightBlush.position.set(0.6, 0, 1.27)
  rightBlush.rotation.y = 0.35
  bunnyGroup.add(rightBlush)
}

  const createMouths = () => {
    const mouthMat = createColorMaterial(colors.pupil)

    // Neutral smile - simple curve
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.12, -0.2, 1.35),
      new THREE.Vector3(0, -0.28, 1.38),
      new THREE.Vector3(0.12, -0.2, 1.35)
    )
    const smileGeom = new THREE.TubeGeometry(smileCurve, 20, 0.022, 8, false)
    smile = new THREE.Mesh(smileGeom, mouthMat)
    bunnyGroup.add(smile)

    // Frown
    const frownCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.1, -0.3, 1.35),
      new THREE.Vector3(0, -0.22, 1.38),
      new THREE.Vector3(0.1, -0.3, 1.35)
    )
    const frownGeom = new THREE.TubeGeometry(frownCurve, 20, 0.022, 8, false)
    frown = new THREE.Mesh(frownGeom, mouthMat)
    frown.visible = false
    bunnyGroup.add(frown)

    // Big happy mouth
    const happyCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.18, -0.15, 1.3),
      new THREE.Vector3(0, -0.38, 1.35),
      new THREE.Vector3(0.18, -0.15, 1.3)
    )
    const happyGeom = new THREE.TubeGeometry(happyCurve, 20, 0.028, 8, false)
    happyMouth = new THREE.Mesh(happyGeom, mouthMat)
    happyMouth.visible = false
    bunnyGroup.add(happyMouth)

    // Open mouth pink fill
    const openMouthGeom = new THREE.SphereGeometry(0.14, 16, 16)
    openMouthGeom.scale(1.1, 0.7, 0.25)
    const openMouthMat = createColorMaterial(0xFFAAAA)
    openMouth = new THREE.Mesh(openMouthGeom, openMouthMat)
    openMouth.position.set(0, -0.25, 1.3)
    openMouth.visible = false
    bunnyGroup.add(openMouth)
  }

  const createArms = () => {
    const whiteMat = createWhiteMaterial()
    const armGeom = new THREE.CapsuleGeometry(0.16, 0.35, 8, 16)

    leftArm = new THREE.Mesh(armGeom, whiteMat)
    leftArm.position.set(-0.95, -0.95, 0.25)
    leftArm.rotation.z = 0.5
    bunnyGroup.add(leftArm)

    rightArm = new THREE.Mesh(armGeom, whiteMat)
    rightArm.position.set(0.95, -0.95, 0.25)
    rightArm.rotation.z = -0.5
    bunnyGroup.add(rightArm)
  }

  const createTears = () => {
    const tearMat = new THREE.MeshBasicMaterial({
      color: colors.tear,
      transparent: true,
      opacity: 0.75
    })

    // Tear streaks - start just below the eyes (eyes are at y=0.2)
    const streakGeom = new THREE.PlaneGeometry(0.07, 0.35)

    tearStreakLeft = new THREE.Mesh(streakGeom, tearMat)
    tearStreakLeft.position.set(-0.43, -0.05, 1.34)
    tearStreakLeft.visible = false
    bunnyGroup.add(tearStreakLeft)

    tearStreakRight = new THREE.Mesh(streakGeom, tearMat)
    tearStreakRight.position.set(0.43, -0.05, 1.34)
    tearStreakRight.visible = false
    bunnyGroup.add(tearStreakRight)

    // Tear drops - at bottom of streaks
    const tearGeom = new THREE.SphereGeometry(0.055, 8, 8)
    tearGeom.scale(1, 1.25, 1)

    leftTear = new THREE.Mesh(tearGeom, tearMat)
    leftTear.position.set(-0.43, -0.28, 1.32)
    leftTear.visible = false
    bunnyGroup.add(leftTear)

    rightTear = new THREE.Mesh(tearGeom, tearMat)
    rightTear.position.set(0.43, -0.28, 1.32)
    rightTear.visible = false
    bunnyGroup.add(rightTear)
  }

  const createPeony = (x, y, z, scale = 1) => {
    const peonyGroup = new THREE.Group()

    const layers = [
      { radius: 0.25, petals: 8, color: colors.peonyPink, yOffset: 0 },
      { radius: 0.2, petals: 6, color: colors.peonyLight, yOffset: 0.05 },
      { radius: 0.15, petals: 5, color: colors.peonyDark, yOffset: 0.1 },
      { radius: 0.08, petals: 4, color: colors.peonyLight, yOffset: 0.13 }
    ]

    layers.forEach(layer => {
      for (let i = 0; i < layer.petals; i++) {
        const angle = (i / layer.petals) * Math.PI * 2
        const petalGeom = new THREE.SphereGeometry(layer.radius * 0.6, 8, 8)
        petalGeom.scale(1, 0.3, 1.5)
        const petalMat = createColorMaterial(layer.color)
        const petal = new THREE.Mesh(petalGeom, petalMat)
        petal.position.x = Math.cos(angle) * layer.radius * 0.5
        petal.position.z = Math.sin(angle) * layer.radius * 0.5
        petal.position.y = layer.yOffset
        petal.rotation.y = angle
        petal.rotation.x = -0.3
        peonyGroup.add(petal)
      }
    })

    const centerGeom = new THREE.SphereGeometry(0.06, 8, 8)
    const centerMat = createColorMaterial(0xFFE4B5)
    const center = new THREE.Mesh(centerGeom, centerMat)
    center.position.y = 0.15
    peonyGroup.add(center)

    peonyGroup.position.set(x, y, z)
    peonyGroup.scale.setScalar(scale)

    return peonyGroup
  }

  const createBouquet = () => {
    bouquetGroup = new THREE.Group()

    const stemGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8)
    const stemMat = createColorMaterial(colors.leaf)

    for (let i = 0; i < 5; i++) {
      const stem = new THREE.Mesh(stemGeom, stemMat)
      stem.position.set((i - 2) * 0.12, -0.25, 0)
      stem.rotation.z = (i - 2) * 0.08
      bouquetGroup.add(stem)
    }

    bouquetGroup.add(createPeony(0, 0.18, 0.08, 0.9))
    bouquetGroup.add(createPeony(-0.25, 0.08, 0, 0.7))
    bouquetGroup.add(createPeony(0.25, 0.08, 0, 0.7))
    bouquetGroup.add(createPeony(-0.12, 0.25, 0.12, 0.6))
    bouquetGroup.add(createPeony(0.12, 0.25, 0.12, 0.6))

    const leafGeom = new THREE.SphereGeometry(0.12, 8, 8)
    leafGeom.scale(1, 0.2, 1.8)
    const leafMat = createColorMaterial(colors.leaf)

    const leaf1 = new THREE.Mesh(leafGeom, leafMat)
    leaf1.position.set(-0.32, -0.08, 0)
    leaf1.rotation.z = 0.45
    bouquetGroup.add(leaf1)

    const leaf2 = new THREE.Mesh(leafGeom, leafMat)
    leaf2.position.set(0.32, -0.08, 0)
    leaf2.rotation.z = -0.45
    bouquetGroup.add(leaf2)

    // Position bouquet outside the body, held in front
    bouquetGroup.position.set(-1.1, -0.7, 0.9)
    bouquetGroup.rotation.z = 0.4
    bouquetGroup.rotation.x = 1.0
    bouquetGroup.rotation.y = 0.2
    bouquetGroup.visible = false
    bunnyGroup.add(bouquetGroup)
  }

  const createPeaceSign = () => {
    peaceFingers = new THREE.Group()
    const whiteMat = createWhiteMaterial()

    const fingerGeom = new THREE.CapsuleGeometry(0.045, 0.32, 8, 8)

    const indexFinger = new THREE.Mesh(fingerGeom, whiteMat)
    indexFinger.position.set(-0.07, 0.16, 0)
    indexFinger.rotation.z = 0.1
    peaceFingers.add(indexFinger)

    const middleFinger = new THREE.Mesh(fingerGeom, whiteMat)
    middleFinger.position.set(0.07, 0.16, 0)
    middleFinger.rotation.z = -0.1
    peaceFingers.add(middleFinger)

    const palmGeom = new THREE.SphereGeometry(0.1, 8, 8)
    palmGeom.scale(1, 0.65, 0.45)
    const palm = new THREE.Mesh(palmGeom, whiteMat)
    peaceFingers.add(palm)

    peaceFingers.position.set(0.95, -0.35, 0.45)
    peaceFingers.rotation.z = -0.35
    peaceFingers.visible = false
    bunnyGroup.add(peaceFingers)
  }

const createClosedEyes = () => {
  closedEyeLines.forEach(e => bunnyGroup.remove(e))
  closedEyeLines = []

  const eyeMat = new THREE.MeshBasicMaterial({ color: colors.pupil })

  const arcWidth = 0.28
  const arcHeight = 0.09
  const thickness = 0.045

  const segments = 24

  // LEFT EYE
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.55 - arcWidth / 2, 0.17, 1.32),
    new THREE.Vector3(-0.55, 0.17 + arcHeight, 1.34),
    new THREE.Vector3(-0.55 + arcWidth / 2, 0.17, 1.32)
  ])

  const leftEye = new THREE.Mesh(
    new THREE.TubeGeometry(leftCurve, segments, thickness, 14, false),
    eyeMat
  )

  bunnyGroup.add(leftEye)
  closedEyeLines.push(leftEye)

  // RIGHT EYE
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.55 - arcWidth / 2, 0.17, 1.32),
    new THREE.Vector3(0.55, 0.17 + arcHeight, 1.34),
    new THREE.Vector3(0.55 + arcWidth / 2, 0.17, 1.32)
  ])

  const rightEye = new THREE.Mesh(
    new THREE.TubeGeometry(rightCurve, segments, thickness, 14, false),
    eyeMat
  )

  bunnyGroup.add(rightEye)
  closedEyeLines.push(rightEye)
}


  const createSadEyebrows = () => {
    sadEyebrows.forEach(line => bunnyGroup.remove(line))
    sadEyebrows = []

    const lineMat = new THREE.LineBasicMaterial({ color: colors.pupil, linewidth: 50 })

    // Sad eyebrows droop DOWN on outer edges (not up like angry)
    // Left eyebrow: inner edge higher, outer edge lower
    const leftPoints = [
      new THREE.Vector3(-0.52, 0.32, 1.32),  // outer - lower
      new THREE.Vector3(-0.35, 0.4, 1.35)    // inner - higher
    ]
    const leftGeom = new THREE.BufferGeometry().setFromPoints(leftPoints)
    const leftLine = new THREE.Line(leftGeom, lineMat)
    bunnyGroup.add(leftLine)
    sadEyebrows.push(leftLine)

    // Right eyebrow: inner edge higher, outer edge lower
    const rightPoints = [
      new THREE.Vector3(0.35, 0.4, 1.35),    // inner - higher
      new THREE.Vector3(0.52, 0.32, 1.32)    // outer - lower
    ]
    const rightGeom = new THREE.BufferGeometry().setFromPoints(rightPoints)
    const rightLine = new THREE.Line(rightGeom, lineMat)
    bunnyGroup.add(rightLine)
    sadEyebrows.push(rightLine)
  }

  const removeSadEyebrows = () => {
    sadEyebrows.forEach(line => bunnyGroup.remove(line))
    sadEyebrows = []
  }

  const removeClosedEyes = () => {
    closedEyeLines.forEach(line => bunnyGroup.remove(line))
    closedEyeLines = []
  }

  const updateEyes = (mouseX, mouseY, containerWidth, containerHeight) => {
    const normalizedX = (mouseX / containerWidth) * 2 - 1
    const normalizedY = -((mouseY / containerHeight) * 2 - 1)

    // Clamp to prevent extreme values
    const clampedX = Math.max(-0.8, Math.min(0.8, normalizedX))
    const clampedY = Math.max(-0.8, Math.min(0.8, normalizedY))

    // Set target rotation toward cursor (very subtle)
    targetRotation.y = clampedX * 0.12
    targetRotation.x = -clampedY * 0.06

    if (!leftEyeGroup || !rightEyeGroup || !leftEyeGroup.visible) return

    // Smaller, smoother eye movement
    const maxOffset = 0.06
    const offsetX = clampedX * maxOffset
    const offsetY = clampedY * maxOffset * 0.4

    // Move entire eye group (pupil + shine stay together)
    leftEyeGroup.position.x = -0.4 + offsetX
    leftEyeGroup.position.y = 0.2 + offsetY

    rightEyeGroup.position.x = 0.4 + offsetX
    rightEyeGroup.position.y = 0.2 + offsetY
  }

  const updateEmotion = (emotion, intensity = {}) => {
    if (!bunnyGroup) return

    currentEmotion = emotion

    // Reset visibility
    smile.visible = false
    frown.visible = false
    happyMouth.visible = false
    openMouth.visible = false
    leftTear.visible = false
    rightTear.visible = false
    tearStreakLeft.visible = false
    tearStreakRight.visible = false
    bouquetGroup.visible = false
    peaceFingers.visible = false
    leftEyeGroup.visible = true
    rightEyeGroup.visible = true
    leftArm.visible = true
    rightArm.visible = true

    // Reset ear targets to neutral
    targetEarState = {
      leftY: 1.85,
      rightY: 1.85,
      leftRotZ: 0.15,
      rightRotZ: -0.15
    }

    // Reset shake target
    targetShakeOffset = { x: 0, y: 0 }
    removeClosedEyes()
    removeSadEyebrows()

    switch (emotion) {
      case EMOTIONS.NEUTRAL:
        smile.visible = true
        break

      case EMOTIONS.HAPPY:
        happyMouth.visible = true
        targetEarState.leftY = 1.95
        targetEarState.rightY = 1.95
        break

      case EMOTIONS.VERY_HAPPY:
        openMouth.visible = true
        happyMouth.visible = true
        targetEarState.leftY = 2.0
        targetEarState.rightY = 2.0
        isNodding = true
        break

      case EMOTIONS.SAD:
        frown.visible = true
        createSadEyebrows()
        targetEarState.leftRotZ = 0.35
        targetEarState.rightRotZ = -0.35
        targetEarState.leftY = 1.7
        targetEarState.rightY = 1.7
        break

      case EMOTIONS.VERY_SAD:
        frown.visible = true
        createSadEyebrows()
        targetEarState.leftRotZ = 0.55
        targetEarState.rightRotZ = -0.55
        targetEarState.leftY = 1.6
        targetEarState.rightY = 1.6
        break

      case EMOTIONS.CRYING:
        frown.visible = true
        createSadEyebrows()
        leftTear.visible = true
        rightTear.visible = true
        tearStreakLeft.visible = true
        tearStreakRight.visible = true
        targetEarState.leftRotZ = 0.75
        targetEarState.rightRotZ = -0.75
        targetEarState.leftY = 1.5
        targetEarState.rightY = 1.5
        break

      case EMOTIONS.CELEBRATION:
        openMouth.visible = true
        happyMouth.visible = true
        bouquetGroup.visible = true
        targetEarState.leftY = 2.05
        targetEarState.rightY = 2.05
        leftArm.visible = false
        break

      case EMOTIONS.WAITING:
        leftEyeGroup.visible = false
        rightEyeGroup.visible = false
        createClosedEyes()
        smile.visible = true
        bouquetGroup.visible = true
        peaceFingers.visible = true
        leftArm.visible = false
        rightArm.visible = false
        targetEarState.leftY = 1.95
        targetEarState.rightY = 1.95
        break
    }

    if (emotion !== EMOTIONS.VERY_HAPPY) {
      isNodding = false
      nodAngle = 0
    }
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)

    if (bunnyGroup) {
      // Smooth lerp speed
      const lerpSpeed = 0.12

      // Dynamic shake based on emotion
      if (currentEmotion === EMOTIONS.VERY_SAD) {
        targetShakeOffset.x = Math.sin(Date.now() * 0.02) * 0.035
        targetShakeOffset.y = Math.cos(Date.now() * 0.025) * 0.018
      } else if (currentEmotion === EMOTIONS.CRYING) {
        targetShakeOffset.x = Math.sin(Date.now() * 0.03) * 0.055
        targetShakeOffset.y = Math.cos(Date.now() * 0.035) * 0.035
      }

      // Smooth shake offset transition
      shakeOffset.x += (targetShakeOffset.x - shakeOffset.x) * lerpSpeed
      shakeOffset.y += (targetShakeOffset.y - shakeOffset.y) * lerpSpeed

      bunnyGroup.position.x = shakeOffset.x
      bunnyGroup.position.y = 0.3 + shakeOffset.y

      // Smooth rotation toward cursor
      const rotationSpeed = 0.08
      bunnyGroup.rotation.y += (targetRotation.y - bunnyGroup.rotation.y) * rotationSpeed

      if (isNodding) {
        nodAngle += 0.1
        bunnyGroup.rotation.x = Math.sin(nodAngle) * 0.1
      } else {
        // Smooth vertical rotation toward cursor
        const targetX = targetRotation.x
        bunnyGroup.rotation.x += (targetX - bunnyGroup.rotation.x) * rotationSpeed
      }

      // Smooth ear transitions
      if (leftEar && rightEar) {
        leftEar.position.y += (targetEarState.leftY - leftEar.position.y) * lerpSpeed
        rightEar.position.y += (targetEarState.rightY - rightEar.position.y) * lerpSpeed
        leftEar.rotation.z += (targetEarState.leftRotZ - leftEar.rotation.z) * lerpSpeed
        rightEar.rotation.z += (targetEarState.rightRotZ - rightEar.rotation.z) * lerpSpeed
      }

      // Very subtle breathing
      const breathe = Math.sin(Date.now() * 0.0018) * 0.012
      bunnyGroup.scale.y = 1 + breathe
    }

    renderer.render(scene, camera)
  }

  const dispose = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    if (renderer) {
      renderer.dispose()
    }
  }

  return {
    init,
    updateEyes,
    updateEmotion,
    dispose
  }
}
