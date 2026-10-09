/** Verejná URL súboru v Supabase Storage (bucket `media`). */
export function useMedia() {
  const { supabase } = useRuntimeConfig().public
  const base = `${supabase.url}/storage/v1/object/public/media/`
  return (path?: string | null) => (path ? base + path : '')
}
