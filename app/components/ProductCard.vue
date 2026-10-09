<script setup lang="ts">
defineProps<{
  product: {
    slug: string
    name: string
    image?: string | null
    priceFrom?: number | null
    hasVariants?: boolean
  }
}>()
const media = useMedia()
</script>

<template>
  <NuxtLink :to="`/produkty/${product.slug}/`" class="card">
    <div class="img">
      <img v-if="product.image" :src="media(product.image)" :alt="product.name" loading="lazy" width="400" height="400" />
    </div>
    <h3>{{ product.name }}</h3>
    <p class="price">
      <span v-if="product.hasVariants" class="muted">od </span>{{ formatPrice(product.priceFrom) }}
    </p>
  </NuxtLink>
</template>

<style scoped>
.card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid var(--c-border); border-radius: var(--radius); padding: 12px; }
.img { aspect-ratio: 1; background: #f0eee6; border-radius: 8px; overflow: hidden; }
.img img { width: 100%; height: 100%; object-fit: cover; }
h3 { font-size: 1rem; margin: 10px 0 4px; }
.price { margin: 0; font-weight: 600; }
</style>
