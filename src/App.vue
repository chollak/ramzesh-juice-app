<template>
  <div id="app" class="min-h-screen" style="background-color: #ffffff !important;">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { initTelegramApp } from '@/utils/telegram'

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
    const app = document.getElementById('app')
    if (app) {
      app.style.backgroundColor = '#ffffff'
      app.style.color = '#000000'
    }
  }, 100)
  
  // Инициализируем приложение
  await appStore.initApp()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
