<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref(route.query.error === 'forbidden' ? 'Tento účet nemá prístup do administrácie.' : '')
const loading = ref(false)

async function login() {
  loading.value = true
  error.value = ''
  const { error: e } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  loading.value = false
  if (e) error.value = 'Nesprávny e-mail alebo heslo.'
  else await navigateTo('/admin')
}

useSeoMeta({ title: 'Prihlásenie | Administrácia', robots: 'noindex' })
</script>

<template>
  <form class="login" @submit.prevent="login">
    <h1>Administrácia</h1>
    <label>E-mail <input v-model="email" type="email" autocomplete="username" required /></label>
    <label>Heslo <input v-model="password" type="password" autocomplete="current-password" required /></label>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="btn" :disabled="loading">{{ loading ? 'Prihlasujem…' : 'Prihlásiť' }}</button>
  </form>
</template>

<style scoped>
.login { max-width: 360px; margin: 40px auto; display: grid; gap: 12px; }
label { display: grid; gap: 4px; }
input { padding: 10px; border: 1px solid var(--c-border); border-radius: 8px; font: inherit; }
.error { color: #a12; margin: 0; }
</style>
