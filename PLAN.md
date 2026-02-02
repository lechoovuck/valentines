# Valentine's Bunny Card - Project Plan

## Overview
An interactive Valentine's card featuring a 3D bunny built from geometric primitives that emotionally reacts to cursor position and user interactions.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | Frontend framework with Composition API |
| **Vite** | Build tool & dev server |
| **Three.js** | 3D rendering engine |
| **@vueuse/core** | Utilities for mouse tracking, responsive breakpoints |
| **GSAP** (optional) | Smooth animations for button transitions |

---

## Project Structure

```
valentines/
├── src/
│   ├── components/
│   │   ├── BunnyScene.vue      # Three.js canvas & bunny
│   │   ├── ValentineCard.vue   # Main card layout
│   │   └── ActionButtons.vue   # Yes/No buttons
│   ├── composables/
│   │   ├── useBunny.js         # Bunny 3D model & animations
│   │   ├── useEmotions.js      # Emotion state machine
│   │   └── useCursorTracking.js # Mouse position tracking
│   ├── App.vue
│   ├── main.js
│   └── style.css               # Global styles & CSS variables
├── index.html
├── package.json
└── vite.config.js
```

---

## 3D Bunny Design (Three.js Primitives)

### Body Parts
- **Head**: Large sphere (white/cream)
- **Body**: Oval sphere (slightly smaller)
- **Ears**: 2 elongated capsules/cylinders with rounded tops (pink inside)
- **Eyes**: 2 spheres (white) with smaller black spheres (pupils)
- **Nose**: Small pink sphere
- **Cheeks**: 2 pink circles (blush)
- **Mouth**: Curved line or small shapes (changes with emotion)
- **Arms**: 2 small cylinders (for holding flowers later)

### Animations
| State | Visual Changes |
|-------|---------------|
| **Neutral** | Eyes follow cursor, slight idle bounce |
| **Happy** | Ears perk up, smile widens, subtle bounce |
| **Very Happy** | Nodding, big smile, ears wiggle |
| **Sad** | Ears droop, frown, eyes look down slightly |
| **Very Sad** | Shaking/trembling, tears appear, ears flat |
| **Crying** | Tear drops fall, intense shaking, ears completely down |
| **Celebration** | Big smile, pulls out flower bouquet, hearts float up |

---

## Interaction Logic

### Cursor Tracking
```
Distance from "No" button → Sadness level (0-100%)
Distance from "Yes" button → Happiness level (0-100%)
```

### Emotion States
1. **Default**: Neutral, eyes follow cursor
2. **Near No**: Progressively sadder as cursor approaches
3. **Hover No**: Maximum sadness, shaking animation
4. **Near Yes**: Progressively happier
5. **Hover Yes**: Nodding, big smile
6. **Click No**: Crying, button shrinks, Yes grows
7. **Click Yes**: Celebration mode with flowers

---

## Responsive Layout

### Desktop (width > 768px)
```
┌─────────────────────────────────────┐
│     "Will you be my Valentine?"     │
│                                     │
│                🐰                   │
│              (bunny)                │
│                                     │
│   [YES]                    [NO]     │
│   (left)                  (right)   │
└─────────────────────────────────────┘
```

### Mobile Portrait (width ≤ 768px)
```
┌─────────────────────┐
│  "Will you be my    │
│    Valentine?"      │
│                     │
│       [YES]         │
│       (top)         │
│                     │
│        🐰          │
│      (bunny)        │
│                     │
│       [NO]          │
│      (bottom)       │
└─────────────────────┘
```

---

## Color Palette (Cute & Pastel)

| Element | Color | Hex |
|---------|-------|-----|
| Background | Soft Pink | `#FFE4EC` |
| Bunny Body | Cream White | `#FFF8F0` |
| Bunny Ears (inner) | Soft Pink | `#FFB6C1` |
| Bunny Blush | Rosy Pink | `#FF9AAB` |
| Eyes | White + Black | `#FFFFFF` / `#333333` |
| Nose | Pink | `#FF8FA3` |
| Yes Button | Mint Green | `#98D8AA` |
| No Button | Soft Red | `#FF6B6B` |
| Hearts | Various Pinks | `#FF69B4`, `#FF1493` |
| Tears | Light Blue | `#87CEEB` |

---

## Animation Details

