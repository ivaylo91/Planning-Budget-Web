const CATEGORY_ICONS: Array<[match: string, icon: string]> = [
  ['Млечни', '🧀'],
  ['Месо', '🥩'],
  ['Хляб', '🍞'],
  ['Напитки', '🥤'],
  ['Сладки', '🍫'],
  ['Плодове', '🥦'],
  ['Консерви', '🥫'],
  ['Домакински', '🧹'],
  ['Основни', '🛒'],
]

export function categoryIcon(category: string): string {
  const found = CATEGORY_ICONS.find(([match]) => category.includes(match))
  return found ? found[1] : '🏷️'
}

const STORE_COLORS: Record<string, string> = {
  Lidl: '#0050AA',
  Kaufland: '#E30613',
  Billa: '#F7A600',
  Fantastiko: '#2E7D32',
  'T Market': '#8E1B3F',
  Metro: '#003DA5',
  CBA: '#FFD200',
}

export function storeColor(store: string): string {
  return STORE_COLORS[store] ?? '#7A7A8E'
}
