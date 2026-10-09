/** Spoločný výber produktov pre zoznamy (karta produktu). */
export const PRODUCT_CARD_SELECT =
  'slug, name, product_variants(price, is_active), product_images(storage_path, position)' as const

type CardRow = {
  slug: string
  name: string
  product_variants: { price: number; is_active: boolean }[]
  product_images: { storage_path: string; position: number }[]
}

export function toCard(p: CardRow) {
  const prices = p.product_variants.filter((v) => v.is_active).map((v) => v.price)
  const img = [...p.product_images].sort((a, b) => a.position - b.position)[0]
  return {
    slug: p.slug,
    name: p.name,
    image: img?.storage_path ?? null,
    priceFrom: prices.length ? Math.min(...prices) : null,
    hasVariants: prices.length > 1,
  }
}
