"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RealTimeData {
  timestamp: string;
  dataType: string;
  value: number;
  metadata?: any;
}

interface Prediction {
  id: string;
  type: string;
  predictedValue: number;
  confidence: number;
  explanation: string;
  timeHorizon: number;
  createdAt: string;
}

interface DataSummary {
  [key: string]: {
    average: number;
    min: number;
    max: number;
    count: number;
    trend: "up" | "down" | "stable";
  };
}

export default function RealTimeDashboard() {
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [dataSummary, setDataSummary] = useState<DataSummary>({});
  const [isCollecting, setIsCollecting] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    attention: 0.5,
    engagement: 0.5,
    performance: 0.5,
    mood: 0.5,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const predictionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchInitialData();
    startDataCollection();
    startPredictionUpdates();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (predictionIntervalRef.current)
        clearInterval(predictionIntervalRef.current);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      const [dataRes, summaryRes, predictionsRes] = await Promise.all([
        fetch("/api/realtime/data?minutes=60"),
        fetch("/api/realtime/summary?hours=1"),
        fetch("/api/realtime/predict?limit=5"),
      ]);

      if (dataRes.ok) {
        const data = await dataRes.json();
        setRealTimeData(data.data || []);
      }

      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setDataSummary(summary.summary || {});
      }

      if (predictionsRes.ok) {
        const preds = await predictionsRes.json();
        setPredictions(preds.predictions || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const startDataCollection = () => {
    setIsCollecting(true);
    intervalRef.current = setInterval(async () => {
      try {
        // Simulate real-time data collection
        const newData = {
          dataType: ["attention", "engagement", "performance", "mood"][
            Math.floor(Math.random() * 4)
          ],
          value: Math.random(),
          metadata: { source: "simulated", confidence: 0.8 },
        };

        await fetch("/api/realtime/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });

        // Update current metrics
        setCurrentMetrics((prev) => ({
          ...prev,
          [newData.dataType]: newData.value,
        }));

        // Refresh data
        fetchInitialData();
      } catch (error) {
        console.error("Error collecting data:", error);
      }
    }, 5000); // Collect data every 5 seconds
  };

  const startPredictionUpdates = () => {
    predictionIntervalRef.current = setInterval(async () => {
      try {
        const predictionTypes = [
          "attention_trend",
          "performance_forecast",
          "engagement_level",
        ];
        const randomType =
          predictionTypes[Math.floor(Math.random() * predictionTypes.length)];

        const response = await fetch("/api/realtime/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ predictionType: randomType, timeHorizon: 15 }),
        });

        if (response.ok) {
          const result = await response.json();
          setPredictions((prev) => [result.prediction, ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error("Error making prediction:", error);
      }
    }, 30000); // Make predictions every 30 seconds
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.7) return "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";
    if (value >= 0.4) return "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
    return "text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const chartData = {
    labels: realTimeData
      .slice(-20)
      .map((d) => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "Attention",
        data: realTimeData
          .filter((d) => d.dataType === "attention")
          .slice(-20)
          .map((d) => d.value),
        borderColor: "#06b6d4", // Cyan-500
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#fff",
      },
      {
        label: "Engagement",
        data: realTimeData
          .filter((d) => d.dataType === "engagement")
          .slice(-20)
          .map((d) => d.value),
        borderColor: "#8b5cf6", // Violet-500
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#fff",
      },
      {
        label: "Performance",
        data: realTimeData
          .filter((d) => d.dataType === "performance")
          .slice(-20)
          .map((d) => d.value),
        borderColor: "#ec4899", // Pink-500
        backgroundColor: "rgba(236, 72, 153, 0.2)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ec4899",
        pointBorderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
            color: "#cbd5e1", // slate-300
            font: {
                family: "'Inter', sans-serif",
            }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        displayColors: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
            color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
            color: "#94a3b8", // slate-400
        }
      },
      x: {
        grid: {
            display: false,
        },
        ticks: {
            color: "#94a3b8",
            maxRotation: 45,
            minRotation: 45,
        }
      }
    },
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 neon-text">
            Real-Time Analytics
        </h1>
        <div className="flex items-center space-x-3 px-4 py-2 rounded-full glass-panel border border-cyan-500/30">
          <div
            className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${
              isCollecting ? "bg-green-400 text-green-400" : "bg-gray-400 text-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium text-cyan-100">
            {isCollecting ? "System Active" : "System Paused"}
          </span>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(currentMetrics).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">{key}</p>
                <p className={`text-3xl font-bold ${getMetricColor(value)}`}>
                  {Math.round(value * 100)}%
                </p>
              </div>
              <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {key === "attention" && "🎯"}
                {key === "engagement" && "🔥"}
                {key === "performance" && "⭐"}
                {key === "mood" && "😊"}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                        value >= 0.7 ? "bg-cyan-500 shadow-[0_0_10px_#06b6d4]" :
                        value >= 0.4 ? "bg-purple-500 shadow-[0_0_10px_#a855f7]" :
                        "bg-pink-500 shadow-[0_0_10px_#ec4899]"
                    }`}
                />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Real-Time Chart */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]"></span>
                Live Metrics Stream
            </h2>
        </div>
        <div className="h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Data Summary */}
        <div className="col-span-1 lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-purple-400 rounded-full shadow-[0_0_10px_#c084fc]"></span>
                Session Summary (Last Hour)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(dataSummary).map(([type, data]) => (
                <div key={type} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-cyan-100 capitalize">{type}</h3>
                    <span className="text-xl">{getTrendIcon(data.trend)}</span>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                    <div className="flex justify-between">
                        <span>Avg</span>
                        <span className="font-mono text-white">{Math.round(data.average * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Range</span>
                        <span className="font-mono text-xs text-slate-400">{Math.round(data.min * 100)}-{Math.round(data.max * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Samples</span>
                        <span className="font-mono text-slate-400">{data.count}</span>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Predictions */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6]"></span>
                AI Insights & Forecasts
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
            <AnimatePresence>
                {predictions.map((prediction, index) => (
                <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-all"
                >
                    <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-pink-200 capitalize text-sm">
                        {prediction?.type
                        ? prediction.type.replace("_", " ")
                        : "Unknown Type"}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div
                        className={`w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${
                            prediction.confidence > 0.7
                            ? "bg-green-400 text-green-400"
                            : prediction.confidence > 0.4
                            ? "bg-yellow-400 text-yellow-400"
                            : "bg-red-400 text-red-400"
                        }`}
                        ></div>
                        <span className="text-xs text-slate-400">
                        {Math.round(prediction.confidence * 100)}%
                        </span>
                    </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                    {prediction.explanation}
                    </p>
                    <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2 mt-2">
                    <span className="text-cyan-300">
                        Forecast: {Math.round(prediction.predictedValue * 100)}%
                    </span>
                    <span className="text-slate-500 font-mono">
                        {new Date(prediction.createdAt).toLocaleTimeString()}
                    </span>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
