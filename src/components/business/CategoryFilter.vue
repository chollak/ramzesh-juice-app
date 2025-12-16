<template>
  <div class="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          'hover:-translate-y-0.5 active:translate-y-0',
          selectedCategory === null 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
        @click="selectCategory(null)"
      >
        Все
      </button>
      
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          'hover:-translate-y-0.5 active:translate-y-0',
          selectedCategory === category.id 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { hapticFeedback } from '@/utils/telegram'

defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['select'])

const selectCategory = (categoryId) => {
  hapticFeedback('light')
  emit('select', categoryId)
}
</script>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>