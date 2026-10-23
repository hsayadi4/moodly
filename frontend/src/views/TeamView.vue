<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import MoodChart from '../components/MoodChart.vue'
import { getMood } from '../moods'

const stats = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.getTeamStats(30)
    stats.value = res.data
  } catch (e) {
    error.value = e.message
  }
  loading.value = false
}

function trendText(trend) {
  if (trend === null) return '–'
  if (trend > 0) return '↗ +' + trend
  if (trend < 0) return '↘ ' + trend
  return '→ 0'
}

onMounted(load)
</script>

<template>
  <div>
    <p v-if="loading" class="muted">Chargement...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <h2>{{ stats.team.name }}</h2>
      <p class="muted subtitle">30 derniers jours · {{ stats.teamSize }} membres</p>

      <div v-if="stats.restricted" class="card">
        L'équipe compte moins de {{ stats.minGroupSize }} personnes : les statistiques ne sont pas
        affichées pour garantir l'anonymat.
      </div>

      <template v-else>
        <div class="kpis">
          <div class="card kpi">
            <span class="kpi-value">
              {{ stats.average !== null ? getMood(stats.average).emoji : '–' }}
              {{ stats.average ?? '' }}
            </span>
            <span class="muted small">Moral moyen /5</span>
          </div>
          <div class="card kpi">
            <span class="kpi-value">{{ stats.participation }}%</span>
            <span class="muted small">Participation</span>
          </div>
          <div class="card kpi">
            <span class="kpi-value" :class="{ up: stats.trend > 0, down: stats.trend < 0 }">
              {{ trendText(stats.trend) }}
            </span>
            <span class="muted small">vs sem. dernière</span>
          </div>
        </div>

        <div v-for="(alert, i) in stats.alerts" :key="i" class="alert" :class="alert.level">
          {{ alert.message }}
        </div>

        <section class="card">
          <h3>Évolution du moral</h3>
          <MoodChart :series="stats.series" />
          <p class="muted small note">
            Les jours avec moins de {{ stats.minGroupSize }} réponses ne sont pas affichés (anonymat).
          </p>
        </section>

        <section class="card">
          <h3>Raisons les plus citées</h3>
          <p v-if="stats.topTags.length === 0" class="muted">Pas encore de données.</p>
          <ul class="reasons">
            <li v-for="tag in stats.topTags" :key="tag.label">
              <span>{{ tag.emoji }} {{ tag.label }}</span>
              <span class="muted small">
                {{ tag.share }}% des réponses
                <template v-if="tag.lowShare > 0"> · {{ tag.lowShare }}% quand le moral est bas</template>
              </span>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.subtitle {
  margin-top: -8px;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.kpi {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 14px 6px;
  margin-bottom: 12px;
}
.kpi-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}
.kpi-value.up {
  color: #30a46c;
}
.kpi-value.down {
  color: #e5484d;
}
.alert {
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}
.alert.critical {
  background: #fde8e8;
  color: #a52a2a;
}
.alert.warning {
  background: #fff4dc;
  color: #8a5a00;
}
.alert.info {
  background: #eaeafd;
  color: #3f3fa8;
}
.note {
  margin-bottom: 0;
}
.reasons {
  list-style: none;
  padding: 0;
  margin: 0;
}
.reasons li {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.reasons li:last-child {
  border-bottom: none;
}
</style>
