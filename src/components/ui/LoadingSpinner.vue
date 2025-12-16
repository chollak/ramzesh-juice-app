<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses"></div>
    <p v-if="text" class="mt-3 text-sm text-gray-600">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium' // small, medium, large
  },
  color: {
    type: String,
    default: 'blue' // blue, gray, green, red
  },
  text: {
    type: String,
    default: undefined
  },
  centered: {
    type: Boolean,
    default: true
  }
})

const containerClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center'
  const centeredClasses = props.centered ? 'justify-center min-h-[200px]' : ''
  
  return [baseClasses, centeredClasses].filter(Boolean).join(' ')
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3'
  }
  
  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600'
  }
  
  return [
    'rounded-full animate-spin',
    sizeClasses[props.size],
    colorClasses[props.color]
  ].join(' ')
})
</script>