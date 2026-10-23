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
      borderColor: '#5b5bd6',
      backgroundColor: 'rgba(91, 91, 214, 0.12)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      spanGaps: false,
    },
    {
      label: "Seuil d'alerte",
      data: props.series.map(() => 2.5),
      borderColor: '#e5484d',
      borderDash: [6, 6],
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
      ticks: {
        stepSize: 1,
        callback: (value) => ['', '😫', '😕', '😐', '🙂', '😄'][value],
      },
    },
    x: {
      ticks: { maxTicksLimit: 8 },
    },
  },
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12 } },
    tooltip: {
      callbacks: {
        label: (item) =>
          item.datasetIndex === 0 ? `Moyenne : ${item.raw} / 5` : "Seuil d'alerte",
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
  height: 260px;
}
</style>
