import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Функция для авторизации через Telegram
export const authenticateWithTelegram = async (telegramUser) => {
  try {
    // Проверяем или создаем пользователя в базе
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramUser.id)
      .single()

    if (!existingUser) {
      // Создаем нового пользователя
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          {
            telegram_id: telegramUser.id,
            username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
          }
        ])
        .select()
        .single()

      if (error) throw error
      return newUser
    }

    return existingUser
  } catch (error) {
    console.error('Error authenticating with Telegram:', error)
    throw error
  }
}

// Вспомогательные функции для работы с API
export const api = {
  // Категории
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  // Соки
  async getJuices(categoryId = null) {
    let query = supabase
      .from('juices')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('is_available', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query.order('name')
    
    if (error) throw error
    return data
  },

  async getJuiceById(id) {
    const { data, error } = await supabase
      .from('juices')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Адреса доставки
  async getAddresses(userId) {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createAddress(userId, addressData) {
    const { data, error } = await supabase
      .from('delivery_addresses')
      .insert([{ user_id: userId, ...addressData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Заказы
  async createOrder(orderData) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    if (orderError) throw orderError
    return order
  },

  async createOrderItems(orderId, items) {
    const orderItems = items.map(item => ({
      order_id: orderId,
      juice_id: item.juice_id,
      juice_name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (error) throw error
    return data
  },

  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          juices (
            name,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getOrderById(orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          juices (
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (error) throw error
    return data
  },

  // Админ функции
  async updateJuiceAvailability(juiceId, isAvailable) {
    const { data, error } = await supabase
      .from('juices')
      .update({ is_available: isAvailable })
      .eq('id', juiceId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateOrderStatus(orderId, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
