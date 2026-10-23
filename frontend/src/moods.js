// les 5 niveaux d'humeur
export const MOODS = [
  { score: 1, label: 'Très mal', color: '#b42318' },
  { score: 2, label: 'Pas bien', color: '#c4561d' },
  { score: 3, label: 'Neutre', color: '#7a8699' },
  { score: 4, label: 'Bien', color: '#3d8a5f' },
  { score: 5, label: 'Très bien', color: '#1f6f4a' },
]

export function getMood(score) {
  return MOODS.find((m) => m.score === Math.round(score))
}

// 3.3 -> "3,3"
export function formatNumber(n) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}
