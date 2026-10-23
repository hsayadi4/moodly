<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { MOODS, getMood } from '../moods'

const auth = useAuthStore()

const tags = ref([])
const selectedScore = ref(null)
const selectedTags = ref([])
const alreadyDone = ref(false)
const history = ref([])
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const error = ref('')

// "alex.durand" -> "Alex"
const firstName = computed(() => {
  if (!auth.user) return ''
  const name = auth.user.username.split('.')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const todayLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

// les 7 derniers jours pour le petit historique
const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toLocaleDateString('en-CA')
    const found = history.value.find((h) => h.day === iso)
    days.push({
      iso,
      letter: d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3),
      mood: found ? getMood(found.score) : null,
    })
  }
  return days
})

async function load() {
  loading.value = true
  try {
    const [tagsRes, todayRes, historyRes] = await Promise.all([
      api.getTags(),
      api.getTodayMood(),
      api.getHistory(7),
    ])
    tags.value = tagsRes.data
    history.value = historyRes.data
    if (todayRes.data) {
      alreadyDone.value = true
      selectedScore.value = todayRes.data.score
      selectedTags.value = todayRes.data.tags.map((t) => t.documentId)
    }
  } catch (e) {
    error.value = e.message
  }
  loading.value = false
}

function toggleTag(id) {
  if (selectedTags.value.includes(id)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== id)
  } else if (selectedTags.value.length < 3) {
    selectedTags.value.push(id)
  }
}

async function save() {
  error.value = ''
  message.value = ''
  saving.value = true
  try {
    await api.saveTodayMood(selectedScore.value, selectedTags.value)
    message.value = alreadyDone.value ? 'Humeur mise à jour !' : 'Merci ! Ton humeur est enregistrée.'
    alreadyDone.value = true
    history.value = (await api.getHistory(7)).data
  } catch (e) {
    error.value = e.message
  }
  saving.value = false
}

onMounted(load)
</script>

<template>
  <div>
    <h2>Salut {{ firstName }} 👋</h2>
    <p class="muted date">{{ todayLabel }}</p>

    <p v-if="loading" class="muted">Chargement...</p>

    <template v-else>
      <section class="card">
        <h3>Comment tu te sens aujourd'hui ?</h3>
        <div class="moods">
          <button
            v-for="m in MOODS"
            :key="m.score"
            class="mood-btn"
            :class="{ selected: selectedScore === m.score }"
            :style="selectedScore === m.score ? { borderColor: m.color, background: m.color + '22' } : {}"
            @click="selectedScore = m.score"
          >
            <span class="emoji">{{ m.emoji }}</span>
            <span class="small">{{ m.label }}</span>
          </button>
        </div>

        <h3>Pourquoi ? <span class="muted small">(facultatif, 3 max)</span></h3>
        <div class="tags">
          <button
            v-for="tag in tags"
            :key="tag.documentId"
            class="tag"
            :class="{ active: selectedTags.includes(tag.documentId) }"
            @click="toggleTag(tag.documentId)"
          >
            {{ tag.emoji }} {{ tag.label }}
          </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="message" class="success">{{ message }}</p>

        <button class="btn" :disabled="!selectedScore || saving" @click="save">
          {{ saving ? 'Envoi...' : alreadyDone ? 'Modifier mon humeur' : 'Envoyer' }}
        </button>

        <p class="privacy small">
          🔒 Ta réponse est anonyme : ton manager voit seulement la moyenne de l'équipe.
        </p>
      </section>

      <section class="card">
        <h3>Ma semaine</h3>
        <div class="week">
          <div v-for="d in last7Days" :key="d.iso" class="day">
            <span class="emoji-small">{{ d.mood ? d.mood.emoji : '·' }}</span>
            <span class="muted small">{{ d.letter }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.date {
  margin-top: -8px;
  text-transform: capitalize;
}
.moods {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 20px;
}
.mood-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 2px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #f4f4f8;
  cursor: pointer;
}
.mood-btn .emoji {
  font-size: 30px;
}
.mood-btn.selected {
  transform: scale(1.05);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.tag {
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 14px;
}
.tag.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.privacy {
  margin: 14px 0 0;
  color: #666;
  text-align: center;
}
.week {
  display: flex;
  justify-content: space-between;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.emoji-small {
  font-size: 24px;
  height: 30px;
}
</style>
