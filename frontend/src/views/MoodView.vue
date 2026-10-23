<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { MOODS, getMood } from '../moods'
import MoodIcon from '../components/MoodIcon.vue'

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
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
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
    message.value = alreadyDone.value ? 'Votre réponse a été mise à jour.' : 'Merci, votre réponse a été enregistrée.'
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
    <h1>Bonjour {{ firstName }}</h1>
    <p class="subtitle date">{{ todayLabel }}</p>

    <p v-if="loading" class="muted">Chargement…</p>

    <template v-else>
      <section class="card">
        <h2>Comment vous sentez-vous aujourd'hui ?</h2>
        <div class="moods">
          <button
            v-for="m in MOODS"
            :key="m.score"
            class="mood-btn"
            :class="{ selected: selectedScore === m.score }"
            :style="selectedScore === m.score ? { color: m.color, background: m.color + '12' } : {}"
            @click="selectedScore = m.score"
          >
            <MoodIcon :score="m.score" :size="30" />
            <span class="mood-label">{{ m.label }}</span>
          </button>
        </div>

        <h2 class="factors-title">
          Facteurs <span class="muted small">— facultatif, 3 maximum</span>
        </h2>
        <div class="tags">
          <button
            v-for="tag in tags"
            :key="tag.documentId"
            class="tag"
            :class="{ active: selectedTags.includes(tag.documentId) }"
            @click="toggleTag(tag.documentId)"
          >
            {{ tag.label }}
          </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="message" class="success">{{ message }}</p>

        <button class="btn" :disabled="!selectedScore || saving" @click="save">
          {{ saving ? 'Envoi…' : alreadyDone ? 'Mettre à jour' : 'Valider' }}
        </button>

        <p class="privacy small">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" />
          </svg>
          Réponse anonyme : votre manager ne voit que des moyennes d'équipe.
        </p>
      </section>

      <section class="card">
        <h2>Vos 7 derniers jours</h2>
        <div class="week">
          <div v-for="d in last7Days" :key="d.iso" class="day">
            <span
              class="dot"
              :class="{ empty: !d.mood }"
              :style="d.mood ? { background: d.mood.color } : {}"
              :title="d.mood ? d.mood.label : 'Pas de réponse'"
            ></span>
            <span class="muted small">{{ d.label }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.date {
  text-transform: capitalize;
}
.moods {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 22px;
}
.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 2px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: #9aa3b2;
  cursor: pointer;
}
.mood-btn:hover {
  border-color: #c5cbd4;
}
.mood-btn.selected {
  border-color: currentColor;
}
.mood-label {
  font-size: 12px;
  color: var(--text);
}
.factors-title {
  margin-bottom: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.tag {
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
}
.tag.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}
.privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 14px 0 0;
  color: var(--muted);
}
.week {
  display: flex;
  justify-content: space-between;
}
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.dot.empty {
  border: 1.5px dashed #c5cbd4;
}
</style>
