<template>
  <va-card
    class="base-card"
    :class="{ 'base-card--clickable': clickable }"
    :color="color"
    :stripe="stripe"
    :stripe-color="stripeColor"
    @click="handleClick"
  >
    <va-card-block v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </va-card-block>

    <va-card-block v-if="image" class="base-card__image">
      <img 
        :src="image" 
        :alt="imageAlt || 'Card image'"
        class="base-card__img"
        loading="lazy"
      >
    </va-card-block>

    <va-card-content class="base-card__content">
      <slot />
    </va-card-content>

    <va-card-actions v-if="$slots.actions" class="base-card__actions">
      <slot name="actions" />
    </va-card-actions>
  </va-card>
</template>

<script setup>
import { hapticFeedback } from '@/utils/telegram'

defineProps({
  color: {
    type: String,
    default: 'backgroundPrimary'
  },
  stripe: {
    type: Boolean,
    default: false
  },
  stripeColor: {
    type: String,
    default: 'primary'
  },
  clickable: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: undefined
  },
  imageAlt: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (event.currentTarget.classList.contains('base-card--clickable')) {
    hapticFeedback('light')
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.base-card--clickable {
  cursor: pointer;
}

.base-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.base-card--clickable:active {
  transform: translateY(0);
}

.base-card__header {
  padding: 16px 16px 0;
}

.base-card__image {
  padding: 0;
  overflow: hidden;
}

.base-card__img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.base-card__content {
  padding: 16px;
}

.base-card__actions {
  padding: 0 16px 16px;
}
</style>