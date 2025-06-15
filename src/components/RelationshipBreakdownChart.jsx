import React from "react";
import {
  Treemap,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RelationshipTreemap({ data }) {
  if (!data || data.length === 0) return <p>No data available</p>;

  const treemapData = data.map((leader) => {
    const children = Object.entries(
      leader.rawPeers?.reduce((acc, peer) => {
        const rel = peer["Relationship with the Leader"]?.trim();
        if (rel) acc[rel] = (acc[rel] || 0) + 1;
        return acc;
      }, {}) || {}
    ).map(([name, value]) => ({ name, size: value }));

    return { name: leader.leader, children };
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        Relationship Breakdown (Treemap)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          width={400}
          height={200}
          data={treemapData}
          dataKey="size"
          nameKey="name"
          stroke="#fff"
          fill="#82ca9d"
          isAnimationActive
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
