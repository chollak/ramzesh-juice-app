<template>
  <div id="app" class="min-h-screen bg-tg-bg">
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
  // Инициализируем Telegram Web App
  initTelegramApp()
  
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
