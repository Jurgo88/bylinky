const eur = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' })

export const formatPrice = (value: number | null | undefined) => (value == null ? '' : eur.format(value))

export function variantLabel(v: { size_label: string | null; packaging: string | null }) {
  return [v.size_label, v.packaging].filter(Boolean).join(' · ')
}
