<template>
  <div class="min-h-screen bg-white">
    <!-- Заголовок -->
    <AppHeader
      title="Натуральные соки"
      subtitle="Свежие соки каждый день"
    />

    <!-- Фильтр категорий -->
    <CategoryFilter
      :categories="categories"
      :selected-category="selectedCategory"
      @select="handleCategorySelect"
    />

    <!-- Контент -->
    <div>
      <!-- Загрузка -->
      <LoadingSpinner
        v-if="loading"
        text="Загружаем меню..."
        size="medium"
      />

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mx-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">Ошибка загрузки</h3>
            <div class="mt-1 text-sm text-red-700">{{ error }}</div>
            <div class="mt-3">
              <BaseButton
                variant="outline" 
                size="small"
                @click="retryLoad"
              >
                Повторить
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Пустой список -->
      <div v-else-if="filteredJuices.length === 0" class="flex flex-col items-center justify-center py-16 px-5 text-center">
        <svg class="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Соки не найдены</h3>
        <p class="text-gray-600">Попробуйте выбрать другую категорию</p>
      </div>
      
      <!-- Список соков -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <ProductCard
          v-for="juice in filteredJuices"
          :key="juice.id"
          :product="juice"
          @click="showJuiceDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

// Импорт компонентов
import AppHeader from '@/components/layout/AppHeader.vue'
import CategoryFilter from '@/components/business/CategoryFilter.vue'
import ProductCard from '@/components/business/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const appStore = useAppStore()

// Reactive data
const categories = computed(() => appStore.categories)
const filteredJuices = computed(() => appStore.filteredJuices)
const selectedCategory = computed(() => appStore.selectedCategory)
const loading = computed(() => appStore.loading)
const error = computed(() => appStore.error)

// Methods
const handleCategorySelect = (categoryId) => {
  appStore.setCategory(categoryId)
}

const showJuiceDetails = (juice) => {
  // Пока что только логируем, можно добавить модальное окно или отдельную страницу
  console.log('Show juice details:', juice)
}

const retryLoad = async () => {
  await appStore.initApp()
}
</script>

