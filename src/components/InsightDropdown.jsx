import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function InsightDropdown({ leaderData }) {
  const [insight, setInsight] = useState("topStrength");

  const getTopStrength = () => {
    const maxEntry = Object.entries(leaderData.averageScores || {}).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max), ["", 0]
    );
    return `${maxEntry[0]} (${maxEntry[1].toFixed(2)})`;
  };

  const getLowestArea = () => {
    const minEntry = Object.entries(leaderData.averageScores || {}).reduce(
      (min, entry) => (entry[1] < min[1] ? entry : min), ["", Infinity]
    );
    return `${minEntry[0]} (${minEntry[1].toFixed(2)})`;
  };

  const getAlignmentScore = () => {
    const keys = Object.keys(leaderData.averageScores || {});
    const diffs = keys.map(
      (k) => Math.abs(leaderData.averageScores[k] - leaderData.selfAssessment[k])
    );
    const average = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return average.toFixed(2);
  };

  const getExcellentRatings = () => {
    const count = Object.values(leaderData.averageScores || {}).filter((v) => v === 5).length;
    return `${count} categories rated 5.0`;
  };

  const getContent = () => {
    switch (insight) {
      case "topStrength":
        return getTopStrength();
      case "lowestArea":
        return getLowestArea();
      case "alignment":
        return `Avg difference: ${getAlignmentScore()}`;
      case "excellent":
        return getExcellentRatings();
      default:
        return "";
    }
  };

  return (
    <Card className="bg-blue-50 transition hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-blue-700">Insight</p>
          <Select value={insight} onValueChange={setInsight}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Insight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="topStrength">Top Strength</SelectItem>
              <SelectItem value="lowestArea">Development Area</SelectItem>
              <SelectItem value="alignment">Alignment Score</SelectItem>
              <SelectItem value="excellent">Excellent Ratings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xl font-bold text-blue-900">{getContent()}</p>
      </CardContent>
    </Card>
  );
}
