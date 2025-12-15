import { Telegraf } from 'telegraf'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Middleware
import { authMiddleware, adminMiddleware } from './middleware/auth.js'
import { rateLimitMiddleware, callbackRateLimitMiddleware } from './middleware/rateLimit.js'

// Handlers
import { handleStart, handleHelp, handleUnknown } from './handlers/start.js'
import { handleMyOrders, handleContacts, handleAbout, handleReview, handleReviewText, handleOrderSearch } from './handlers/orders.js'
import { 
  handleAdmin, 
  handleAdminStats, 
  handleAdminOrders, 
  handleOrderManagement,
  handleAdminMenu,
  handleAdminUsers,
  handleBroadcast,
  handleBroadcastText
} from './handlers/admin.js'

// Utils
import { handleError, logUserAction } from './utils/helpers.js'

// Загружаем переменные окружения
dotenv.config()

// Инициализация
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const MINI_APP_URL = process.env.TELEGRAM_MINI_APP_URL
const ADMIN_IDS = process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => parseInt(id)) || []

console.log('🤖 Telegram Bot starting...')
console.log(`📱 Mini App URL: ${MINI_APP_URL}`)
console.log(`👑 Admin IDs: ${ADMIN_IDS.join(', ')}`)

// ========================
// MIDDLEWARE
// ========================

// Общие middleware
bot.use(authMiddleware(supabase, ADMIN_IDS))
bot.use(rateLimitMiddleware({ max: 30, windowMs: 60000 })) // 30 сообщений в минуту
bot.use(callbackRateLimitMiddleware({ max: 10, windowMs: 10000 })) // 10 callback в 10 секунд

// ========================
// КОМАНДЫ
// ========================

// Основные команды
bot.command('start', handleStart(MINI_APP_URL))
bot.command('help', handleHelp())

// Админские команды
bot.command('admin', adminMiddleware(ADMIN_IDS), handleAdmin())
bot.command('stats', adminMiddleware(ADMIN_IDS), handleAdminStats(supabase))
bot.command('users', adminMiddleware(ADMIN_IDS), handleAdminUsers(supabase))
bot.command('broadcast', adminMiddleware(ADMIN_IDS), handleBroadcast(supabase, bot))

// ========================
// CALLBACK QUERIES (INLINE КНОПКИ)
// ========================

// Админские callback
bot.action('admin_stats', adminMiddleware(ADMIN_IDS), handleAdminStats(supabase))
bot.action('admin_orders', adminMiddleware(ADMIN_IDS), handleAdminOrders(supabase))
bot.action('admin_menu', adminMiddleware(ADMIN_IDS), handleAdminMenu(MINI_APP_URL))
bot.action('admin_users', adminMiddleware(ADMIN_IDS), handleAdminUsers(supabase))

// Управление заказами
bot.action(/^order_(confirm|preparing|delivering|completed|cancel)_(.+)$/, 
  adminMiddleware(ADMIN_IDS), 
  handleOrderManagement(supabase, bot)
)

// Обработка callback без действий (например, для номеров страниц)
bot.action('noop', async (ctx) => {
  await ctx.answerCbQuery()
})

// ========================
// ТЕКСТОВЫЕ СООБЩЕНИЯ
// ========================

// Быстрые команды из клавиатуры
bot.hears('📋 Мои заказы', handleMyOrders(supabase))
bot.hears('📞 Контакты', handleContacts())
bot.hears('ℹ️ О нас', handleAbout())
bot.hears('⭐ Оставить отзыв', handleReview())

// Обработка отзывов
bot.on('text', handleReviewText())

// Обработка рассылки (только для админов)
bot.on('text', adminMiddleware(ADMIN_IDS), handleBroadcastText(supabase, bot))

// Поиск заказов по номеру
bot.on('text', handleOrderSearch(supabase))

// ========================
// ОБРАБОТКА ОШИБОК
// ========================

// Глобальная обработка ошибок
bot.catch(async (err, ctx) => {
  console.error('🚨 Global bot error:', err)
  
  // Логируем контекст ошибки
  const errorInfo = {
    error: err.message,
    userId: ctx.from?.id,
    username: ctx.from?.username,
    updateType: ctx.updateType,
    timestamp: new Date().toISOString()
  }
  
  console.error('Error context:', errorInfo)
  
  try {
    await ctx.reply('😔 Произошла неожиданная ошибка. Наши разработчики уже в курсе!')
  } catch (replyError) {
    console.error('Failed to send error message:', replyError)
  }
})

// Неизвестные команды
bot.on('message', handleUnknown())

// ========================
// ЗАПУСК БОТА
// ========================

const startBot = async () => {
  try {
    // Проверяем подключение к Supabase
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      throw error
    }
    
    console.log('✅ Supabase connected successfully')
    
    // Запускаем бота
    await bot.launch()
    console.log('🚀 Bot started successfully!')
    
    // Уведомляем админов о запуске
    for (const adminId of ADMIN_IDS) {
      try {
        await bot.telegram.sendMessage(
          adminId,
          '🤖 *Бот запущен!*\n\n' +
          `📅 ${new Date().toLocaleString('ru-RU')}\n` +
          '✅ Все системы работают нормально.',
          { parse_mode: 'Markdown' }
        )
      } catch (notifyError) {
        console.warn(`Failed to notify admin ${adminId}:`, notifyError.message)
      }
    }
    
  } catch (error) {
    console.error('💥 Failed to start bot:', error)
    process.exit(1)
  }
}

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`)
  
  bot.stop(signal).then(() => {
    console.log('✅ Bot stopped successfully')
    process.exit(0)
  }).catch((error) => {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))

// Обработка необработанных исключений
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error)
  shutdown('UNCAUGHT_EXCEPTION')
})

// Запускаем бота
startBot()