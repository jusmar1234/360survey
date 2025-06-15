import React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function CategoryPerformanceHeatmap({ data }) {
  if (!data || data.length === 0) return <p>No data available</p>;

  const categories = Object.keys(data[0].averageScores || {});
  const heatmapData = categories.map((cat) => {
    const entry = { category: cat };
    data.forEach((leader) => {
      entry[leader.leader] = leader.averageScores[cat] ?? 0;
    });
    return entry;
  });

  const colorScale = (value) => {
    const red = Math.round(255 - (value - 1) * 51);
    const green = Math.round((value - 1) * 51);
    return `rgb(${red},${green},100)`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        Category Performance Heatmap
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={heatmapData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis dataKey="category" type="category" width={150} />
          <Tooltip />
          {data.map((leader, index) => (
            <Bar
              key={leader.leader}
              dataKey={leader.leader}
              stackId="a"
              fill="#8884d8"
              isAnimationActive
            >
              <LabelList dataKey={leader.leader} position="right" />
              {heatmapData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={colorScale(entry[leader.leader])} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
