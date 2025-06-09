// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import CategoryComparisonChart from '../components/CategoryComparisonChart';
// import your parsed data here, e.g., from your parsing function or a JSON file
import parsedLeadersData from '../data/sampleParsedData.json';

export default function DashboardPage() {
  const [data, setData] = useState(parsedLeadersData);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leader Survey Dashboard</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Comparative Category Chart (Self vs Peer)
        </h2>
        <CategoryComparisonChart data={data} />
      </section>
    </div>
  );
}
