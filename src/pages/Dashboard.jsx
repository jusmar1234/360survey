import React, { useState, useEffect } from "react";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  FaChartBar, FaTasks, FaComments as ChatIcon, FaUserTie,
  FaLine,
  FaCircle,
  FaMap,
  FaChartArea,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import CategoryComparisonChart from "../components/CategoryComparisonChart";
import InsightDropdown from "../components/InsightDropdown";
import PerCategoryChart from "../components/PerCategoryChart";
import { parseSurveySheets } from "../lib/excelParser";
import { toast, Toaster } from "sonner";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import LeaderComparisonChart from "../components/LeaderComparisonChart";
import TopLeadersRadarChart from "../components/TopLeadersRadarChart";



const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f", "#d0ed57", "#a4de6c"];

export default function Dashboard({ showWelcome }) {
  const [data, setData] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [viewMode, setViewMode] = useState("tabbed");
  const [tab, setTab] = useState("peer");
  const [cIndex, setCIndex] = useState(0);

  useEffect(() => {
    if (showWelcome) {
      toast("Welcome to the 360 Leader's Dashboard!", {
        description: "You can now upload a survey file to get started.",
        duration: 4000,
      });
    }
  }, [showWelcome]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const parsed = await parseSurveySheets(arrayBuffer);
        setData(parsed);
        setSelectedLeader(parsed[0]?.leader);
        toast.success("File imported successfully!");
      } catch (err) {
        toast.error("Failed to parse file.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

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
    <div className="flex space-x-6 p-7 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 min-h-screen">
      <Toaster position="top-center" richColors />

      <aside className="sticky top-4 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 flex flex-col justify-between">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Upload Survey File
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFile}
              className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900 dark:file:text-white"
            />
            <CloudArrowUpIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <FaUserTie className="text-3xl text-teal-600 dark:text-teal-300" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leader Panel</h2>
        </div>

        {data.length > 0 && (
          <>
            <div className="mb-4">
              <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-700 text-sm rounded-lg border border-gray-300 dark:border-gray-600">
                  <SelectValue>{selectedLeader}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {data.map((d) => (
                    <SelectItem key={d.leader} value={d.leader}>
                      {d.leader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <InsightDropdown leaderData={leaderData} />
            </div>

            <div className="mt-auto">
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">Display Mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("tabbed")}
                    className={`flex-1 py-1 rounded ${
                      viewMode === "tabbed"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    Tabbed
                  </button>
                  <button
                    onClick={() => setViewMode("scroll")}
                    className={`flex-1 py-1 rounded ${
                      viewMode === "scroll"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    One-Pager
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <motion.main className="flex-1 space-y-8">
        <header className="w-full text-center mb-2">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white tracking-tight drop-shadow-sm animate-fade-in">
            360 Leader's Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gain insights. Improve leadership.</p>
        </header>

        {data.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
            Please upload a survey file to view the dashboard.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard title="Avg 360 Score" value={avgPeer} tooltip="Average score from peers" />
              <MetricCard title="Avg Self Rating" value={avgSelf} tooltip="Average score from leader's self-assessment" />
            </div>

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

            {viewMode === "tabbed" ? (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="flex justify-center space-x-4 mb-4">
                    <IconTab value="peer" icon={<FaChartBar />} label="Peer vs Self" active={tab === "peer"} />
                    <IconTab value="per" icon={<FaTasks />} label="Per Category" active={tab === "per"} />
                    <IconTab value="comp" icon={<FaChartArea />} label="Comparison" active={tab === "per"} />
                    <IconTab value="rad" icon={<FaCircle />} label="Radar" active={tab === "per"} />

                  </TabsList>
                  <TabsContent value="peer">
                    <CategoryComparisonChart data={[leaderData]} />
                  </TabsContent>
                  <TabsContent value="per">
                    <PerCategoryChart leaderData={leaderData} />
                  </TabsContent>
                  <TabsContent value="comp">
                    <LeaderComparisonChart data={data}/>
                  </TabsContent>
                  <TabsContent value="rad">
                    <TopLeadersRadarChart data={data}/>
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

                {data.length > 0 && (
  <div className="space-y-8 mt-10">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">Admin Insights</h2>

    {/* Leader Comparison Overview */}
    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Leader Comparison Overview</h3>
      <LeaderComparisonChart data={data} />
    </section>
    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Leaders Radar Chart</h3>
      <TopLeadersRadarChart data={data} />
    </section>

   
  </div>
)}

              </div>
            )}

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
          </>
        )}
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