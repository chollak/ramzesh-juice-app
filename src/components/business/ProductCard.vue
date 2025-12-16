<template>
  <BaseCard
    :image="product.image_url"
    :image-alt="product.name"
    clickable
    class="relative"
    @click="$emit('click', product)"
  >
    <!-- Бейдж с количеством в корзине -->
    <div v-if="cartQuantity > 0" class="absolute top-3 right-3 z-10 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
      {{ cartQuantity }}
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ product.name }}</h3>
      <p class="text-sm text-gray-600 line-clamp-2">{{ product.description }}</p>
      
      <div class="flex flex-col gap-2">
        <!-- Объем -->
        <span class="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md w-fit">
          {{ product.volume_ml }} мл
        </span>
        
        <!-- Ингредиенты -->
        <div v-if="product.ingredients?.length" class="flex flex-wrap gap-1">
          <span
            v-for="ingredient in product.ingredients.slice(0, 3)"
            :key="ingredient"
            class="inline-flex items-center px-2 py-1 border border-blue-200 text-blue-800 text-xs font-medium rounded-md"
          >
            {{ ingredient }}
          </span>
        </div>
      </div>

      <!-- Футер с ценой и кнопками -->
      <div class="flex justify-between items-center mt-auto">
        <span class="text-xl font-bold text-blue-600">{{ formatPrice(product.price) }}</span>
        
        <!-- Кнопка добавления в корзину -->
        <div v-if="cartQuantity === 0">
          <BaseButton
            size="small"
            @click.stop="addToCart"
          >
            В корзину
          </BaseButton>
        </div>
        
        <!-- Кнопки изменения количества -->
        <div v-else class="flex items-center gap-3" @click.stop>
          <BaseButton
            variant="ghost"
            size="small"
            @click="decrementQuantity"
          >
            −
          </BaseButton>
          <span class="font-semibold text-center min-w-[20px]">{{ cartQuantity }}</span>
          <BaseButton
            variant="ghost"
            size="small"
            @click="incrementQuantity"
          >
            +
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils/telegram'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const cartStore = useCartStore()

const cartQuantity = computed(() => {
  const item = cartStore.getItem(props.product.id)
  return item ? item.quantity : 0
})

const addToCart = () => {
  cartStore.addToCart(props.product)
}

const incrementQuantity = () => {
  cartStore.incrementQuantity(props.product.id)
}

const decrementQuantity = () => {
  cartStore.decrementQuantity(props.product.id)
}
</script>

