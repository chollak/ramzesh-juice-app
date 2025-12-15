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

    <div class="px-4 space-y-4">
      <!-- Информация о заказе -->
      <div class="bg-tg-secondary-bg rounded-2xl p-5">
        <h2 class="font-bold text-tg-text mb-3 text-sm uppercase tracking-wide opacity-70">Комментарий к заказу</h2>

        <div>
          <textarea
            v-model="form.comment"
            placeholder="Дополнительные пожелания к заказу (необязательно)"
            class="w-full px-4 py-3 bg-tg-bg rounded-xl border-none outline-none text-tg-text placeholder-tg-hint resize-none focus:ring-2 focus:ring-tg-button focus:ring-opacity-50 transition-all"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- Способ оплаты -->
      <div class="bg-tg-secondary-bg rounded-2xl p-5">
        <h2 class="font-bold text-tg-text mb-3 text-sm uppercase tracking-wide opacity-70">Способ оплаты</h2>

        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-tg-bg hover:bg-opacity-80 transition-all">
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="cash"
              class="w-5 h-5 text-tg-button focus:ring-tg-button focus:ring-2"
            >
            <span class="text-tg-text font-medium">Наличные при получении</span>
          </label>

          <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-tg-bg hover:bg-opacity-80 transition-all">
            <input
              v-model="form.paymentMethod"
              type="radio"
              value="card"
              class="w-5 h-5 text-tg-button focus:ring-tg-button focus:ring-2"
            >
            <span class="text-tg-text font-medium">Картой при получении</span>
          </label>
        </div>
      </div>

      <!-- Итого -->
      <div class="bg-tg-secondary-bg rounded-2xl p-5">
        <div class="flex items-center justify-between mb-3">
          <span class="text-tg-hint text-sm">Товаров:</span>
          <span class="font-semibold text-tg-text">{{ cartCount }}</span>
        </div>
        <div class="flex items-center justify-between text-2xl">
          <span class="font-bold text-tg-text">Итого:</span>
          <span class="font-bold text-tg-button">{{ formatPrice(cartTotal) }}</span>
        </div>
      </div>

      <!-- Кнопка подтверждения -->
      <button
        @click="submitOrder"
        :disabled="submitting"
        class="w-full btn-primary text-lg py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
    console.log('Telegram user data:', telegramUser)

    if (!telegramUser || !telegramUser.id) {
      throw new Error('Пожалуйста, откройте приложение через Telegram бота для оформления заказа')
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

    console.log('Creating order with data:', orderData)
    const order = await api.createOrder(orderData)
    console.log('Order created:', order)

    // Создаем позиции заказа
    const orderItems = cartStore.items.map(item => ({
      juice_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    console.log('Creating order items:', orderItems)
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

    // Более информативное сообщение об ошибке
    let errorMessage = error.message || 'Произошла неизвестная ошибка'

    if (error.message?.includes('Telegram')) {
      errorMessage = 'Пожалуйста, откройте приложение через Telegram бота'
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету'
    }

    showAlert(`Ошибка при оформлении заказа: ${errorMessage}`)
  } finally {
    submitting.value = false
  }
}
</script>
