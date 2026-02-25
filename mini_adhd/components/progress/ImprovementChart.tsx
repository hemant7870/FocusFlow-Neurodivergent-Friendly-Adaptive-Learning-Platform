"use client"
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ImprovementChartProps {
  data: {
    labels: string[]
    attention: number[]
    focus: number[]
    quiz: number[]
  }
}

export default function ImprovementChart({ data }: ImprovementChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Attention Span (min)',
        data: data.attention,
        borderColor: 'rgb(99, 102, 241)', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Focus Score',
        data: data.focus,
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Quiz Accuracy (%)',
        data: data.quiz,
        borderColor: 'rgb(249, 115, 22)', // Orange
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <span className="mr-2">📈</span> Improvement Track
      </h3>
      <div className="h-64">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}
