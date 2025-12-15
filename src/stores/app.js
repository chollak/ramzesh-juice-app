import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, authenticateWithTelegram } from '@/utils/supabase'
import { getUserData } from '@/utils/telegram'

export const useAppStore = defineStore('app', () => {
  // State
  const user = ref(null)
  const categories = ref([])
  const juices = ref([])
  const selectedCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  
  const filteredJuices = computed(() => {
    if (!selectedCategory.value) return juices.value
    return juices.value.filter(juice => juice.category_id === selectedCategory.value)
  })

  // Actions
  const initApp = async () => {
    try {
      loading.value = true
      
      // Получаем данные пользователя из Telegram
      const telegramUser = getUserData()
      
      if (telegramUser?.id) {
        // Аутентифицируем пользователя
        user.value = await authenticateWithTelegram(telegramUser)
      }
      
      // Загружаем категории и соки
      await Promise.all([
        loadCategories(),
        loadJuices()
      ])
      
      error.value = null
    } catch (err) {
      console.error('Error initializing app:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      categories.value = await api.getCategories()
    } catch (err) {
      console.error('Error loading categories:', err)
      throw err
    }
  }

  const loadJuices = async (categoryId = null) => {
    try {
      loading.value = true
      juices.value = await api.getJuices(categoryId)
    } catch (err) {
      console.error('Error loading juices:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const setCategory = (categoryId) => {
    selectedCategory.value = categoryId
  }

  const clearCategory = () => {
    selectedCategory.value = null
  }

  return {
    // State
    user,
    categories,
    juices,
    selectedCategory,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    filteredJuices,
    
    // Actions
    initApp,
    loadCategories,
    loadJuices,
    setCategory,
    clearCategory
  }
})
