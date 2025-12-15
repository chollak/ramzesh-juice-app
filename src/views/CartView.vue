<template>
  <div class="min-h-screen bg-tg-bg pb-24">
    <!-- Заголовок -->
    <header class="bg-tg-bg px-4 py-6 flex items-center gap-3">
      <button 
        @click="goBack"
        class="text-tg-button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-tg-text">Корзина</h1>
    </header>

    <!-- Пустая корзина -->
    <div v-if="isEmpty" class="px-4 py-20 text-center">
      <svg class="w-24 h-24 mx-auto mb-4 text-tg-hint opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-tg-hint text-lg mb-6">Ваша корзина пуста</p>
      <button 
        @click="goToMenu"
        class="btn-primary"
      >
        Перейти в меню
      </button>
    </div>

    <!-- Товары в корзине -->
    <div v-else class="px-4">
      <div class="space-y-3 mb-6">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-2xl p-4 shadow-sm flex gap-4"
        >
          <img 
            :src="item.image_url" 
            :alt="item.name"
            class="w-20 h-20 object-cover rounded-xl"
          >
          
          <div class="flex-1">
            <h3 class="font-semibold text-tg-text mb-1">{{ item.name }}</h3>
            <p class="text-sm text-tg-hint mb-2">{{ item.volume_ml }} мл</p>
            <p class="text-lg font-bold text-tg-text">{{ formatPrice(item.price) }}</p>
          </div>
          
          <div class="flex flex-col items-end justify-between">
            <button
              @click="removeItem(item.id)"
              class="text-red-500 p-1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <div class="flex items-center gap-2">
              <button
                @click="decrementQuantity(item.id)"
                class="bg-tg-secondary-bg w-8 h-8 rounded-lg flex items-center justify-center font-bold text-tg-text"
              >
                −
              </button>
              <span class="font-semibold text-tg-text min-w-[20px] text-center">{{ item.quantity }}</span>
              <button
                @click="incrementQuantity(item.id)"
                class="bg-tg-button text-tg-button-text w-8 h-8 rounded-lg flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Итого -->
      <div class="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-tg-hint">Товаров:</span>
          <span class="font-semibold text-tg-text">{{ cartCount }}</span>
        </div>
        <div class="flex items-center justify-between text-lg">
          <span class="font-bold text-tg-text">Итого:</span>
          <span class="font-bold text-tg-text">{{ formatPrice(cartTotal) }}</span>
        </div>
      </div>

      <!-- Кнопка оформления заказа -->
      <button
        @click="goToCheckout"
        class="w-full btn-primary text-lg py-4"
      >
        Оформить заказ
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice, hapticFeedback, showConfirm } from '@/utils/telegram'

const router = useRouter()
const cartStore = useCartStore()

const items = computed(() => cartStore.items)
const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)
const isEmpty = computed(() => cartStore.isEmpty)

const goBack = () => {
  hapticFeedback('light')
  router.back()
}

const goToMenu = () => {
  hapticFeedback('light')
  router.push('/')
}

const goToCheckout = () => {
  hapticFeedback('medium')
  router.push('/checkout')
}

const removeItem = (itemId) => {
  showConfirm('Удалить товар из корзины?', (confirmed) => {
    if (confirmed) {
      cartStore.removeFromCart(itemId)
      hapticFeedback('success')
    }
  })
}

const incrementQuantity = (itemId) => {
  cartStore.incrementQuantity(itemId)
}

const decrementQuantity = (itemId) => {
  cartStore.decrementQuantity(itemId)
}
</script>
