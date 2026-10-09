<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const slug = route.params.slug as string

const { data } = await useAsyncData(`category-${slug}`, async () => {
  const { data: category } = await supabase.from('categories').select('id, name, description').eq('slug', slug).maybeSingle()
  if (!category) return null
  const { data: products } = await supabase
    .from('products')
    .select(`${PRODUCT_CARD_SELECT}, product_categories!inner(category_id, position)`)
    .eq('product_categories.category_id', category.id)
  const sorted = (products ?? []).sort(
    (a, b) => (a.product_categories[0]?.position ?? 999) - (b.product_categories[0]?.position ?? 999),
  )
  return { category, products: sorted.map(toCard) }
})

if (!data.value) throw createError({ statusCode: 404, statusMessage: 'Kategória neexistuje' })
useSeoMeta({ title: () => `${data.value?.category.name} | Bylinky spod Tatier` })
</script>

<template>
  <div v-if="data">
    <h1>{{ data.category.name }}</h1>
    <p v-if="data.category.description" class="muted">{{ data.category.description }}</p>
    <div class="grid">
      <ProductCard v-for="p in data.products" :key="p.slug" :product="p" />
    </div>
  </div>
</template>
