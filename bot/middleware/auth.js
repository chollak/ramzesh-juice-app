import { UserService } from '../services/userService.js'
import { logUserAction, handleError } from '../utils/helpers.js'

/**
 * Middleware для аутентификации пользователей
 */
export const authMiddleware = (supabase, adminIds = []) => {
  const userService = new UserService(supabase)

  return async (ctx, next) => {
    try {
      if (!ctx.from) {
        return // Пропускаем сообщения без пользователя
      }

      logUserAction(ctx, 'MESSAGE', {
        text: ctx.message?.text || ctx.callbackQuery?.data,
        chatType: ctx.chat?.type
      })

      // Создаем или обновляем пользователя в базе данных
      const { user, isNew } = await userService.createOrUpdateUser(ctx.from, adminIds)

      // Добавляем информацию о пользователе в контекст
      ctx.state.user = user
      ctx.state.isAdmin = adminIds.includes(ctx.from.id)
      ctx.state.isNewUser = isNew

      if (isNew) {
        console.log(`New user registered: ${ctx.from.first_name} (${ctx.from.id})`)
      }

      await next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Middleware для проверки прав администратора
 */
export const adminMiddleware = (adminIds = []) => {
  return async (ctx, next) => {
    try {
      const userId = ctx.from?.id

      if (!userId || !adminIds.includes(userId)) {
        await ctx.reply('У вас нет доступа к этой функции.')
        return
      }

      await next()
    } catch (error) {
      console.error('Admin middleware error:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Middleware для проверки блокировки пользователя
 */
export const blockMiddleware = () => {
  return async (ctx, next) => {
    try {
      const user = ctx.state?.user

      if (user?.is_blocked) {
        await ctx.reply('Ваш аккаунт заблокирован. Обратитесь к администратору.')
        return
      }

      await next()
    } catch (error) {
      console.error('Block middleware error:', error)
      await handleError(ctx, error)
    }
  }
}