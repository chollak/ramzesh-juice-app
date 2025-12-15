<template>
  <Teleport to="body">
    <Transition name="cart-fab" appear>
      <va-button
        v-if="!isEmpty"
        color="primary"
        round
        size="large"
        class="cart-fab"
        @click="goToCart"
      >
        <div class="cart-fab__content">
          <va-icon name="shopping_cart" class="cart-fab__icon" />
          <va-badge
            :text="cartCount"
            color="warning"
            class="cart-fab__badge"
          />
        </div>
        <div class="cart-fab__total">
          {{ formatPrice(cartTotal) }}
        </div>
      </va-button>
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
.cart-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: auto;
  height: auto;
  padding: 12px 16px;
  flex-direction: column;
  gap: 4px;
}

.cart-fab__content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.cart-fab__icon {
  font-size: 20px;
}

.cart-fab__badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.cart-fab__total {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Анимации */
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

@media (max-width: 640px) {
  .cart-fab {
    bottom: 16px;
    right: 16px;
  }
}
</style>