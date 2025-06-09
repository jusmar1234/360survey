import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PerCategoryChart({ leaderData }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hidden, setHidden] = useState(new Set());

  if (!leaderData) return <p>No data available</p>;

  // Drilldown data: either show categories or questions within selected category
  const chartData = selectedCategory
    ? (leaderData.questions || [])
        .filter(({ fullQuestion }) =>
          fullQuestion.toLowerCase().includes(selectedCategory.toLowerCase())
        )
        .map(({ shortQuestion, peerAverage, selfRating }) => ({
          category: shortQuestion,
          peer: peerAverage,
          self: selfRating,
        }))
    : Object.entries(leaderData.averageScores || {}).map(([cat, val]) => ({
        category: cat,
        peer: val,
        self: leaderData.selfAssessment?.[cat] ?? null,
      }));

  // Legend toggle
  function onLegendClick(entry) {
    const key = entry.dataKey;
    const newHidden = new Set(hidden);
    if (newHidden.has(key)) {
      newHidden.delete(key);
    } else {
      newHidden.add(key);
    }
    setHidden(newHidden);
  }

  // Drilldown on peer bar click (only when not drilled down)
  function onBarClick(data) {
    if (!selectedCategory) {
      setSelectedCategory(data.category);
    }
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
        >
          <XAxis
            dataKey="category"
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
          {!hidden.has("peer") && (
            <Bar
              dataKey="peer"
              fill="#3b82f6"
              onClick={onBarClick}
              cursor={selectedCategory ? "default" : "pointer"}
            />
          )}
          {!hidden.has("self") && <Bar dataKey="self" fill="#f59e0b" />}
        </BarChart>
      </ResponsiveContainer>

      {selectedCategory && (
        <div className="absolute bottom-0 right-0 m-4">
          <button
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
            onClick={() => setSelectedCategory(null)}
          >
            Show All Categories
          </button>
        </div>
      )}
    </div>
  );
}
