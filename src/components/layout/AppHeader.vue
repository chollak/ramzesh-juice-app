<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="flex items-center p-4 min-h-[60px]">
      <!-- Кнопка назад -->
      <button 
        v-if="showBack" 
        class="mr-3 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
      
      <!-- Заголовок -->
      <div class="flex-1">
        <h1 class="text-xl font-semibold text-gray-900 leading-tight">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-gray-600 leading-tight">{{ subtitle }}</p>
      </div>
      
      <!-- Дополнительные действия -->
      <div v-if="$slots.actions" class="ml-3">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { hapticFeedback } from '@/utils/telegram'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: undefined
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const goBack = () => {
  hapticFeedback('light')
  router.back()
}
</script>

