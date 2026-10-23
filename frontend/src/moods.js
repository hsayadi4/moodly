// les 5 niveaux d'humeur
export const MOODS = [
  { score: 1, emoji: '😫', label: 'Très mal', color: '#e5484d' },
  { score: 2, emoji: '😕', label: 'Pas top', color: '#f76b15' },
  { score: 3, emoji: '😐', label: 'Bof', color: '#ffc53d' },
  { score: 4, emoji: '🙂', label: 'Bien', color: '#86c540' },
  { score: 5, emoji: '😄', label: 'Super', color: '#30a46c' },
]

export function getMood(score) {
  return MOODS.find((m) => m.score === Math.round(score))
}
