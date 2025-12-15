<template>
  <va-button
    :color="color"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    :round="round"
    :preset="preset"
    @click="$emit('click', $event)"
  >
    <slot />
  </va-button>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'medium'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  preset: {
    type: String,
    default: undefined
  }
})

defineEmits(['click'])
</script>