// les 5 niveaux d'humeur (couleur du trait + fond pastel)
export const MOODS = [
  { score: 1, label: 'Très mal', color: '#e0707a', soft: '#fde8ea' },
  { score: 2, label: 'Pas bien', color: '#ec9658', soft: '#fef0e4' },
  { score: 3, label: 'Neutre', color: '#d2ab3e', soft: '#fdf6dc' },
  { score: 4, label: 'Bien', color: '#5cb586', soft: '#e5f6ec' },
  { score: 5, label: 'Très bien', color: '#3aa99a', soft: '#ddf3f0' },
]

export function getMood(score) {
  return MOODS.find((m) => m.score === Math.round(score))
}

// 3.3 -> "3,3"
export function formatNumber(n) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}
