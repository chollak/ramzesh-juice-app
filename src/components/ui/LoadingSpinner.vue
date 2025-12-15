<template>
  <div class="loading-spinner" :class="{ 'loading-spinner--centered': centered }">
    <va-progress-circle
      :size="size"
      :thickness="thickness"
      :color="color"
      indeterminate
    />
    <p v-if="text" class="loading-spinner__text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: Number,
    default: 40
  },
  thickness: {
    type: Number,
    default: 4
  },
  color: {
    type: String,
    default: 'primary'
  },
  text: {
    type: String,
    default: undefined
  },
  centered: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner--centered {
  justify-content: center;
  min-height: 200px;
}

.loading-spinner__text {
  margin: 0;
  color: var(--va-text-secondary);
  font-size: 14px;
}
</style>