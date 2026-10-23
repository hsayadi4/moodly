<script setup>
import { computed } from 'vue'

// petite icone de visage en svg, la bouche change selon le score (1 a 5)
const props = defineProps({
  score: { type: Number, required: true },
  size: { type: Number, default: 28 },
})

const mouths = {
  1: 'M11 22.5 Q16 17 21 22.5',
  2: 'M11.5 21.5 Q16 19 20.5 21.5',
  3: 'M11.5 20.5 L20.5 20.5',
  4: 'M11.5 19 Q16 22.5 20.5 19',
  5: 'M10.5 18.5 Q16 24.5 21.5 18.5',
}

const mouth = computed(() => mouths[props.score])
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="1.8" />
    <circle cx="12" cy="13" r="1.4" fill="currentColor" />
    <circle cx="20" cy="13" r="1.4" fill="currentColor" />
    <path :d="mouth" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  </svg>
</template>
