// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],

  // SUPABASE_URL a SUPABASE_KEY (publishable) sa načítajú z .env
  supabase: {
    types: '~/types/database.types.ts',
    // verejný e-shop: prihlásenie vyžaduje len /admin (rieši middleware/admin.ts)
    redirect: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'sk' },
      title: 'Bylinky spod Tatier',
      meta: [
        { name: 'description', content: 'Prírodná medicína spod Tatier. Bylinky, šťavy, tinktúry, oleje a masti z rodinnej výroby.' },
      ],
    },
  },

  nitro: {
    preset: 'netlify',
  },
})
