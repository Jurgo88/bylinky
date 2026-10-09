<script setup lang="ts">
const supabase = useSupabaseClient()
const media = useMedia()

const { data: articles } = await useAsyncData('articles', async () => {
  const { data } = await supabase
    .from('articles')
    .select('slug, title, excerpt, cover_image_path, published_at')
    .order('published_at', { ascending: false })
  return data ?? []
})

useSeoMeta({ title: 'Články | Bylinky spod Tatier' })
</script>

<template>
  <h1>Články</h1>
  <div class="grid">
    <NuxtLink v-for="a in articles" :key="a.slug" :to="`/clanky/${a.slug}/`" class="article">
      <img v-if="a.cover_image_path" :src="media(a.cover_image_path)" :alt="a.title" loading="lazy" width="400" height="260" />
      <h2>{{ a.title }}</h2>
      <p class="muted">{{ a.excerpt }}</p>
    </NuxtLink>
  </div>
</template>

<style scoped>
.article { text-decoration: none; color: inherit; }
.article img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: var(--radius); }
.article h2 { font-size: 1.15rem; margin: 10px 0 4px; }
</style>
