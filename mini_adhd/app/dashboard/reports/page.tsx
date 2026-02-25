"use client";

import { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

interface ProgressData {
  completedLessons: number;
  totalLessons: number;
  totalTime: number;
  attentionRate: number;
  modeUsed: string;
}

interface QuizData {
  score: number;
  difficulty: string;
  timeSpent: number;
  createdAt: string;
}

interface ReportData {
  user: {
    name: string;
    adhdScore: number;
  };
  progress: ProgressData[];
  quizzes: QuizData[];
  totalTime: number;
  averageAttention: number;
  completionRate: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch("/api/learning/report");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report) return;

    const csvData = [
      ["Metric", "Value"],
      ["Total Time (minutes)", report.totalTime.toString()],
      ["Average Attention", report.averageAttention.toFixed(2)],
      ["Completion Rate", `${report.completionRate}%`],
      [
        "Completed Lessons",
        report.progress
          .reduce((sum, p) => sum + p.completedLessons, 0)
          .toString(),
      ],
      [
        "Total Lessons",
        report.progress.reduce((sum, p) => sum + p.totalLessons, 0).toString(),
      ],
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "focusflow_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-8">Loading reports...</div>;
  if (!report) return <div className="p-8">No data available</div>;

  // Chart data setup
  const attentionData = {
    labels: report.quizzes.map((_, i) => `Quiz ${i + 1}`),
    datasets: [
      {
        label: "Attention Level",
        data: report.quizzes.map((q) => q.score * 100),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const modeData = {
    labels: ["Text", "Visual", "Audio"],
    datasets: [
      {
        label: "Learning Modes",
        data: [
          report.progress.filter((p) => p.modeUsed === "text").length,
          report.progress.filter((p) => p.modeUsed === "visual").length,
          report.progress.filter((p) => p.modeUsed === "audio").length,
        ],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
        borderWidth: 1,
      },
    ],
  };

  const difficultyData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        label: "Quizzes by Difficulty",
        data: [
          report.quizzes.filter((q) => q.difficulty === "easy").length,
          report.quizzes.filter((q) => q.difficulty === "medium").length,
          report.quizzes.filter((q) => q.difficulty === "hard").length,
        ],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Learning Reports</h2>
          <p className="text-gray-600">
            Track your progress and learning patterns
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📊 Export CSV
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="text-gray-500 text-sm mb-2">Total Learning Time</div>
          <div className="text-3xl font-bold text-blue-600">
            {Math.round(report.totalTime)} min
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="text-gray-500 text-sm mb-2">Average Attention</div>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(report.averageAttention * 100)}%
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="text-gray-500 text-sm mb-2">Completion Rate</div>
          <div className="text-3xl font-bold text-purple-600">
            {report.completionRate}%
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
          <div className="text-gray-500 text-sm mb-2">ADHD Level</div>
          <div className="text-2xl font-bold text-orange-600">
            {report.user.adhdScore <= 30
              ? "Low"
              : report.user.adhdScore <= 60
              ? "Moderate"
              : "High"}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Attention Over Time
          </h3>
          <div className="h-64">
            <Line
              data={attentionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 100 },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Learning Modes Used
          </h3>
          <div className="h-64">
            <Doughnut
              data={modeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quiz Difficulty Distribution
          </h3>
          <div className="h-64">
            <Bar
              data={difficultyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Learning Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Lessons Completed</span>
              <span className="font-semibold text-lg">
                {report.progress.reduce(
                  (sum, p) => sum + p.completedLessons,
                  0
                )}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Preferred Mode</span>
              <span className="font-semibold text-lg capitalize">
                {(() => {
                  if (report.progress.length === 0) return "text";
                  const modeCounts = report.progress.reduce((acc, p) => {
                    acc[p.modeUsed] = (acc[p.modeUsed] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const entries = Object.entries(modeCounts);
                  return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
                })()}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Quiz Score</span>
              <span className="font-semibold text-lg">
                {report.quizzes.length > 0
                  ? Math.round(
                      (report.quizzes.reduce((sum, q) => sum + q.score, 0) /
                        report.quizzes.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
