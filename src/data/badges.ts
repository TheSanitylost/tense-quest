export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGES: Badge[] = [
  {
    id: 'first-boss',
    name: 'Pierwszy boss',
    description: 'Pokonaj pierwszego bossa.',
    icon: '⚔️',
  },
  {
    id: 'three-star',
    name: 'Perfekcja',
    description: 'Zdobądź 3★ na dowolnym poziomie.',
    icon: '⭐',
  },
  {
    id: 'combo-10',
    name: 'Combo ×10',
    description: 'Zrób 10 poprawnych odpowiedzi z rzędu.',
    icon: '🔥',
  },
  {
    id: 'six-stars',
    name: 'Pół mapy',
    description: 'Zbierz łącznie 6 gwiazdek.',
    icon: '🗺️',
  },
  {
    id: 'mega-boss',
    name: 'Mega Boss',
    description: 'Wygraj Mega Bossa (test mieszany).',
    icon: '👑',
  },
  {
    id: 'all-clear',
    name: 'Mistrz czasów',
    description: 'Zdobądź przynajmniej 1★ na każdym poziomie.',
    icon: '🏆',
  },
]
