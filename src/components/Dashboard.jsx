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
import CategoryComparisonChart from "./CategoryComparisonChart";
import InsightDropdown from "./InsightDropdown";
import PerCategoryChart from "./PerCategoryChart";

export default function Dashboard({ data }) {
  const [selectedLeader, setSelectedLeader] = useState(data?.[0]?.leader);
  const leaderData = data.find(d => d.leader === selectedLeader);
  const [tab, setTab] = useState("peer");
  const [cIndex, setCIndex] = useState(0);
  const commentKeys = ["start", "stop", "continue", "general"];

  // Metrics
  const avgPeer = leaderData
    ? (Object.values(leaderData.averageScores).filter(v => v != null)
      .reduce((a, b) => a + b, 0) / Object.values(leaderData.averageScores).filter(v => v != null).length).toFixed(2) : "N/A";
  const avgSelf = leaderData
    ? (Object.values(leaderData.selfAssessment).filter(v => v != null)
      .reduce((a, b) => a + b, 0) / Object.values(leaderData.selfAssessment).filter(v => v != null).length).toFixed(2) : "N/A";

  return (
    <div className="flex space-x-6 p-6 bg-gray-50">
      {/* Sidebar (fixed-height) */}
      <aside className="w-60 h-96 bg-white rounded-xl shadow-lg p-4 flex flex-col items-center space-y-4">
        <FaUserTie className="text-5xl text-teal-600 mb-2" />
        <Select value={selectedLeader} onValueChange={setSelectedLeader}>
          <SelectTrigger className="w-full bg-gray-100 rounded-lg border border-gray-300">
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
      </aside>

      {/* Main Content */}
      <motion.main className="flex-1 space-y-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Avg Peer Score" value={avgPeer} bg="blue" />
          <MetricCard title="Avg Self Rating" value={avgSelf} bg="purple" />
          <MetricCard
            title="Excellent Ratings"
            value={
              leaderData
                ? Object.values(leaderData.averageScores).filter(v => v === 5).length
                : 0
            }
            bg="green"
          />
        </div>

        {/* Tabs with icon-over-label pills */}
        <div className="bg-white p-4 rounded-xl shadow">
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

        {/* Comment Carousel */}
        <div className="max-w-xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <motion.div
              key={cIndex}
              className="space-y-4"
              initial={{ opacity: 0.5, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 uppercase">
                {commentKeys[cIndex]} Comments
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
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

function MetricCard({ title, value, bg }) {
  const colors = {
    blue: "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400",
    purple: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400",
    green: "bg-gradient-to-br from-green-100 to-green-200 border-green-400",
  };
  return (
    <div className={`border-l-4 ${colors[bg]} p-5 rounded-lg shadow`}>
      <p className="text-sm text-gray-700 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function IconTab({ value, icon, label, active }) {
  return (
    <TabsTrigger value={value} className="flex flex-col items-center space-y-1">
      <div className={`text-2xl ${active ? "text-teal-600" : "text-gray-500"}`}>{icon}</div>
      <span className={`text-sm ${active ? "text-teal-600 font-semibold" : "text-gray-600"}`}>
        {label}
      </span>
    </TabsTrigger>
  );
}
