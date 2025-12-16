<template>
  <div class="app bg-white min-h-screen pb-20">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Global FAB for cart -->
    <CartFab />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { initTelegramApp } from '@/utils/telegram'
import CartFab from '@/components/business/CartFab.vue'

const appStore = useAppStore()

onMounted(async () => {
  // Принудительно устанавливаем белую тему перед инициализацией
  document.body.style.backgroundColor = '#ffffff'
  document.body.style.color = '#000000'
  
  // Инициализируем Telegram Web App
  initTelegramApp()
  
  // Принудительно применяем белую тему после инициализации
  setTimeout(() => {
    document.body.style.backgroundColor = '#ffffff'
    document.body.style.color = '#000000'
  }, 100)
  
  // Инициализируем приложение
  await appStore.initApp()
})
</script>

<style scoped>
/* Анимации переходов между страницами */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
