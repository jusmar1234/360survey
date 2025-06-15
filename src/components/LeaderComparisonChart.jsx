import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LeaderComparisonChart({ data }) {
  if (!data || data.length === 0) return <p>No data available</p>;

  // Get all unique categories from the first leader
  const categories = Object.keys(data[0].averageScores || {});

  const datasets = data.map((leader, i) => ({
    label: leader.leader,
    data: categories.map((cat) => leader.averageScores[cat] ?? null),
    backgroundColor: `hsl(${(i * 60) % 360}, 70%, 60%)`,
  }));

  const chartData = {
    labels: categories,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Leader Comparison Overview",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        Leader Comparison by Category
      </h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}