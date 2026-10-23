<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import MoodChart from '../components/MoodChart.vue'
import { formatNumber } from '../moods'

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
  if (trend > 0) return '+' + formatNumber(trend)
  return formatNumber(trend)
}

onMounted(load)
</script>

<template>
  <div>
    <p v-if="loading" class="muted">Chargement…</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <template v-else>
      <h1>{{ stats.team.name }}</h1>
      <p class="subtitle">Synthèse des 30 derniers jours · {{ stats.teamSize }} membres</p>

      <div v-if="stats.restricted" class="card">
        L'équipe compte moins de {{ stats.minGroupSize }} personnes : les statistiques ne sont pas
        affichées afin de garantir l'anonymat des réponses.
      </div>

      <template v-else>
        <div class="kpis">
          <div class="card kpi">
            <span class="kpi-label">Moral moyen</span>
            <span class="kpi-value">
              {{ stats.average !== null ? formatNumber(stats.average) : '–' }}<small>/5</small>
            </span>
          </div>
          <div class="card kpi">
            <span class="kpi-label">Participation</span>
            <span class="kpi-value">{{ stats.participation }}<small>%</small></span>
          </div>
          <div class="card kpi">
            <span class="kpi-label">Tendance 7 j</span>
            <span class="kpi-value" :class="{ up: stats.trend > 0, down: stats.trend < 0 }">
              {{ trendText(stats.trend) }}
            </span>
          </div>
        </div>

        <div v-for="(alert, i) in stats.alerts" :key="i" class="alert" :class="alert.level">
          {{ alert.message }}
        </div>

        <section class="card">
          <h2>Évolution du moral moyen</h2>
          <MoodChart :series="stats.series" />
          <p class="muted small note">
            Les jours comptant moins de {{ stats.minGroupSize }} réponses ne sont pas affichés (anonymat).
          </p>
        </section>

        <section class="card">
          <h2>Facteurs les plus cités</h2>
          <p v-if="stats.topTags.length === 0" class="muted small">Pas encore de données.</p>
          <ul class="reasons">
            <li v-for="tag in stats.topTags" :key="tag.label">
              <div class="reason-line">
                <span>{{ tag.label }}</span>
                <span class="reason-share">{{ tag.share }} %</span>
              </div>
              <span v-if="tag.lowShare > 0" class="muted small">
                dont {{ tag.lowShare }} % associés à un moral bas
              </span>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 12px;
  margin-bottom: 14px;
}
.kpi-label {
  font-size: 12px;
  color: var(--muted);
}
.kpi-value {
  font-size: 22px;
  font-weight: 650;
}
.kpi-value small {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  margin-left: 2px;
}
.kpi-value.up {
  color: var(--success);
}
.kpi-value.down {
  color: var(--danger);
}
.alert {
  padding: 10px 12px;
  margin-bottom: 10px;
  font-size: 13px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: 6px;
}
.alert.critical {
  border-left-color: var(--danger);
}
.alert.warning {
  border-left-color: var(--warning);
}
.note {
  margin: 12px 0 0;
}
.reasons {
  list-style: none;
  padding: 0;
  margin: 0;
}
.reasons li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.reasons li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.reason-line {
  display: flex;
  justify-content: space-between;
}
.reason-share {
  font-weight: 600;
}
</style>
