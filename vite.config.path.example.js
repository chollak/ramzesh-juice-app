import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Раскомментируйте эту строку если деплоите на путь (например, yourdomain.com/juice-app)
  // base: '/juice-app/',
})
