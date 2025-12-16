<template>
  <div class="checkout-view">
    <!-- Заголовок -->
    <AppHeader
      title="Оформление заказа"
      show-back
    />

    <!-- Контент -->
    <div class="checkout-view__content">
      <!-- Контактные данные -->
      <BaseCard class="checkout-view__section">
        <template #header>
          <h3 class="section-title">Контактные данные</h3>
        </template>

        <div v-if="userContact.phone_number" class="space-y-3">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>{{ userContact.first_name }} {{ userContact.last_name }}</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>{{ userContact.phone_number }}</span>
          </div>
        </div>

        <BaseButton
          v-else
          size="large"
          block
          :loading="requestingContact"
          @click="requestUserContact"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
          Поделиться контактом
        </BaseButton>

        <div v-if="!userContact.phone_number" class="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-700">Для оформления заказа нужен ваш номер телефона</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Комментарий к заказу -->
      <BaseCard class="checkout-view__section">
        <template #header>
          <h3 class="section-title">Комментарий к заказу</h3>
        </template>

        <textarea
          v-model="form.comment"
          placeholder="Дополнительные пожелания (необязательно)"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        ></textarea>
      </BaseCard>

      <!-- Способ оплаты -->
      <BaseCard class="checkout-view__section">
        <template #header>
          <h3 class="section-title">Способ оплаты</h3>
        </template>

        <div class="space-y-3">
          <label class="flex items-center">
            <input 
              type="radio" 
              v-model="form.paymentMethod" 
              value="cash"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span class="ml-2">Наличные при получении</span>
          </label>
          <label class="flex items-center">
            <input 
              type="radio" 
              v-model="form.paymentMethod" 
              value="card"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span class="ml-2">Картой при получении</span>
          </label>
        </div>
      </BaseCard>

      <!-- Итого -->
      <BaseCard class="checkout-view__summary" color="secondary">
        <template #header>
          <h3 class="section-title">Ваш заказ</h3>
        </template>

        <div class="order-summary">
          <div class="order-summary__row">
            <span>Товаров:</span>
            <span>{{ cartCount }}</span>
          </div>
          <hr class="my-3 border-gray-200" />
          <div class="order-summary__row order-summary__total">
            <span>Итого:</span>
            <span>{{ formatPrice(cartTotal) }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- Кнопка подтверждения -->
      <BaseButton
        color="primary"
        size="large"
        block
        :loading="submitting"
        :disabled="!userContact.phone_number"
        @click="submitOrder"
      >
        <template v-if="submitting">
          Оформляем заказ...
        </template>
        <template v-else>
          Подтвердить заказ
        </template>
      </BaseButton>

      <div v-if="!userContact.phone_number" class="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">Сначала поделитесь контактом выше ☝️</p>
          </div>
        </div>
      </div>
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

// Импорт компонентов
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const cartStore = useCartStore()
const appStore = useAppStore()

// Form data
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

// Computed
const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)

// Methods
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

<style scoped>
.checkout-view {
  min-height: 100vh;
  background-color: #ffffff;
}

.checkout-view__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkout-view__section {
  /* Card styling handled by BaseCard */
}

.checkout-view__summary {
  background-color: var(--va-background-secondary);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  padding-bottom: 8px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-info__item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.payment-option {
  margin-bottom: 8px;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-summary__total {
  font-size: 18px;
  font-weight: 700;
  color: var(--va-primary);
}

.mr-2 {
  margin-right: 8px;
}

.mt-3 {
  margin-top: 12px;
}
</style>