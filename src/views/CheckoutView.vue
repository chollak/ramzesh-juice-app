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
      <h1 class="text-2xl font-bold text-tg-text">Оформление заказа</h1>
    </header>

    <div class="px-4 space-y-6">
      <!-- Информация о заказе -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-tg-text mb-4">Комментарий к заказу</h2>

        <div>
          <textarea
            v-model="form.comment"
            placeholder="Дополнительные пожелания к заказу (необязательно)"
            class="input-field resize-none"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Способ оплаты -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-tg-text mb-4">Способ оплаты</h2>
        
        <div class="space-y-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="cash"
              class="w-5 h-5"
            >
            <span class="text-tg-text">Наличные при получении</span>
          </label>
          
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="card"
              class="w-5 h-5"
            >
            <span class="text-tg-text">Картой при получении</span>
          </label>
        </div>
      </div>

      <!-- Итого -->
      <div class="bg-tg-button bg-opacity-10 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-tg-hint">Товаров:</span>
          <span class="font-semibold text-tg-text">{{ cartCount }}</span>
        </div>
        <div class="flex items-center justify-between text-xl">
          <span class="font-bold text-tg-text">Итого:</span>
          <span class="font-bold text-tg-button">{{ formatPrice(cartTotal) }}</span>
        </div>
      </div>

      <!-- Кнопка подтверждения -->
      <button
        @click="submitOrder"
        :disabled="submitting"
        class="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Оформление...
        </span>
        <span v-else>Подтвердить заказ</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { api } from '@/utils/supabase'
import { formatPrice, hapticFeedback, showAlert, getUserData } from '@/utils/telegram'

const router = useRouter()
const cartStore = useCartStore()
const appStore = useAppStore()

const form = ref({
  comment: '',
  paymentMethod: 'cash'
})

const submitting = ref(false)

const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)

onMounted(() => {
  if (cartStore.isEmpty) {
    router.push('/')
  }
})

const goBack = () => {
  hapticFeedback('light')
  router.back()
}

const submitOrder = async () => {
  if (submitting.value) return

  try {
    submitting.value = true
    hapticFeedback('medium')

    // Получаем данные пользователя из Telegram
    const telegramUser = getUserData()
    if (!telegramUser || !telegramUser.id) {
      throw new Error('Не удалось получить данные пользователя из Telegram')
    }

    // Создаем заказ с telegram_id
    const orderData = {
      telegram_user_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      user_first_name: telegramUser.first_name || null,
      user_last_name: telegramUser.last_name || null,
      phone_number: telegramUser.phone_number || null,
      total_amount: cartTotal.value,
      comment: form.value.comment || null,
      payment_method: form.value.paymentMethod,
      status: 'pending'
    }

    const order = await api.createOrder(orderData)

    // Создаем позиции заказа
    const orderItems = cartStore.items.map(item => ({
      juice_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    await api.createOrderItems(order.id, orderItems)

    // Очищаем корзину
    cartStore.clearCart()

    hapticFeedback('success')
    showAlert('Заказ успешно оформлен! Ожидайте звонка для подтверждения.')

    // Переходим на главную
    router.push('/')

  } catch (error) {
    console.error('Error submitting order:', error)
    hapticFeedback('error')
    showAlert(`Ошибка: ${error.message}`)
  } finally {
    submitting.value = false
  }
}
</script>
