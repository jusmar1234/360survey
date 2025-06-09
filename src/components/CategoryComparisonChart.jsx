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

export default function CategoryComparisonChart({ data = [], enableExport = false }) {
  const chartRef = useRef();
  const leaderName = data?.[0]?.leader || "Leader";

  const labels = Object.keys(data?.[0]?.averageScores || {});
  const peerData = labels.map((label) => data?.[0]?.averageScores[label]);
  const selfData = labels.map((label) => data?.[0]?.selfAssessment[label]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Peer Rating",
        data: peerData,
        backgroundColor: "#60a5fa", // blue-400
      },
      {
        label: "Self Rating",
        data: selfData,
        backgroundColor: "#a78bfa", // purple-400
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Peer vs Self Rating – ${leaderName}`,
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
        link.download = `${leaderName.replace(/\s+/g, "_")}_chart_${date}.png`;
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
          <h2 className="text-xl font-semibold">{leaderName} – Peer vs Self Chart</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>
        <Bar data={chartData} options={options} />
      </div>

      {enableExport && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleExport}>Export Chart as PNG</Button>
        </div>
      )}
    </div>
  );
}
