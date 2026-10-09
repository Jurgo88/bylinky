<script setup lang="ts">
const supabase = useSupabaseClient()

const { data } = await useAsyncData('home', async () => {
  const [page, novinky] = await Promise.all([
    supabase.from('pages').select('body_md').eq('slug', 'uvod').maybeSingle(),
    supabase
      .from('products')
      .select(`${PRODUCT_CARD_SELECT}, product_tags!inner(tags!inner(slug))`)
      .eq('product_tags.tags.slug', 'novinka')
      .order('updated_at', { ascending: false })
      .limit(12),
  ])
  return { intro: page.data?.body_md ?? '', novinky: (novinky.data ?? []).map(toCard) }
})
</script>

<template>
  <section class="prose" v-html="renderMarkdown(data?.intro)" />

  <h2>Novinky</h2>
  <div class="grid">
    <ProductCard v-for="p in data?.novinky" :key="p.slug" :product="p" />
  </div>
</template>
