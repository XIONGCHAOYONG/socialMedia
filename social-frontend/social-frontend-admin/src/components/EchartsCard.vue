<template>
  <div class="echarts-card">
    <h3 class="echarts-title">{{ title }}</h3>
    <div ref="chartRef" class="echarts-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

/**
 * EchartsCard 组件
 * @description 封装ECharts折线图，支持传入标题、x轴、y轴数据
 * @param {string} title 图表标题
 * @param {string[]} xData x轴数据
 * @param {number[]} yData y轴数据
 * @param {string} [seriesName] 折线名称
 */
const props = defineProps({
  title: String,
  xData: Array,
  yData: Array,
  seriesName: {
    type: String,
    default: '数据'
  }
})

const chartRef = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  const option = {
    title: { show: false },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: props.xData },
    yAxis: { type: 'value' },
    series: [
      {
        name: props.seriesName,
        type: 'line',
        data: props.yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
        itemStyle: { color: '#409eff' }
      }
    ]
  }
  chartInstance.setOption(option)
}

onMounted(() => {
  renderChart()
})

watch(() => [props.xData, props.yData], () => {
  renderChart()
})
</script>

<style scoped>
.echarts-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 24px 24px 12px 24px;
  margin-bottom: 24px;
}

.echarts-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

.echarts-container {
  width: 100%;
  height: 320px;
}
</style>