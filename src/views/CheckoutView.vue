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
      <!-- Форма -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-tg-text mb-4">Контактные данные</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-tg-hint mb-1">Телефон</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="+998 90 123 45 67"
              class="input-field"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm text-tg-hint mb-1">Имя</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ваше имя"
              class="input-field"
              required
            >
          </div>
        </div>
      </div>

      <!-- Адрес доставки -->
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h2 class="font-bold text-tg-text mb-4">Адрес доставки</h2>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-tg-hint mb-1">Адрес</label>
            <input
              v-model="form.address"
              type="text"
              placeholder="Улица, дом"
              class="input-field"
              required
            >
          </div>
          
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-sm text-tg-hint mb-1">Подъезд</label>
              <input
                v-model="form.entrance"
                type="text"
                placeholder="1"
                class="input-field"
              >
            </div>
            <div>
              <label class="block text-sm text-tg-hint mb-1">Этаж</label>
              <input
                v-model="form.floor"
                type="text"
                placeholder="5"
                class="input-field"
              >
            </div>
            <div>
              <label class="block text-sm text-tg-hint mb-1">Квартира</label>
              <input
                v-model="form.apartment"
                type="text"
                placeholder="42"
                class="input-field"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm text-tg-hint mb-1">Комментарий</label>
            <textarea
              v-model="form.comment"
              placeholder="Комментарий к заказу"
              class="input-field resize-none"
              rows="3"
            ></textarea>
          </div>
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
        :disabled="!isFormValid || submitting"
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
  name: '',
  phone: '',
  address: '',
  apartment: '',
  entrance: '',
  floor: '',
  comment: '',
  paymentMethod: 'cash'
})

const submitting = ref(false)

const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)

const isFormValid = computed(() => {
  return form.value.name && 
         form.value.phone && 
         form.value.address
})

onMounted(() => {
  if (cartStore.isEmpty) {
    router.push('/')
    return
  }
  
  // Предзаполняем имя из Telegram
  const telegramUser = getUserData()
  if (telegramUser) {
    form.value.name = telegramUser.first_name || ''
  }
})

const goBack = () => {
  hapticFeedback('light')
  router.back()
}

const submitOrder = async () => {
  if (!isFormValid.value || submitting.value) return
  
  try {
    submitting.value = true
    hapticFeedback('medium')
    
    // Формируем адрес
    let fullAddress = form.value.address
    if (form.value.apartment) fullAddress += `, кв. ${form.value.apartment}`
    if (form.value.entrance) fullAddress += `, подъезд ${form.value.entrance}`
    if (form.value.floor) fullAddress += `, этаж ${form.value.floor}`
    
    // Создаем заказ
    const orderData = {
      user_id: appStore.user.id,
      total_amount: cartTotal.value,
      delivery_address_text: fullAddress,
      phone_number: form.value.phone,
      comment: form.value.comment || null,
      payment_method: form.value.paymentMethod,
      status: 'pending'
    }
    
    const order = await api.createOrder(orderData)
    
    // Создаем позиции заказа
    await api.createOrderItems(order.id, cartStore.items.map(item => ({
      juice_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })))
    
    // Очищаем корзину
    cartStore.clearCart()
    
    hapticFeedback('success')
    showAlert('Заказ успешно оформлен! Ожидайте звонка для подтверждения.')
    
    // Переходим на страницу заказов
    router.push(`/orders/${order.id}`)
    
  } catch (error) {
    console.error('Error submitting order:', error)
    hapticFeedback('error')
    showAlert('Ошибка при оформлении заказа. Попробуйте еще раз.')
  } finally {
    submitting.value = false
  }
}
</script>
