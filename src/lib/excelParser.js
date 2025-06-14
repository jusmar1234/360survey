import * as XLSX from "xlsx";

// Rating conversion map (case-insensitive)
const ratingMap = {
  "not demonstrated": 1,
  "partially demonstrated": 2,
  demonstrated: 3,
  "highly demonstrated": 4,
  excellent: 5,
};

// Keywords for metadata fields (to detect non-peer rows)
const metaKeys = ["name", "email", "timestamp", "relationship", "group", "division"];

// Category keyword mapping
const categoryKeywordsMap = {
  "Self Awareness": ["self awareness"],
  "Drive for Results": ["drive for results"],
  Leadership: ["leadership"],
  Communication: ["communication"],
  Teamwork: ["teamwork"],
  "Ownership and Accountability": ["ownership", "accountability"],
  "Business Acumen, Innovation and Growth Mindset": [
    "business acumen",
    "innovation",
    "growth mindset",
  ],
};

// Helpers
function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") || "";
}

function categoryKeyMatch(header, keywords) {
  const normalizedHeader = header.toLowerCase();
  return keywords.some((keyword) => normalizedHeader.includes(keyword));
}

function findColumnByKeyword(row, keyword) {
  return Object.keys(row).find((header) =>
    header.toLowerCase().includes(keyword.toLowerCase())
  );
}

function extractBracketText(str) {
  const match = str.match(/\[(.*?)\]/);
  return match ? match[1] : str;
}

function isSelfAssessmentRow(row) {
  const hasMeta = Object.entries(row).some(([key, val]) =>
    metaKeys.some((metaKey) => key.toLowerCase().includes(metaKey) && val?.toString().trim())
  );

  const hasRatings = Object.values(row).some(
    (val) =>
      typeof val === "string" &&
      ratingMap[val.trim().toLowerCase()] !== undefined
  );

  return !hasMeta && hasRatings;
}

export function parseSurveySheets(file) {
  const workbook = XLSX.read(file, { type: "binary" });
  const leadersData = [];

  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (json.length === 0) return;

    const leader = sheetName;

    // Find the last valid self-assessment row (blank name/meta but has answers)
    const reversed = [...json].reverse();
    const selfRow = reversed.find(isSelfAssessmentRow);

    if (!selfRow) {
      console.warn(`Leader "${leader}" (sheet #${sheetIndex + 1}) has no self-assessment data.`);
    }

    const selfRowIndex = selfRow ? json.indexOf(selfRow) : -1;

    const peerResponses = selfRowIndex >= 0
      ? json.slice(0, selfRowIndex)
      : json;

    const peerCount = peerResponses.length;

    // Average peer scores by category
    const averageScores = {};
    Object.entries(categoryKeywordsMap).forEach(([category, keywords]) => {
      const scores = [];
      peerResponses.forEach((row) => {
        Object.entries(row).forEach(([header, val]) => {
          if (categoryKeyMatch(header, keywords)) {
            const num = ratingMap[val?.trim().toLowerCase()] ?? null;
            if (num !== null) scores.push(num);
          }
        });
      });
      averageScores[category] =
        scores.length > 0
          ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
          : null;
    });

    // Self-assessment scores by category
    const selfAssessment = {};
    if (selfRow) {
      Object.entries(categoryKeywordsMap).forEach(([category, keywords]) => {
        const scores = [];
        Object.entries(selfRow).forEach(([header, val]) => {
          if (categoryKeyMatch(header, keywords)) {
            const num = ratingMap[val?.trim().toLowerCase()] ?? null;
            if (num !== null) scores.push(num);
          }
        });
        selfAssessment[category] =
          scores.length > 0
            ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
            : null;
      });
    }

    // Extract question-level data
    const questionHeaders = Object.keys(json[0]).filter((header) =>
      peerResponses.some((row) => {
        const val = row[header];
        return typeof val === "string" && ratingMap[val.trim().toLowerCase()] !== undefined;
      })
    );

    const questions = questionHeaders.map((header) => {
      const fullQuestion = header;
      const shortQuestion = extractBracketText(fullQuestion);

      const peerRatings = peerResponses
        .map((row) => ratingMap[row[header]?.trim().toLowerCase()] ?? null)
        .filter((v) => v !== null);

      const peerAverage =
        peerRatings.length > 0
          ? parseFloat((peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length).toFixed(2))
          : null;

      const selfRating = selfRow
        ? ratingMap[selfRow[header]?.trim().toLowerCase()] ?? null
        : null;

      return {
        fullQuestion,
        shortQuestion,
        peerRatings,
        peerAverage,
        selfRating,
      };
    });

    const sampleRow = peerResponses[0] || {};
    const stopKey = findColumnByKeyword(sampleRow, "STOP doing");
    const startKey = findColumnByKeyword(sampleRow, "START doing");
    const continueKey = findColumnByKeyword(sampleRow, "CONTINUE doing");
    const generalKey = findColumnByKeyword(sampleRow, "comments you would like to share");

    const comments = {
      stop: stopKey
        ? peerResponses.map((r) => r[stopKey]).filter((v) => v?.trim()).join("\n") || "No comments"
        : "No comments",
      start: startKey
        ? peerResponses.map((r) => r[startKey]).filter((v) => v?.trim()).join("\n") || "No comments"
        : "No comments",
      continue: continueKey
        ? peerResponses.map((r) => r[continueKey]).filter((v) => v?.trim()).join("\n") || "No comments"
        : "No comments",
      general: generalKey
        ? peerResponses.map((r) => r[generalKey]).filter((v) => v?.trim()).join("\n") || "No comments"
        : "No comments",
    };

    leadersData.push({
      leader,
      peerResponses: peerCount,
      averageScores,
      selfAssessment,
      questions,
      comments,
    });
  });

  return leadersData;
}
