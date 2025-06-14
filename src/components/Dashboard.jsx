import React, { useState } from "react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  FaChartBar, FaTasks, FaComments as ChatIcon, FaUserTie,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import CategoryComparisonChart from "./CategoryComparisonChart";
import InsightDropdown from "./InsightDropdown";
import PerCategoryChart from "./PerCategoryChart";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#d0ed57", "#a4de6c"];

export default function Dashboard({ data }) {
  const [selectedLeader, setSelectedLeader] = useState(data?.[0]?.leader);
  const [viewMode, setViewMode] = useState("tabbed");
  const [tab, setTab] = useState("peer");
  const [cIndex, setCIndex] = useState(0);
  const [filter, setFilter] = useState("All");

  const leaderData = data.find(d => d.leader === selectedLeader);
  const commentKeys = ["start", "stop", "continue", "general"];

  const avgPeer = leaderData
    ? (Object.values(leaderData.averageScores).filter(v => v != null)
      .reduce((a, b) => a + b, 0) / Object.values(leaderData.averageScores).filter(v => v != null).length).toFixed(2) : "N/A";
  const avgSelf = leaderData
    ? (Object.values(leaderData.selfAssessment).filter(v => v != null)
      .reduce((a, b) => a + b, 0) / Object.values(leaderData.selfAssessment).filter(v => v != null).length).toFixed(2) : "N/A";

  const peerResponses = leaderData?.rawPeers || [];
  const relationshipMap = {};

  peerResponses.forEach(r => {
    const rel = r["Relationship with the Leader"]?.trim();
    if (rel) relationshipMap[rel] = (relationshipMap[rel] || 0) + 1;
  });

  const relationshipList = Object.entries(relationshipMap).map(([name, value]) => ({ name, value }));
  const totalRespondents = peerResponses.length;

  return (
    <div className="flex space-x-6 p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col items-center space-y-4">
        <FaUserTie className="text-5xl text-teal-600 dark:text-teal-300 mb-2" />
        <Select value={selectedLeader} onValueChange={setSelectedLeader}>
          <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-700 text-sm rounded-lg border border-gray-300 dark:border-gray-600">
            <SelectValue>{selectedLeader}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {data.map(d => (
              <SelectItem key={d.leader} value={d.leader}>
                {d.leader}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-full mt-4">
          <InsightDropdown leaderData={leaderData} />
        </div>
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={viewMode === "tabbed"}
              onChange={() => setViewMode("tabbed")}
            />
            Tabbed View
          </label>
          <label className="flex items-center gap-2 mt-1">
            <input
              type="radio"
              checked={viewMode === "scroll"}
              onChange={() => setViewMode("scroll")}
            />
            One-Pager View
          </label>
        </div>
      </aside>

      {/* Main */}
      <motion.main className="flex-1 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard title="Avg 360 Score" value={avgPeer} tooltip="Average score from peers" />
          <MetricCard title="Avg Self Rating" value={avgSelf} tooltip="Average score from leader's self-assessment" />
        </div>

        {/* Demographics Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="font-semibold text-lg dark:text-white mb-2">Relationship with the Leader</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Total Respondents: {totalRespondents}
          </p>
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={relationshipList}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  isAnimationActive
                >
                  {relationshipList.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Section */}
        {viewMode === "tabbed" ? (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex justify-center space-x-4 mb-4">
                <IconTab value="peer" icon={<FaChartBar />} label="Peer vs Self" active={tab === "peer"} />
                <IconTab value="per" icon={<FaTasks />} label="Per Category" active={tab === "per"} />
              </TabsList>
              <TabsContent value="peer">
                <CategoryComparisonChart data={[leaderData]} />
              </TabsContent>
              <TabsContent value="per">
                <PerCategoryChart leaderData={leaderData} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Peer vs Self</h2>
              <CategoryComparisonChart data={[leaderData]} />
            </section>
            <section className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <h2 className="text-xl font-semibold dark:text-white mb-4">Per Category</h2>
              <PerCategoryChart leaderData={leaderData} />
            </section>
          </div>
        )}

        {/* Comments Carousel */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
            <motion.div
              key={cIndex}
              className="space-y-4"
              initial={{ opacity: 0.5, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white uppercase">
                {commentKeys[cIndex]} Comments
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {leaderData?.comments?.[commentKeys[cIndex]] || "No comments."}
              </p>
            </motion.div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => setCIndex((cIndex + 3) % 4)}
                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
              >
                ‹
              </button>
              <button
                onClick={() => setCIndex((cIndex + 1) % 4)}
                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}

function MetricCard({ title, value, tooltip }) {
  return (
    <div className="relative group border-l-4 bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-lg shadow dark:from-blue-900 dark:to-blue-800 dark:text-white">
      <p className="text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <div className="absolute -top-2 right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {tooltip}
      </div>
    </div>
  );
}

function IconTab({ value, icon, label, active }) {
  return (
    <TabsTrigger
      value={value}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
        active ? "bg-blue-100 text-blue-700 font-semibold dark:bg-blue-900 dark:text-white" : "text-gray-600 dark:text-gray-300"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </TabsTrigger>
  );
}
