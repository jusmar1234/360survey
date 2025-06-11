import React, { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

export default function PerCategoryChart({ leaderData }) {
  const chartRef = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hidden, setHidden] = useState(new Set());

  const leaderName = leaderData?.name || leaderData?.leader || "Leader";
  const categories = Object.keys(leaderData?.averageScores || {});

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  if (!leaderData) return <p>No data available</p>;

  const chartData = (leaderData.questions || [])
    .filter(({ fullQuestion }) =>
      fullQuestion.toLowerCase().includes(selectedCategory?.toLowerCase())
    )
    .map(({ shortQuestion, peerAverage, selfRating }) => ({
      question: shortQuestion,
      peer: peerAverage,
      self: selfRating,
    }));

  function onLegendClick(entry) {
    const key = entry.dataKey;
    const newHidden = new Set(hidden);
    if (newHidden.has(key)) newHidden.delete(key);
    else newHidden.add(key);
    setHidden(newHidden);
  }

  const handleExport = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.download = `PerCategoryChart_${leaderName}_${selectedCategory}_${date}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed:", err);
      });
  };

  return (
    <div>
      {/* Controls above the chart */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Category: {selectedCategory}</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chart container that includes name (for export) */}
      <div ref={chartRef} className="bg-white p-4 rounded shadow">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{leaderName}</h2>
          <p className="text-sm text-gray-500">Per Category Question Breakdown</p>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
          >
            <XAxis
              dataKey="question"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 5]} tickCount={6} width={40} />
            <Tooltip formatter={(v) => (v !== null ? v.toFixed(2) : "N/A")} />
            <Legend
              verticalAlign="top"
              onClick={onLegendClick}
              payload={[
                {
                  value: "Peer Assessment",
                  type: "square",
                  id: "peer",
                  color: "#3b82f6",
                  inactive: hidden.has("peer"),
                  dataKey: "peer",
                },
                {
                  value: "Self Assessment",
                  type: "square",
                  id: "self",
                  color: "#f59e0b",
                  inactive: hidden.has("self"),
                  dataKey: "self",
                },
              ]}
            />
            {!hidden.has("peer") && <Bar dataKey="peer" fill="#3b82f6" />}
            {!hidden.has("self") && <Bar dataKey="self" fill="#f59e0b" />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={handleExport}>Export Chart as PNG</Button>
      </div>
    </div>
  );
}
