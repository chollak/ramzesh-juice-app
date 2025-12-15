import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { initEruda } from './utils/debug'

// Инициализируем Eruda для отладки в Telegram
// Будет доступно если добавить ?debug=1 к URL или в режиме разработки
initEruda()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
