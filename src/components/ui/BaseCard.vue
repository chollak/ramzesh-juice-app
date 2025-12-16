<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <div v-if="$slots.header" class="px-4 pt-4">
      <slot name="header" />
    </div>

    <div v-if="image" class="overflow-hidden">
      <img 
        :src="image" 
        :alt="imageAlt || 'Card image'"
        class="w-full h-48 object-cover"
        loading="lazy"
      >
    </div>

    <div class="p-4">
      <slot />
    </div>

    <div v-if="$slots.actions" class="px-4 pb-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { hapticFeedback } from '@/utils/telegram'

const props = defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: undefined
  },
  imageAlt: {
    type: String,
    default: undefined
  },
  shadow: {
    type: String,
    default: 'sm' // none, sm, md, lg
  }
})

const emit = defineEmits(['click'])

const cardClasses = computed(() => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 transition-all duration-200'
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  
  const clickableClasses = props.clickable 
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:translate-y-0' 
    : ''
  
  return [
    baseClasses,
    shadowClasses[props.shadow],
    clickableClasses
  ].filter(Boolean).join(' ')
})

const handleClick = (event) => {
  if (props.clickable) {
    hapticFeedback('light')
    emit('click', event)
  }
}
</script>

