<template>
  <div class="min-h-screen bg-tg-bg pb-24">
    <!-- Заголовок -->
    <header class="bg-tg-bg px-4 py-6 sticky top-0 z-20">
      <h1 class="text-2xl font-bold text-tg-text mb-1">Натуральные соки</h1>
      <p class="text-sm text-tg-hint">Свежие соки каждый день</p>
    </header>

    <!-- Фильтр категорий -->
    <CategoryFilter
      :categories="categories"
      :selected-category="selectedCategory"
      @select="handleCategorySelect"
    />

    <!-- Загрузка -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-tg-button"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="px-4 py-8">
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p class="text-red-600 mb-3">{{ error }}</p>
        <button 
          @click="retryLoad"
          class="btn-primary"
        >
          Повторить
        </button>
      </div>
    </div>

    <!-- Список соков -->
    <div v-else class="px-4">
      <div v-if="filteredJuices.length === 0" class="py-20 text-center">
        <p class="text-tg-hint text-lg mb-4">Соки не найдены</p>
        <p class="text-sm text-tg-hint">Попробуйте выбрать другую категорию</p>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <JuiceCard
          v-for="juice in filteredJuices"
          :key="juice.id"
          :juice="juice"
          @click="showJuiceDetails"
        />
      </div>
    </div>

    <!-- Плавающая кнопка корзины -->
    <CartFab />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import CategoryFilter from '@/components/CategoryFilter.vue'
import JuiceCard from '@/components/JuiceCard.vue'
import CartFab from '@/components/CartFab.vue'

const router = useRouter()
const appStore = useAppStore()

const categories = computed(() => appStore.categories)
const filteredJuices = computed(() => appStore.filteredJuices)
const selectedCategory = computed(() => appStore.selectedCategory)
const loading = computed(() => appStore.loading)
const error = computed(() => appStore.error)

const handleCategorySelect = (categoryId) => {
  appStore.setCategory(categoryId)
}

const showJuiceDetails = (juice) => {
  router.push(`/juice/${juice.id}`)
}

const retryLoad = async () => {
  await appStore.initApp()
}
</script>
