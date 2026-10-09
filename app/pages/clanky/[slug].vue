<script setup lang="ts">
const route = useRoute()
const supabase = useSupabaseClient()
const media = useMedia()
const slug = route.params.slug as string

const { data: article } = await useAsyncData(`article-${slug}`, async () => {
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt, body_md, cover_image_path, published_at')
    .eq('slug', slug)
    .maybeSingle()
  return data
})

if (!article.value) throw createError({ statusCode: 404, statusMessage: 'Článok neexistuje' })

useSeoMeta({
  title: () => `${article.value?.title} | Bylinky spod Tatier`,
  description: () => article.value?.excerpt ?? undefined,
  ogImage: () => media(article.value?.cover_image_path) || undefined,
})
</script>

<template>
  <article v-if="article" class="prose">
    <img v-if="article.cover_image_path" :src="media(article.cover_image_path)" :alt="article.title" width="1200" height="800" />
    <h1>{{ article.title }}</h1>
    <p v-if="article.published_at" class="muted">{{ new Date(article.published_at).toLocaleDateString('sk-SK') }}</p>
    <div v-html="renderMarkdown(article.body_md)" />
  </article>
</template>