### Eye Tracking
- Pupils move within eye bounds based on cursor position
- Smooth lerping for natural movement
- Max movement: ~30% of eye radius

### Shaking (Sad State)
- Small random X/Y offset oscillation
- Frequency increases with sadness level
- Uses sine wave for natural trembling

### Nodding (Happy/Yes Hover)
- Head rotates up/down on X-axis
- 2-3 gentle nods when hovering Yes
- Smooth easing

### Flower Bouquet Reveal
- Arm moves from side to front
- Flowers (simple colored spheres/cones) appear
- Hearts particle effect rises up

### Button Animations
- On "No" click: No button scales down (0.8 → 0.5 → 0.3...)
- Yes button scales up (1 → 1.2 → 1.5...)
- Smooth spring animation

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Vue + Vite project
- [ ] Install dependencies (three.js, @vueuse/core)
- [ ] Set up basic project structure
- [ ] Create global styles with CSS variables

### Phase 2: Basic 3D Bunny
- [ ] Set up Three.js scene in Vue component
- [ ] Create bunny body from primitives
- [ ] Add basic lighting
- [ ] Implement idle animation

### Phase 3: Eye Tracking
- [ ] Track mouse/cursor position
- [ ] Calculate eye direction
- [ ] Animate pupils following cursor

### Phase 4: Emotion System
- [ ] Create emotion state machine
- [ ] Implement happy expressions
- [ ] Implement sad expressions
- [ ] Add transitions between states

### Phase 5: Button Interactions
- [ ] Create responsive button layout
- [ ] Calculate distance from cursor to buttons
- [ ] Connect distance to emotion states
- [ ] Implement hover effects

### Phase 6: Click Behaviors
- [ ] "No" click → crying + button resize
- [ ] "Yes" click → celebration + flowers
- [ ] Button disappear animation

### Phase 7: Polish
- [ ] Add particle effects (hearts, tears)
- [ ] Fine-tune animations
- [ ] Mobile responsive testing
- [ ] Performance optimization

---

## Confirmed Details

### 1. Flower Bouquet - Peonies
Detailed peony flowers built from layered spheres/circles:
- Multiple layers of petals (outer to inner)
- Soft pink/white gradient colors
- 3-5 peonies in the bouquet
- Green leaves accent

### 2. Sound Effects
None - keeping it silent

### 3. "No" Button Behavior
Button shrinks with each click and cycles through these texts:
```
["No", "You sure?", "For real?", "Please", "You're breaking my heart", "I love you"]
```
- Loops back to start after "I love you"
- Button gets progressively smaller each click
- Yes button grows each time No is clicked

### 4. "Yes" Click - Celebration Screen
- Buttons disappear
- Happy bunny holding peony bouquet
- Confetti explosion animation
- "Yay!" text appears below bunny
- Hearts floating up

### 5. Persistent State (localStorage)
After user clicks "Yes" and reloads the page:
- Show "See you on Feb 14!" message
- Bunny with happy ^_^ closed-eye smile face
- Holding the peony bouquet
- Other arm showing peace sign ✌️
- No buttons shown

---

## State Machine

```
┌─────────────┐
│   INITIAL   │ ← Page load (no localStorage)
└──────┬──────┘
       │
       ▼
┌─────────────┐     cursor near/on buttons
│  WATCHING   │ ←──────────────────────────┐
└──────┬──────┘                            │
       │                                   │
       ├─── hover Yes ──→ HAPPY (nodding)  │
       │                                   │
       ├─── hover No ───→ VERY_SAD (shaking)
       │                                   │
       ├─── click No ───→ CRYING ──────────┘
       │                  (cycle text, shrink button)
       │
       └─── click Yes ──→ CELEBRATION
                               │
                               ▼
                         ┌───────────┐
                         │  ACCEPTED │ ← Saved to localStorage
                         └───────────┘
                               │
                               ▼ (on reload)
                         ┌───────────┐
                         │  WAITING  │ "See you on Feb 14!"
                         └───────────┘
```

---

## Notes

- Keep bundle size small for fast loading
- Prioritize smooth 60fps animations
- Test on both desktop and mobile
- Consider adding a loading state for Three.js initialization
- Use localStorage key: `valentine_accepted`

---

**Ready to proceed?** Review the updated plan, then let me know and I'll start building!
