import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function TopLeadersRadarChart({ data }) {
  const [filter, setFilter] = useState("Top 5");

  if (!data || data.length === 0) return <p>No data available</p>;

  const validLeaders = data.filter(
    (d) => d.averageScores && Object.keys(d.averageScores).length > 0
  );

  if (validLeaders.length === 0) return <p>No valid leader data</p>;

  // Calculate average of averageScores for each leader
  const leadersWithAverages = validLeaders.map((leader) => {
    const scores = Object.values(leader.averageScores).filter((v) => typeof v === "number");
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { ...leader, overallAverage: avg };
  });

  // Determine how many leaders to show
  const filterMap = {
    "All": leadersWithAverages.length,
    "Top 3": 3,
    "Top 5": 5,
    "Top 10": 10,
  };
  const limit = filterMap[filter] || leadersWithAverages.length;

  // Get the top N leaders based on filter
  const selectedLeaders = [...leadersWithAverages]
    .sort((a, b) => b.overallAverage - a.overallAverage)
    .slice(0, limit);

  const categories = Object.keys(selectedLeaders[0].averageScores);
  const radarData = categories.map((cat) => {
    const entry = { category: cat };
    selectedLeaders.forEach((leader) => {
      entry[leader.leader] = leader.averageScores[cat] ?? 0;
    });
    return entry;
  });

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#a52a2a", "#20b2aa", "#ff69b4", "#8a2be2", "#228b22"];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          Radar Chart of Leaders
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm rounded-md border px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-white"
        >
          <option>All</option>
          <option>Top 3</option>
          <option>Top 5</option>
          <option>Top 10</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData} outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
          {selectedLeaders.map((leader, idx) => (
            <Radar
              key={leader.leader}
              name={leader.leader}
              dataKey={leader.leader}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.4}
            />
          ))}
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
