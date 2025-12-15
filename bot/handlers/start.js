import { MESSAGES } from '../utils/messages.js'
import { createMiniAppKeyboard, createMainKeyboard } from '../utils/keyboards.js'
import { logUserAction, handleError, getTimeBasedGreeting } from '../utils/helpers.js'

/**
 * Обработчик команды /start
 */
export const handleStart = (miniAppUrl) => {
  return async (ctx) => {
    try {
      const user = ctx.from
      const firstName = user.first_name || 'друг'
      const isNewUser = ctx.state?.isNewUser

      logUserAction(ctx, 'START_COMMAND', { isNewUser })

      // Приветствие с учетом времени
      const greeting = getTimeBasedGreeting()
      
      let welcomeMessage = `${greeting}, ${firstName}! 👋\n\n`
      
      if (isNewUser) {
        welcomeMessage += MESSAGES.WELCOME(firstName)
      } else {
        welcomeMessage += `Рады видеть вас снова! 🍹\n\n`
        welcomeMessage += `Нажмите кнопку ниже, чтобы открыть каталог:`
      }

      // Отправляем сообщение с inline кнопкой для WebApp
      await ctx.reply(
        welcomeMessage,
        createMiniAppKeyboard(miniAppUrl)
      )

      // Отправляем основную клавиатуру
      await ctx.reply(
        '📱 Также вы можете воспользоваться быстрыми командами:',
        createMainKeyboard()
      )

      // Уведомление о рабочих часах в нерабочее время
      const hours = new Date().getHours()
      if (hours < 9 || hours >= 21) {
        await ctx.reply(
          '🕐 *Обратите внимание:*\nНаш магазин работает с 9:00 до 21:00.\n' +
          'Заказы, оформленные сейчас, будут обработаны в рабочее время.',
          { parse_mode: 'Markdown' }
        )
      }

      // Для новых пользователей показываем дополнительную информацию
      if (isNewUser) {
        setTimeout(async () => {
          await ctx.reply(
            '💡 *Полезная информация:*\n\n' +
            '🍹 У нас более 50 видов натуральных соков\n' +
            '🚚 Доставка по городу 30-60 минут\n' +
            '💳 Оплата наличными или картой при получении\n' +
            '📞 Поддержка клиентов 24/7\n\n' +
            'Если возникнут вопросы - пишите в любое время!',
            { parse_mode: 'Markdown' }
          )
        }, 2000)
      }

    } catch (error) {
      console.error('Error in start handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик команды /help
 */
export const handleHelp = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'HELP_COMMAND')

      await ctx.reply(
        MESSAGES.HELP,
        { 
          parse_mode: 'Markdown',
          ...createMainKeyboard()
        }
      )
    } catch (error) {
      console.error('Error in help handler:', error)
      await handleError(ctx, error)
    }
  }
}

/**
 * Обработчик неизвестных команд
 */
export const handleUnknown = () => {
  return async (ctx) => {
    try {
      logUserAction(ctx, 'UNKNOWN_COMMAND', { text: ctx.message?.text })

      const suggestions = [
        '• /start - перезапустить бота',
        '• /help - посмотреть справку',
        '• "📋 Мои заказы" - история заказов',
        '• "📞 Контакты" - наши контакты'
      ]

      await ctx.reply(
        `❓ Не понимаю эту команду.\n\n` +
        `Попробуйте:\n${suggestions.join('\n')}\n\n` +
        `Или используйте кнопку "🍹 Открыть меню" для заказа.`,
        createMainKeyboard()
      )
    } catch (error) {
      console.error('Error in unknown handler:', error)
      await handleError(ctx, error)
    }
  }
}