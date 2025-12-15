import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hapticFeedback } from '@/utils/telegram'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])

  // Computed
  const cartCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  const addToCart = (juice) => {
    const existingItem = items.value.find(item => item.id === juice.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: juice.id,
        name: juice.name,
        price: juice.price,
        image_url: juice.image_url,
        volume_ml: juice.volume_ml,
        quantity: 1
      })
    }
    
    hapticFeedback('light')
    saveToLocalStorage()
  }

  const removeFromCart = (juiceId) => {
    const index = items.value.findIndex(item => item.id === juiceId)
    
    if (index !== -1) {
      items.value.splice(index, 1)
      hapticFeedback('light')
      saveToLocalStorage()
    }
  }

  const updateQuantity = (juiceId, quantity) => {
    const item = items.value.find(item => item.id === juiceId)
    
    if (item) {
      if (quantity <= 0) {
        removeFromCart(juiceId)
      } else {
        item.quantity = quantity
        hapticFeedback('light')
        saveToLocalStorage()
      }
    }
  }

  const incrementQuantity = (juiceId) => {
    const item = items.value.find(item => item.id === juiceId)
    
    if (item) {
      item.quantity++
      hapticFeedback('light')
      saveToLocalStorage()
    }
  }

  const decrementQuantity = (juiceId) => {
    const item = items.value.find(item => item.id === juiceId)
    
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
        hapticFeedback('light')
      } else {
        removeFromCart(juiceId)
      }
      saveToLocalStorage()
    }
  }

  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  const getItem = (juiceId) => {
    return items.value.find(item => item.id === juiceId)
  }

  // Сохранение в localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('juice-cart', JSON.stringify(items.value))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }

  // Загрузка из localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('juice-cart')
      if (savedCart) {
        items.value = JSON.parse(savedCart)
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
    }
  }

  // Инициализация корзины при создании store
  loadFromLocalStorage()

  return {
    // State
    items,
    
    // Computed
    cartCount,
    cartTotal,
    isEmpty,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItem,
    loadFromLocalStorage
  }
})
