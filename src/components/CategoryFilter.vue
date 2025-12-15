<template>
  <div class="sticky top-0 z-10 bg-tg-bg pb-3">
    <div class="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      <button
        @click="selectCategory(null)"
        :class="['category-badge whitespace-nowrap', { 'active': selectedCategory === null }]"
      >
        Все
      </button>
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="['category-badge whitespace-nowrap', { 'active': selectedCategory === category.id }]"
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
    required: true
  },
  selectedCategory: {
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
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
