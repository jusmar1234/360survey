import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CategoryComparisonChart from "./CategoryComparisonChart";
import InsightDropdown from "./InsightDropdown";
import { FaStar, FaLightbulb, FaChartLine, FaComments, FaUser } from "react-icons/fa";
import PerCategoryChart from "./PerCategoryChart";

export default function Dashboard({ data }) {
  const [selectedLeader, setSelectedLeader] = useState(data?.[0]?.leader || "");
  const leaderData = data.find((d) => d.leader === selectedLeader);
  const chartData = leaderData ? [leaderData] : [];

  const avgSelfRating = leaderData
    ? (
        Object.values(leaderData.selfAssessment).reduce((a, b) => a + (b || 0), 0) /
        Object.values(leaderData.selfAssessment).filter((v) => v !== null).length
      ).toFixed(2)
    : "N/A";

  const avgPeerScore = leaderData
    ? (
        Object.values(leaderData.averageScores).reduce((a, b) => a + (b || 0), 0) /
        Object.values(leaderData.averageScores).filter((v) => v !== null).length
      ).toFixed(2)
    : "N/A";

  // Fix excellent ratings: count how many peer scores are exactly 5
  const excellentRatings = leaderData
    ? Object.values(leaderData.averageScores).filter((score) => score === 5).length
    : 0;

  // Insight descriptions to pass to InsightDropdown
  const insightDescriptions = {
    topStrength:
      "The category with the highest peer rating, showing the leader's greatest strength.",
    developmentArea:
      "The category with the lowest peer rating, highlighting areas for improvement.",
    alignmentScore:
      "Average difference between self and peer ratings, indicating the leader's self-awareness accuracy.",
    excellentRatings:
      "Number of categories rated 'Excellent' (5) by peers, reflecting top-rated skills.",
  };

  // Comments carousel state & logic
  const commentKeys = ["start", "stop", "continue", "general"];
  const [commentIndex, setCommentIndex] = useState(0);

  const nextComment = () => setCommentIndex((i) => (i + 1) % commentKeys.length);
  const prevComment = () => setCommentIndex((i) => (i - 1 + commentKeys.length) % commentKeys.length);

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold flex items-center space-x-3">
        <FaUser className="text-blue-600" />
        <span>360Survey Dashboard</span>
      </h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col max-w-xs w-full">
          <label htmlFor="leader-select" className="mb-1 text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaUser /> Select Leader:
          </label>
          <Select
            id="leader-select"
            value={selectedLeader}
            onValueChange={setSelectedLeader}
            className="w-full"
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a leader" />
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

        <div className="flex space-x-4">
          <button
            onClick={() => toast.success("File imported successfully!")}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Import File
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Export PDF</button>
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InsightDropdown
          leaderData={leaderData}
          descriptions={insightDescriptions}
          excellentRatings={excellentRatings}
          icons={{
            topStrength: <FaStar className="text-yellow-500" />,
            developmentArea: <FaLightbulb className="text-red-500" />,
            alignmentScore: <FaChartLine className="text-blue-500" />,
            excellentRatings: <FaStar className="text-green-500" />,
          }}
        />

        <Card className="bg-green-50 transition hover:shadow-md">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-green-700 flex items-center gap-1">
              <FaStar /> Average Peer Score
            </p>
            <p className="text-2xl font-bold text-green-900">{avgPeerScore}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 transition hover:shadow-md">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-purple-700 flex items-center gap-1">
              <FaStar /> Average Self Rating
            </p>
            <p className="text-2xl font-bold text-purple-900">{avgSelfRating}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="peerVsSelf" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="peerVsSelf">Peer vs Self</TabsTrigger>
          <TabsTrigger value="perCategory">Per Category</TabsTrigger>
        </TabsList>

        <TabsContent value="peerVsSelf">
          <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
            <CategoryComparisonChart data={chartData} />
          </div>
        </TabsContent>

        <TabsContent value="perCategory">
  <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
    <PerCategoryChart leaderData={leaderData} />
  </div>
</TabsContent>
      </Tabs>

      {/* Comments carousel */}
      <div className="relative max-w-3xl mx-auto">
        <Card className="transition hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaComments /> {commentKeys[commentIndex].charAt(0).toUpperCase() + commentKeys[commentIndex].slice(1)} Comments
              </h3>
              <div className="space-x-2">
                <button
                  onClick={prevComment}
                  aria-label="Previous comment"
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  ‹
                </button>
                <button
                  onClick={nextComment}
                  aria-label="Next comment"
                  className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  ›
                </button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-line min-h-[80px]">
              {leaderData?.comments?.[commentKeys[commentIndex]] || "No comments"}
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
