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

        <div v-if="userContact.phone_number" class="contact-info">
          <div class="contact-info__item">
            <va-icon name="person" color="primary" />
            <span>{{ userContact.first_name }} {{ userContact.last_name }}</span>
          </div>
          <div class="contact-info__item">
            <va-icon name="phone" color="primary" />
            <span>{{ userContact.phone_number }}</span>
          </div>
        </div>

        <BaseButton
          v-else
          color="primary"
          size="large"
          block
          :loading="requestingContact"
          @click="requestUserContact"
        >
          <va-icon name="share" class="mr-2" />
          Поделиться контактом
        </BaseButton>

        <va-alert
          v-if="!userContact.phone_number"
          color="info"
          border="left"
          class="mt-3"
        >
          Для оформления заказа нужен ваш номер телефона
        </va-alert>
      </BaseCard>

      <!-- Комментарий к заказу -->
      <BaseCard class="checkout-view__section">
        <template #header>
          <h3 class="section-title">Комментарий к заказу</h3>
        </template>

        <va-textarea
          v-model="form.comment"
          placeholder="Дополнительные пожелания (необязательно)"
          :rows="3"
          autosize
        />
      </BaseCard>

      <!-- Способ оплаты -->
      <BaseCard class="checkout-view__section">
        <template #header>
          <h3 class="section-title">Способ оплаты</h3>
        </template>

        <va-radio
          v-model="form.paymentMethod"
          option="cash"
          label="Наличные при получении"
          class="payment-option"
        />
        <va-radio
          v-model="form.paymentMethod"
          option="card"
          label="Картой при получении"
          class="payment-option"
        />
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
          <va-divider />
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

      <va-alert
        v-if="!userContact.phone_number"
        color="warning"
        border="left"
        class="mt-3"
      >
        Сначала поделитесь контактом выше ☝️
      </va-alert>
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