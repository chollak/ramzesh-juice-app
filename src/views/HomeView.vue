<template>
  <div class="home-view">
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
    <div class="home-view__content">
      <!-- Загрузка -->
      <LoadingSpinner
        v-if="loading"
        text="Загружаем меню..."
        :size="50"
      />

      <!-- Ошибка -->
      <va-alert
        v-else-if="error"
        color="danger"
        border="left"
        class="home-view__error"
      >
        <template #title>Ошибка загрузки</template>
        {{ error }}
        <template #action>
          <BaseButton
            size="small"
            color="danger"
            preset="outline"
            @click="retryLoad"
          >
            Повторить
          </BaseButton>
        </template>
      </va-alert>

      <!-- Пустой список -->
      <div v-else-if="filteredJuices.length === 0" class="home-view__empty">
        <va-icon name="local_drink" size="4rem" color="secondary" />
        <h3>Соки не найдены</h3>
        <p>Попробуйте выбрать другую категорию</p>
      </div>
      
      <!-- Список соков -->
      <div v-else class="home-view__products">
        <ProductCard
          v-for="juice in filteredJuices"
          :key="juice.id"
          :product="juice"
          class="slide-up"
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

<style scoped>
.home-view {
  min-height: 100vh;
  background-color: #ffffff;
}

.home-view__content {
  padding: 16px;
}

.home-view__error {
  margin: 16px;
}

.home-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.home-view__empty h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: var(--va-text-primary);
}

.home-view__empty p {
  margin: 0;
  color: var(--va-text-secondary);
}

.home-view__products {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .home-view__products {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

/* Анимации появления карточек */
.slide-up {
  animation-delay: calc(var(--index, 0) * 0.1s);
}

.home-view__products .slide-up:nth-child(1) { --index: 1; }
.home-view__products .slide-up:nth-child(2) { --index: 2; }
.home-view__products .slide-up:nth-child(3) { --index: 3; }
.home-view__products .slide-up:nth-child(4) { --index: 4; }
.home-view__products .slide-up:nth-child(5) { --index: 5; }
.home-view__products .slide-up:nth-child(6) { --index: 6; }
</style>