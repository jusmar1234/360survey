import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CategoryComparisonChart({ data = [], selectedCategory = null, enableExport = true }) {
  const chartRef = useRef();

  if (!data || data.length === 0) return <p>No data available</p>;

  // Extract all unique categories
  const allCategories = Object.keys(data[0].averageScores || {});
  const categories = selectedCategory ? [selectedCategory] : allCategories;

  // Prepare datasets: one dataset per leader
  const peerDatasets = data.map((leader, index) => ({
    label: `${leader.leader} (Peer)`,
    data: categories.map((cat) => leader.averageScores?.[cat] ?? null),
    backgroundColor: `hsl(${(index * 50) % 360}, 70%, 60%)`,
  }));

  const selfDatasets = data.map((leader, index) => ({
    label: `${leader.leader} (Self)`,
    data: categories.map((cat) => leader.selfAssessment?.[cat] ?? null),
    backgroundColor: `hsl(${(index * 50 + 20) % 360}, 60%, 70%)`,
  }));

  const chartData = {
    labels: categories,
    datasets: [...peerDatasets, ...selfDatasets],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: selectedCategory
          ? `Category Comparison: ${selectedCategory}`
          : "Category Comparison Across Leaders",
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

  const handleExport = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.download = `category_comparison_${date}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed:", err);
      });
  };

  return (
    <div>
      <div ref={chartRef} className="bg-white p-4 rounded-lg shadow w-full max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? `${selectedCategory} – Category Comparison` : "Peer vs Self by Category"}
          </h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>
        <Bar data={chartData} options={options} />
      </div>

      {enableExport && (
        <div className="flex justify-end mt-4 max-w-5xl mx-auto">
          <Button onClick={handleExport}>Export Chart as PNG</Button>
        </div>
      )}
    </div>
  );
}
