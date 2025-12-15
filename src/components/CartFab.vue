<template>
  <transition name="scale">
    <div 
      v-if="!isEmpty"
      class="cart-fab px-6 py-3 flex items-center gap-3 cursor-pointer"
      @click="goToCart"
    >
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="font-bold">{{ cartCount }}</span>
      </div>
      
      <div class="h-6 w-px bg-white opacity-50"></div>
      
      <span class="font-bold">{{ formatPrice(cartTotal) }}</span>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice, hapticFeedback } from '@/utils/telegram'

const router = useRouter()
const cartStore = useCartStore()

const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)
const isEmpty = computed(() => cartStore.isEmpty)

const goToCart = () => {
  hapticFeedback('medium')
  router.push('/cart')
}
</script>

<style scoped>
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}
</style>
