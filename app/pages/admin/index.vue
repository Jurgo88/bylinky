<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Administrácia', robots: 'noindex' })

const supabase = useSupabaseClient()
const { data: counts } = await useAsyncData('admin-counts', async () => {
  const [p, o] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ])
  return { products: p.count ?? 0, newOrders: o.count ?? 0 }
})

async function logout() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}
</script>

<template>
  <h1>Administrácia</h1>
  <p>Produkty: {{ counts?.products }} · Nové objednávky: {{ counts?.newOrders }}</p>
  <p class="muted">Správa produktov, stránok a objednávok – pripravuje sa.</p>
  <button class="btn" @click="logout">Odhlásiť</button>
</template>
