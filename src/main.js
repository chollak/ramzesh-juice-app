import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuestic } from 'vuestic-ui'
import App from './App.vue'
import router from './router'
import 'vuestic-ui/css'
import './style.css'
import { initEruda } from './utils/debug'

// Инициализируем Eruda для отладки в Telegram
// Будет доступно если добавить ?debug=1 к URL или в режиме разработки
initEruda()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createVuestic({
  config: {
    colors: {
      primary: '#2481cc',
      secondary: '#f4f4f5',
      success: '#22c55e',
      info: '#3b82f6',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    icons: [], // Используем эмодзи вместо иконок для упрощения
  },
}))

app.mount('#app')
