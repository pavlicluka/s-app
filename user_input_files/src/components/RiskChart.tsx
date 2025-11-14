import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface RiskChartProps {
  title: string
  data: {
    labels: string[]
    values: number[]
    colors: string[]
  }
}

export default function RiskChart({ title, data }: RiskChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.colors,
        borderWidth: 0,
        borderRadius: 4,
        spacing: 2,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#282828',
        titleColor: '#e4e4e7',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed
            return `${label}: ${value}`
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 800,
      easing: 'easeOutQuart',
    },
  }

  return (
    <div className="bg-bg-surface p-8 rounded-lg border border-border-subtle">
      {/* Title */}
      <h3 className="text-heading-md font-semibold text-text-primary mb-6">{title}</h3>

      {/* Chart */}
      <div className="w-[280px] h-[280px] mx-auto">
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-3">
        {data.labels.map((label, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.colors[index] }}
            />
            <span className="text-body-sm text-text-secondary">{label}</span>
            <span className="text-body-sm font-medium text-text-primary ml-auto">
              {data.values[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
