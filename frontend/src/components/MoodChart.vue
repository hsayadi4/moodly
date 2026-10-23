<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { formatNumber } from '../moods'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const props = defineProps({
  series: { type: Array, required: true },
})

const chartData = computed(() => ({
  // "2026-10-23" -> "23/10"
  labels: props.series.map((p) => p.day.slice(8, 10) + '/' + p.day.slice(5, 7)),
  datasets: [
    {
      label: 'Moral moyen',
      data: props.series.map((p) => p.average),
      borderColor: '#1e3a5f',
      backgroundColor: 'rgba(30, 58, 95, 0.07)',
      borderWidth: 2,
      fill: true,
      tension: 0.25,
      pointRadius: 2,
      pointHoverRadius: 4,
      pointBackgroundColor: '#1e3a5f',
      spanGaps: false,
    },
    {
      label: "Seuil d'alerte (2,5)",
      data: props.series.map(() => 2.5),
      borderColor: '#b42318',
      borderDash: [4, 4],
      borderWidth: 1,
      pointRadius: 0,
      fill: false,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 1,
      max: 5,
      ticks: { stepSize: 1, color: '#6b7280', font: { size: 11 } },
      grid: { color: '#eef0f3' },
      border: { display: false },
    },
    x: {
      ticks: { maxTicksLimit: 6, color: '#6b7280', font: { size: 11 } },
      grid: { display: false },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, boxHeight: 2, color: '#6b7280', font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: (item) =>
          item.datasetIndex === 0 ? `Moyenne : ${formatNumber(item.raw)} / 5` : "Seuil d'alerte",
      },
    },
  },
}
</script>

<template>
  <div class="chart">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<style scoped>
.chart {
  height: 240px;
}
</style>
