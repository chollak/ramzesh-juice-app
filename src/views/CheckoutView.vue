<template>
  <div class="min-h-screen pb-24" style="background-color: #ffffff !important;">
    <!-- Заголовок -->
    <header class="px-4 py-6 flex items-center gap-3" style="background-color: #ffffff !important;">
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
      <!-- Информация о пользователе -->
      <div class="bg-tg-secondary-bg rounded-2xl p-5">
        <h2 class="font-bold text-tg-text mb-3 text-sm uppercase tracking-wide opacity-70">Контактные данные</h2>

        <div v-if="userContact.phone_number" class="space-y-2">
          <div class="flex items-center gap-2 text-tg-text">
            <svg class="w-5 h-5 text-tg-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{{ userContact.first_name }} {{ userContact.last_name }}</span>
          </div>
          <div class="flex items-center gap-2 text-tg-text">
            <svg class="w-5 h-5 text-tg-button" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{{ userContact.phone_number }}</span>
          </div>
        </div>

        <button
          v-else
          @click="requestUserContact"
          :disabled="requestingContact"
          class="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg v-if="!requestingContact" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>{{ requestingContact ? 'Ожидание...' : 'Поделиться контактом' }}</span>
        </button>

        <p v-if="!userContact.phone_number" class="text-xs text-tg-hint mt-2 text-center">
          Для оформления заказа нам нужен ваш номер телефона для связи
        </p>
      </div>

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
        :disabled="submitting || !userContact.phone_number"
        class="w-full btn-primary text-lg py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Оформление...
        </span>
        <span v-else>Подтвердить заказ</span>
      </button>

      <p v-if="!userContact.phone_number" class="text-xs text-tg-hint text-center -mt-2">
        Сначала поделитесь контактом выше ☝️
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAppStore } from '@/stores/app'
import { api } from '@/utils/supabase'
import { formatPrice, hapticFeedback, showAlert, getUserData, requestContact } from '@/utils/telegram'
import { debugLogger } from '@/utils/debug'

const router = useRouter()
const cartStore = useCartStore()
const appStore = useAppStore()

const form = ref({
  comment: '',
  paymentMethod: 'cash'
})

const submitting = ref(false)
const requestingContact = ref(false)
const userContact = ref({
  phone_number: null,
  first_name: null,
  last_name: null,
  user_id: null
})

const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)

onMounted(() => {
  if (cartStore.isEmpty) {
    router.push('/')
    return
  }

  // Пытаемся получить данные пользователя из Telegram
  const telegramUser = getUserData()
  if (telegramUser) {
    userContact.value = {
      phone_number: telegramUser.phone_number,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      user_id: telegramUser.id
    }
  }
})

const goBack = () => {
  hapticFeedback('light')
  router.back()
}

const requestUserContact = async () => {
  if (requestingContact.value) return

  try {
    requestingContact.value = true
    hapticFeedback('light')

    const contact = await requestContact()
    console.log('Contact received:', contact)

    userContact.value = {
      phone_number: contact.phone_number,
      first_name: contact.first_name || userContact.value.first_name,
      last_name: contact.last_name || userContact.value.last_name,
      user_id: contact.user_id || userContact.value.user_id
    }

    hapticFeedback('success')
  } catch (error) {
    console.error('Error requesting contact:', error)
    hapticFeedback('error')

    if (!error.message?.includes('отменен')) {
      showAlert('Не удалось получить контакт. Попробуйте еще раз.')
    }
  } finally {
    requestingContact.value = false
  }
}

const submitOrder = async () => {
  if (submitting.value) return

  debugLogger.log('submitOrder called')

  // Проверяем наличие контактных данных
  if (!userContact.value.phone_number) {
    debugLogger.error('No phone number provided')
    hapticFeedback('error')
    showAlert('Пожалуйста, поделитесь своим контактом для оформления заказа')
    return
  }

  try {
    submitting.value = true
    hapticFeedback('medium')

    // Получаем данные пользователя из Telegram
    const telegramUser = getUserData()
    debugLogger.log('Telegram user data:', telegramUser)
    debugLogger.log('User contact data:', userContact.value)

    if (!telegramUser || !telegramUser.id) {
      debugLogger.error('No Telegram user data available', {
        telegramUser,
        hasTelegramWebApp: !!window.Telegram?.WebApp,
        initDataLength: window.Telegram?.WebApp?.initData?.length || 0
      })

      // Показываем подробное сообщение об ошибке
      const isDev = import.meta.env.DEV
      let errorMsg = 'Пожалуйста, откройте приложение через Telegram бота (используйте inline кнопку "🍹 Открыть меню")'

      if (isDev) {
        errorMsg += '\n\nДля отладки: откройте приложение с параметром ?debug=1'
      }

      throw new Error(errorMsg)
    }

    // Создаем заказ с telegram_id и контактными данными
    const orderData = {
      telegram_user_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      user_first_name: userContact.value.first_name || telegramUser.first_name || null,
      user_last_name: userContact.value.last_name || telegramUser.last_name || null,
      phone_number: userContact.value.phone_number,
      total_amount: cartTotal.value,
      comment: form.value.comment || null,
      payment_method: form.value.paymentMethod,
      status: 'pending'
    }

    debugLogger.log('Creating order with data:', orderData)
    const order = await api.createOrder(orderData)
    debugLogger.log('Order created:', order)

    // Создаем позиции заказа
    const orderItems = cartStore.items.map(item => ({
      juice_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    debugLogger.log('Creating order items:', orderItems)
    await api.createOrderItems(order.id, orderItems)

    // Очищаем корзину
    cartStore.clearCart()

    hapticFeedback('success')
    showAlert('Заказ успешно оформлен! Ожидайте звонка для подтверждения.')

    debugLogger.log('Order completed successfully')

    // Переходим на главную
    router.push('/')

  } catch (error) {
    debugLogger.error('Error submitting order', error)
    hapticFeedback('error')

    // Более информативное сообщение об ошибке
    let errorMessage = error.message || 'Произошла неизвестная ошибка'

    if (error.message?.includes('Telegram')) {
      errorMessage = error.message
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Ошибка сети. Проверьте подключение к интернету'
    }

    showAlert(`Ошибка при оформлении заказа:\n\n${errorMessage}`)
  } finally {
    submitting.value = false
  }
}
</script>
