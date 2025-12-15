/**
 * Сервис для работы с пользователями
 */

export class UserService {
  constructor(supabase) {
    this.supabase = supabase
  }

  /**
   * Создает или обновляет пользователя
   */
  async createOrUpdateUser(telegramUser, adminIds = []) {
    try {
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single()

      const userData = {
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        is_admin: adminIds.includes(telegramUser.id)
      }

      if (!existingUser) {
        // Создаем нового пользователя
        const { data: newUser, error } = await this.supabase
          .from('users')
          .insert([userData])
          .select()
          .single()

        if (error) throw error
        return { user: newUser, isNew: true }
      } else {
        // Обновляем существующего пользователя
        const { data: updatedUser, error } = await this.supabase
          .from('users')
          .update(userData)
          .eq('telegram_id', telegramUser.id)
          .select()
          .single()

        if (error) throw error
        return { user: updatedUser, isNew: false }
      }
    } catch (error) {
      console.error('Error creating/updating user:', error)
      throw error
    }
  }

  /**
   * Получает пользователя по Telegram ID
   */
  async getUserByTelegramId(telegramId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  /**
   * Получает всех пользователей
   */
  async getAllUsers(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        users: data,
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        hasNext: offset + limit < count,
        hasPrev: page > 1
      }
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  /**
   * Получает статистику пользователей
   */
  async getUserStats() {
    try {
      // Общее количество пользователей
      const { count: totalUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Новые пользователи за сегодня
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count: newToday } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Новые пользователи за неделю
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { count: newThisWeek } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString())

      // Активные пользователи (сделавшие заказы)
      const { count: activeUsers } = await this.supabase
        .from('users')
        .select(`
          id,
          orders!inner(id)
        `, { count: 'exact', head: true })

      return {
        total: totalUsers || 0,
        newToday: newToday || 0,
        newThisWeek: newThisWeek || 0,
        active: activeUsers || 0
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  }

  /**
   * Получает пользователей для рассылки
   */
  async getUsersForBroadcast() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('telegram_id')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(user => user.telegram_id)
    } catch (error) {
      console.error('Error getting users for broadcast:', error)
      throw error
    }
  }

  /**
   * Блокирует/разблокирует пользователя
   */
  async toggleUserBlock(telegramId, isBlocked) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update({ is_blocked: isBlocked })
        .eq('telegram_id', telegramId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error toggling user block:', error)
      throw error
    }
  }
}