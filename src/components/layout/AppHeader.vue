<template>
  <header class="app-header">
    <div class="app-header__content">
      <div v-if="showBack" class="app-header__back">
        <BaseButton
          preset="plain"
          color="primary"
          size="small"
          @click="goBack"
        >
          <va-icon name="arrow_back" />
        </BaseButton>
      </div>
      
      <div class="app-header__title">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="app-header__subtitle">{{ subtitle }}</p>
      </div>
      
      <div class="app-header__actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { hapticFeedback } from '@/utils/telegram'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: undefined
  },
  showBack: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const goBack = () => {
  hapticFeedback('light')
  router.back()
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--va-background-secondary);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-header__content {
  display: flex;
  align-items: center;
  padding: 16px;
  min-height: 60px;
}

.app-header__back {
  margin-right: 12px;
}

.app-header__title {
  flex: 1;
}

.app-header__title h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}

.app-header__subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--va-text-secondary);
  line-height: 1.2;
}

.app-header__actions {
  margin-left: 12px;
}
</style>