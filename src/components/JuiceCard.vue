<template>
  <div class="juice-card cursor-pointer" @click="handleClick">
    <div class="relative">
      <img 
        :src="juice.image_url" 
        :alt="juice.name"
        class="w-full h-48 object-cover"
        loading="lazy"
      >
      <div 
        v-if="cartQuantity > 0" 
        class="absolute top-3 right-3 bg-tg-button text-tg-button-text w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg"
      >
        {{ cartQuantity }}
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-semibold text-tg-text mb-1">{{ juice.name }}</h3>
      <p class="text-sm text-tg-hint mb-3 line-clamp-2">{{ juice.description }}</p>
      
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs text-tg-hint">{{ juice.volume_ml }} мл</span>
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="ingredient in juice.ingredients?.slice(0, 3)" 
            :key="ingredient"
            class="text-xs bg-tg-secondary-bg px-2 py-1 rounded-full"
          >
            {{ ingredient }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-xl font-bold text-tg-text">{{ formatPrice(juice.price) }}</span>
        
        <button
          v-if="cartQuantity === 0"
          @click.stop="addToCart"
          class="bg-tg-button text-tg-button-text px-4 py-2 rounded-lg font-medium transition-all active:scale-95"
        >
          В корзину
        </button>
        
        <div 
          v-else 
          class="flex items-center gap-2"
          @click.stop
        >
          <button
            @click="decrementQuantity"
            class="bg-tg-secondary-bg w-8 h-8 rounded-lg flex items-center justify-center font-bold text-tg-text transition-all active:scale-90"
          >
            −
          </button>
          <span class="font-semibold text-tg-text min-w-[20px] text-center">{{ cartQuantity }}</span>
          <button
            @click="incrementQuantity"
            class="bg-tg-button text-tg-button-text w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all active:scale-90"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/telegram'

const props = defineProps({
  juice: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const cartStore = useCartStore()

const cartQuantity = computed(() => {
  const item = cartStore.getItem(props.juice.id)
  return item ? item.quantity : 0
})

const handleClick = () => {
  emit('click', props.juice)
}

const addToCart = () => {
  cartStore.addToCart(props.juice)
}

const incrementQuantity = () => {
  cartStore.incrementQuantity(props.juice.id)
}

const decrementQuantity = () => {
  cartStore.decrementQuantity(props.juice.id)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
