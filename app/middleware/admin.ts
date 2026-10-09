// Pustí do /admin len prihláseného používateľa s rolou admin (tabuľka profiles).
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/admin/login')

  const supabase = useSupabaseClient()
  const { data } = await supabase.from('profiles').select('role').eq('user_id', user.value.sub).maybeSingle()
  if (data?.role !== 'admin') return navigateTo('/admin/login?error=forbidden')
})
