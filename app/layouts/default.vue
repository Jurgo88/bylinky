<script setup lang="ts">
const supabase = useSupabaseClient()

const { data: categories } = await useAsyncData('nav-categories', async () => {
  const { data } = await supabase.from('categories').select('slug, name').order('position')
  return data ?? []
})

const { data: footer } = await useAsyncData('footer', async () => {
  const { data } = await supabase.from('settings').select('value').eq('key', 'footer_md').maybeSingle()
  return typeof data?.value === 'string' ? data.value : ''
})
</script>

<template>
  <div class="site">
    <header class="site-header">
      <div class="container bar">
        <NuxtLink to="/" class="logo">Bylinky spod Tatier</NuxtLink>
        <nav class="main-nav">
          <NuxtLink to="/o-nas/">O nás</NuxtLink>
          <NuxtLink to="/clanky/">Články</NuxtLink>
          <NuxtLink to="/partnerske-predajne/">Predajne</NuxtLink>
          <NuxtLink to="/kontakt/">Kontakt</NuxtLink>
        </nav>
      </div>
      <nav class="container cat-nav">
        <NuxtLink v-for="c in categories" :key="c.slug" :to="`/kategoria/${c.slug}/`">{{ c.name }}</NuxtLink>
      </nav>
    </header>

    <main class="container main">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container" v-html="renderMarkdown(footer)" />
    </footer>
  </div>
</template>

<style scoped>
.site-header { border-bottom: 1px solid var(--c-border); background: #fff; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 14px; padding-bottom: 14px; flex-wrap: wrap; }
.logo { font-weight: 700; font-size: 1.25rem; text-decoration: none; color: var(--c-text); }
.main-nav { display: flex; gap: 16px; flex-wrap: wrap; }
.main-nav a, .cat-nav a { text-decoration: none; color: var(--c-text); }
.cat-nav { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 12px; font-size: 0.92rem; white-space: nowrap; }
.cat-nav a.router-link-active { color: var(--c-accent); font-weight: 600; }
.main { padding-top: 24px; padding-bottom: 48px; min-height: 60vh; }
.site-footer { border-top: 1px solid var(--c-border); background: #fff; padding: 24px 0; font-size: 0.9rem; }
</style>
