<template>
  <Teleport to="body">
    <Transition name="cart-fab" appear>
      <button
        v-if="!isEmpty"
        class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-3 min-w-[72px]"
        @click="goToCart"
      >
        <div class="relative flex items-center justify-center mb-1">
          <!-- Иконка корзины -->
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
          </svg>
          
          <!-- Бейдж с количеством -->
          <div class="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {{ cartCount }}
          </div>
        </div>
        
        <!-- Общая сумма -->
        <div class="text-xs font-semibold whitespace-nowrap">
          {{ formatPrice(cartTotal) }}
        </div>
      </button>
    </Transition>
  </Teleport>
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
/* Анимации появления/исчезновения */
.cart-fab-enter-active,
.cart-fab-leave-active {
  transition: all 0.3s ease;
}

.cart-fab-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.cart-fab-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* Адаптивность для мобильных */
@media (max-width: 640px) {
  button[class*="fixed"] {
    bottom: 16px !important;
    right: 16px !important;
  }
}
</style>