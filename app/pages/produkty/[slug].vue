<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const media = useMedia()
const slug = route.params.slug as string

const { data: product } = await useAsyncData(`product-${slug}`, async () => {
  const { data } = await supabase
    .from('products')
    .select(
      `id, slug, name, description_md, seo_title, seo_description,
       categories:primary_category_id(slug, name),
       product_variants(id, size_label, packaging, price, compare_at_price, stock_qty, is_active, position),
       product_images(storage_path, alt, position)`,
    )
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return null
  return {
    ...data,
    product_variants: data.product_variants.filter((v) => v.is_active).sort((a, b) => a.position - b.position),
    product_images: [...data.product_images].sort((a, b) => a.position - b.position),
  }
})

if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Produkt neexistuje' })

const selectedId = ref(product.value.product_variants[0]?.id)
const selected = computed(() => product.value?.product_variants.find((v) => v.id === selectedId.value))
const activeImage = ref(0)
const mainImage = computed(() => product.value?.product_images[activeImage.value])

useSeoMeta({
  title: () => `${product.value?.seo_title || product.value?.name} | Bylinky spod Tatier`,
  description: () => product.value?.seo_description ?? undefined,
  ogImage: () => media(product.value?.product_images[0]?.storage_path) || undefined,
})
</script>

<template>
  <article v-if="product" class="product">
    <div class="gallery">
      <img
        v-if="mainImage"
        :src="media(mainImage.storage_path)"
        :alt="mainImage.alt ?? product.name"
        width="800"
        height="800"
      />
      <div v-if="product.product_images.length > 1" class="thumbs">
        <button v-for="(img, i) in product.product_images" :key="img.storage_path" :class="{ active: i === activeImage }" @click="activeImage = i">
          <img :src="media(img.storage_path)" :alt="''" loading="lazy" width="80" height="80" />
        </button>
      </div>
    </div>

    <div class="info">
      <NuxtLink v-if="product.categories" :to="`/kategoria/${product.categories.slug}/`" class="muted">{{ product.categories.name }}</NuxtLink>
      <h1>{{ product.name }}</h1>

      <label v-if="product.product_variants.length > 1" class="variant">
        Balenie
        <select v-model="selectedId">
          <option v-for="v in product.product_variants" :key="v.id" :value="v.id">
            {{ variantLabel(v) }} – {{ formatPrice(v.price) }}
          </option>
        </select>
      </label>

      <p class="price">
        {{ formatPrice(selected?.price) }}
        <s v-if="selected?.compare_at_price" class="muted">{{ formatPrice(selected.compare_at_price) }}</s>
      </p>
      <p v-if="selected?.stock_qty === 0" class="muted">Momentálne vypredané</p>
      <button class="btn" :disabled="selected?.stock_qty === 0" title="Košík zatiaľ nie je hotový">Do košíka</button>

      <div class="prose" v-html="renderMarkdown(product.description_md)" />
    </div>
  </article>
</template>

<style scoped>
.product { display: grid; gap: 32px; grid-template-columns: 1fr; }
@media (min-width: 860px) { .product { grid-template-columns: 1fr 1fr; } }
.gallery > img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius); background: #f0eee6; }
.thumbs { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.thumbs button { padding: 0; border: 2px solid transparent; border-radius: 8px; background: none; cursor: pointer; }
.thumbs button.active { border-color: var(--c-accent); }
.thumbs img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
.variant { display: grid; gap: 4px; margin: 12px 0; }
.variant select { padding: 8px; border-radius: 8px; border: 1px solid var(--c-border); font: inherit; }
.price { font-size: 1.5rem; font-weight: 700; margin: 8px 0; }
</style>
