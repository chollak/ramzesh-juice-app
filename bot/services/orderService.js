/**
 * Сервис для работы с заказами
 */

export class OrderService {
  constructor(supabase) {
    this.supabase = supabase
  }

  /**
   * Получает заказы пользователя
   */
  async getUserOrders(telegramId, limit = 10) {
    try {
      // Сначала получаем ID пользователя
      const { data: user } = await this.supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegramId)
        .single()

      if (!user) {
        return []
      }

      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return orders || []
    } catch (error) {
      console.error('Error getting user orders:', error)
      throw error
    }
  }

  /**
   * Получает заказ по ID
   */
  async getOrderById(orderId) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          ),
          users (
            telegram_id,
            first_name,
            username
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting order by ID:', error)
      throw error
    }
  }

  /**
   * Получает заказ по номеру
   */
  async getOrderByNumber(orderNumber) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          ),
          users (
            telegram_id,
            first_name,
            username
          )
        `)
        .eq('order_number', orderNumber)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting order by number:', error)
      throw error
    }
  }

  /**
   * Получает новые заказы (статус pending)
   */
  async getNewOrders(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          ),
          users (
            telegram_id,
            first_name,
            username,
            phone_number
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting new orders:', error)
      throw error
    }
  }

  /**
   * Обновляет статус заказа
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select(`
          *,
          users (
            telegram_id,
            first_name
          )
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  }

  /**
   * Получает статистику заказов
   */
  async getOrderStats() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const monthAgo = new Date(today)
      monthAgo.setDate(monthAgo.getDate() - 30)

      // Статистика за сегодня
      const { data: todayOrders, error: todayError } = await this.supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', today.toISOString())

      if (todayError) throw todayError

      const todayStats = {
        count: todayOrders?.length || 0,
        revenue: todayOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0
      }

      // Статистика за неделю
      const { data: weekOrders, error: weekError } = await this.supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', weekAgo.toISOString())

      if (weekError) throw weekError

      const weekStats = {
        count: weekOrders?.length || 0,
        revenue: weekOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0
      }

      // Статистика за месяц
      const { data: monthOrders, error: monthError } = await this.supabase
        .from('orders')
        .select('total_amount, status')
        .gte('created_at', monthAgo.toISOString())

      if (monthError) throw monthError

      const monthStats = {
        count: monthOrders?.length || 0,
        revenue: monthOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0
      }

      // Общая статистика
      const { count: totalCount } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      const { count: totalUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      return {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        total: {
          count: totalCount || 0,
          users: totalUsers || 0
        }
      }
    } catch (error) {
      console.error('Error getting order stats:', error)
      throw error
    }
  }

  /**
   * Получает заказы по статусу
   */
  async getOrdersByStatus(status, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          ),
          users (
            telegram_id,
            first_name,
            username
          )
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        orders: data || [],
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasNext: offset + limit < count,
        hasPrev: page > 1
      }
    } catch (error) {
      console.error('Error getting orders by status:', error)
      throw error
    }
  }

  /**
   * Поиск заказов
   */
  async searchOrders(query, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            juice_name,
            price
          ),
          users (
            telegram_id,
            first_name,
            username
          )
        `, { count: 'exact' })
        .or(`order_number.ilike.%${query}%,phone_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        orders: data || [],
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasNext: offset + limit < count,
        hasPrev: page > 1,
        query
      }
    } catch (error) {
      console.error('Error searching orders:', error)
      throw error
    }
  }

  /**
   * Добавляет комментарий к заказу
   */
  async addOrderComment(orderId, comment, userId) {
    try {
      const { data, error } = await this.supabase
        .from('order_comments')
        .insert([{
          order_id: orderId,
          comment: comment,
          user_id: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding order comment:', error)
      throw error
    }
  }
}