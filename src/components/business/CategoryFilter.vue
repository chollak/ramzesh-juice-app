<template>
  <div class="category-filter">
    <div class="category-filter__container">
      <va-chip
        :color="selectedCategory === null ? 'primary' : 'secondary'"
        size="large"
        class="category-filter__chip"
        @click="selectCategory(null)"
      >
        Все
      </va-chip>
      
      <va-chip
        v-for="category in categories"
        :key="category.id"
        :color="selectedCategory === category.id ? 'primary' : 'secondary'"
        size="large"
        class="category-filter__chip"
        @click="selectCategory(category.id)"
      >
        {{ category.name }}
      </va-chip>
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
.category-filter {
  padding: 16px;
  background: white;
  border-bottom: 1px solid var(--va-background-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.category-filter__container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
}

.category-filter__container::-webkit-scrollbar {
  display: none;
}

.category-filter__chip {
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-filter__chip:hover {
  transform: translateY(-1px);
}

.category-filter__chip:active {
  transform: translateY(0);
}
</style>