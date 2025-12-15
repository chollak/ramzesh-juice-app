// Утилиты для работы с Telegram Mini Apps API

export const tg = window.Telegram?.WebApp

export const initTelegramApp = () => {
  if (!tg) {
    console.warn('Telegram WebApp is not available')
    return null
  }

  // Инициализируем приложение
  tg.ready()
  
  // Разворачиваем на весь экран
  tg.expand()
  
  // Включаем главную кнопку
  tg.MainButton.setText('Оформить заказ')
  tg.MainButton.hide()
  
  return tg
}

export const getUserData = () => {
  if (!tg) return null
  
  return {
    id: tg.initDataUnsafe?.user?.id,
    first_name: tg.initDataUnsafe?.user?.first_name,
    last_name: tg.initDataUnsafe?.user?.last_name,
    username: tg.initDataUnsafe?.user?.username,
    language_code: tg.initDataUnsafe?.user?.language_code,
  }
}

export const setMainButton = (text, onClick, show = true) => {
  if (!tg) return
  
  tg.MainButton.setText(text)
  tg.MainButton.onClick(onClick)
  
  if (show) {
    tg.MainButton.show()
  } else {
    tg.MainButton.hide()
  }
}

export const showMainButton = (text, onClick) => {
  setMainButton(text, onClick, true)
}

export const hideMainButton = () => {
  if (!tg) return
  tg.MainButton.hide()
}

export const showBackButton = (onClick) => {
  if (!tg) return
  
  tg.BackButton.onClick(onClick)
  tg.BackButton.show()
}

export const hideBackButton = () => {
  if (!tg) return
  tg.BackButton.hide()
}

export const showAlert = (message) => {
  if (!tg) {
    alert(message)
    return
  }
  
  tg.showAlert(message)
}

export const showConfirm = (message, callback) => {
  if (!tg) {
    callback(confirm(message))
    return
  }
  
  tg.showConfirm(message, callback)
}

export const hapticFeedback = (type = 'medium') => {
  if (!tg?.HapticFeedback) return
  
  switch (type) {
    case 'light':
      tg.HapticFeedback.impactOccurred('light')
      break
    case 'medium':
      tg.HapticFeedback.impactOccurred('medium')
      break
    case 'heavy':
      tg.HapticFeedback.impactOccurred('heavy')
      break
    case 'success':
      tg.HapticFeedback.notificationOccurred('success')
      break
    case 'error':
      tg.HapticFeedback.notificationOccurred('error')
      break
    case 'warning':
      tg.HapticFeedback.notificationOccurred('warning')
      break
    default:
      tg.HapticFeedback.impactOccurred('medium')
  }
}

export const closeApp = () => {
  if (!tg) return
  tg.close()
}

export const openLink = (url) => {
  if (!tg) {
    window.open(url, '_blank')
    return
  }
  
  tg.openLink(url)
}

export const openTelegramLink = (url) => {
  if (!tg) {
    window.open(url, '_blank')
    return
  }
  
  tg.openTelegramLink(url)
}

// Получить цвета темы Telegram
export const getThemeParams = () => {
  if (!tg) return null
  
  return tg.themeParams
}

// Проверка, запущено ли приложение в Telegram
export const isTelegramApp = () => {
  return !!tg
}

// Форматирование цены
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0
  }).format(price)
}

// Форматирование даты
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Форматирование даты для заказа
export const formatOrderDate = (date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
