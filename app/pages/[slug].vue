<script setup lang="ts">
// Obsahové stránky z tabuľky pages: o-nas, kontakt, doprava, obchodne-podmienky, …
const route = useRoute()
const supabase = useSupabaseClient()
const slug = route.params.slug as string

const { data: page } = await useAsyncData(`page-${slug}`, async () => {
  const { data } = await supabase.from('pages').select('title, body_md, seo_title, seo_description').eq('slug', slug).maybeSingle()
  return data
})

if (!page.value || slug === 'uvod') throw createError({ statusCode: 404, statusMessage: 'Stránka neexistuje' })

useSeoMeta({
  title: () => `${page.value?.seo_title || page.value?.title} | Bylinky spod Tatier`,
  description: () => page.value?.seo_description ?? undefined,
})
</script>

<template>
  <article v-if="page" class="prose" v-html="renderMarkdown(page.body_md)" />
</template>
