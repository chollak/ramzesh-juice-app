<template>
  <BaseCard
    :image="product.image_url"
    :image-alt="product.name"
    clickable
    class="product-card"
    @click="$emit('click', product)"
  >
    <template #header>
      <va-badge
        v-if="cartQuantity > 0"
        :text="cartQuantity"
        color="primary"
        class="product-card__badge"
      />
    </template>

    <div class="product-card__info">
      <h3 class="product-card__title">{{ product.name }}</h3>
      <p class="product-card__description">{{ product.description }}</p>
      
      <div class="product-card__details">
        <va-chip size="small" color="secondary" class="product-card__volume">
          {{ product.volume_ml }} мл
        </va-chip>
        
        <div v-if="product.ingredients?.length" class="product-card__ingredients">
          <va-chip
            v-for="ingredient in product.ingredients.slice(0, 3)"
            :key="ingredient"
            size="small"
            color="info"
            outline
          >
            {{ ingredient }}
          </va-chip>
        </div>
      </div>

      <div class="product-card__footer">
        <span class="product-card__price">{{ formatPrice(product.price) }}</span>
        
        <div v-if="cartQuantity === 0" class="product-card__add">
          <BaseButton
            size="small"
            @click.stop="addToCart"
          >
            В корзину
          </BaseButton>
        </div>
        
        <div v-else class="product-card__quantity" @click.stop>
          <BaseButton
            size="small"
            preset="plain"
            @click="decrementQuantity"
          >
            −
          </BaseButton>
          <span class="product-card__count">{{ cartQuantity }}</span>
          <BaseButton
            size="small"
            preset="plain"
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

<style scoped>
.product-card {
  position: relative;
}

.product-card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.product-card__info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.product-card__description {
  margin: 0;
  color: var(--va-text-secondary);
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-card__volume {
  align-self: flex-start;
}

.product-card__ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-card__price {
  font-size: 20px;
  font-weight: 700;
  color: var(--va-primary);
}

.product-card__quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-card__count {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
</style>