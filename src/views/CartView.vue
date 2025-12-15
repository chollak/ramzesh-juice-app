<template>
  <div class="cart-view">
    <!-- Заголовок -->
    <AppHeader
      title="Корзина"
      show-back
    />

    <!-- Контент -->
    <div class="cart-view__content">
      <!-- Пустая корзина -->
      <div v-if="isEmpty" class="cart-view__empty">
        <va-icon name="shopping_cart" size="4rem" color="secondary" />
        <h3>Ваша корзина пуста</h3>
        <p>Добавьте товары из каталога</p>
        <BaseButton
          color="primary"
          size="large"
          @click="goToMenu"
        >
          Перейти в меню
        </BaseButton>
      </div>

      <!-- Товары в корзине -->
      <div v-else class="cart-view__items">
        <!-- Список товаров -->
        <div class="cart-view__list">
          <TransitionGroup name="cart-item" tag="div">
            <BaseCard
              v-for="item in items"
              :key="item.id"
              class="cart-view__item"
            >
              <div class="cart-item">
                <img 
                  :src="item.image_url" 
                  :alt="item.name"
                  class="cart-item__image"
                >
                
                <div class="cart-item__info">
                  <h4 class="cart-item__name">{{ item.name }}</h4>
                  <p class="cart-item__volume">{{ item.volume_ml }} мл</p>
                  <p class="cart-item__price">{{ formatPrice(item.price) }}</p>
                </div>
                
                <div class="cart-item__actions">
                  <BaseButton
                    preset="plain"
                    color="danger"
                    size="small"
                    @click="removeItem(item.id)"
                  >
                    <va-icon name="delete" />
                  </BaseButton>
                  
                  <div class="cart-item__quantity">
                    <BaseButton
                      size="small"
                      color="secondary"
                      @click="decrementQuantity(item.id)"
                    >
                      −
                    </BaseButton>
                    <span class="cart-item__count">{{ item.quantity }}</span>
                    <BaseButton
                      size="small"
                      color="primary"
                      @click="incrementQuantity(item.id)"
                    >
                      +
                    </BaseButton>
                  </div>
                </div>
              </div>
            </BaseCard>
          </TransitionGroup>
        </div>

        <!-- Итого -->
        <BaseCard class="cart-view__summary">
          <div class="cart-summary">
            <div class="cart-summary__row">
              <span>Товаров:</span>
              <span>{{ cartCount }}</span>
            </div>
            <div class="cart-summary__row cart-summary__total">
              <span>Итого:</span>
              <span>{{ formatPrice(cartTotal) }}</span>
            </div>
          </div>
        </BaseCard>

        <!-- Кнопка оформления -->
        <BaseButton
          color="primary"
          size="large"
          block
          class="cart-view__checkout"
          @click="goToCheckout"
        >
          Оформить заказ
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { formatPrice, hapticFeedback, showConfirm } from '@/utils/telegram'

// Импорт компонентов
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const cartStore = useCartStore()

// Reactive data
const items = computed(() => cartStore.items)
const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)
const isEmpty = computed(() => cartStore.isEmpty)

// Methods
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

<style scoped>
.cart-view {
  min-height: 100vh;
  background-color: #ffffff;
}

.cart-view__content {
  padding: 16px;
}

.cart-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 16px;
}

.cart-view__empty h3 {
  margin: 0;
  font-size: 18px;
  color: var(--va-text-primary);
}

.cart-view__empty p {
  margin: 0;
  color: var(--va-text-secondary);
}

.cart-view__items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-view__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-view__item {
  overflow: visible;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.cart-item__image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.cart-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-item__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.cart-item__volume {
  margin: 0;
  font-size: 14px;
  color: var(--va-text-secondary);
}

.cart-item__price {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--va-primary);
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cart-item__quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-item__count {
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  font-size: 16px;
}

.cart-view__summary {
  background-color: var(--va-background-secondary);
}

.cart-summary {
  padding: 16px;
}

.cart-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cart-summary__row:last-child {
  margin-bottom: 0;
}

.cart-summary__total {
  font-size: 18px;
  font-weight: 700;
  color: var(--va-primary);
}

.cart-view__checkout {
  margin-top: 8px;
}

/* Анимации */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.cart-item-move {
  transition: transform 0.3s ease;
}
</style>