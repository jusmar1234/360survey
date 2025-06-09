import * as XLSX from "xlsx";

// Rating conversion map
const ratingMap = {
  "Not demonstrated": 1,
  "Not Demonstrated": 1,
  "Partially demonstrated": 2,
  "Partially Demonstrated": 2,
  "Demonstrated": 3,
  "Highly demonstrated": 4,
  "Highly Demonstrated": 4,
  "Excellent": 5,
};

// Category keyword mapping
const categoryKeywordsMap = {
  "Self Awareness": ["self awareness"],
  "Drive for Results": ["drive for results"],
  "Leadership": ["leadership"],
  "Communication": ["communication"],
  "Teamwork": ["teamwork"],
  "Ownership and Accountability": ["ownership", "accountability"],
  "Business Acumen, Innovation and Growth Mindset": [
    "business acumen",
    "innovation",
    "growth mindset",
  ],
};

// Normalize string (used for matching)
function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") || "";
}

// Check if header matches a category
function categoryKeyMatch(header, keywords) {
  const normalizedHeader = header.toLowerCase();
  return keywords.some((keyword) => normalizedHeader.includes(keyword));
}

// Find comment column dynamically
function findColumnByKeyword(row, keyword) {
  return Object.keys(row).find((header) =>
    header.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Extract text inside brackets from question string
function extractBracketText(str) {
  const match = str.match(/\[(.*?)\]/);
  return match ? match[1] : str;
}

export function parseSurveySheets(file) {
  const workbook = XLSX.read(file, { type: "binary" });
  const leadersData = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    if (json.length === 0) return;

    const leader = sheetName;
    const peerResponses = json.slice(0, json.length - 1);
    const peerCount = peerResponses.length;

    // Get self-assessment row (assumed last with valid rating)
    const selfRow = [...json].reverse().find((row) =>
      Object.values(row).some(
        (val) => typeof val === "string" && ratingMap[val.trim()]
      )
    );

    // Calculate average scores from peer responses by category
    const averageScores = {};
    Object.entries(categoryKeywordsMap).forEach(([category, keywords]) => {
      const scores = [];
      peerResponses.forEach((row) => {
        Object.entries(row).forEach(([header, val]) => {
          if (categoryKeyMatch(header, keywords)) {
            const num =
              typeof val === "string" ? ratingMap[val.trim()] ?? null : null;
            if (num !== null) scores.push(num);
          }
        });
      });
      averageScores[category] =
        scores.length > 0
          ? parseFloat(
              (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
            )
          : null;
    });

    // Self-assessment scores by category
    const selfAssessment = {};
    if (selfRow) {
      Object.entries(categoryKeywordsMap).forEach(([category, keywords]) => {
        const scores = [];
        Object.entries(selfRow).forEach(([header, val]) => {
          if (categoryKeyMatch(header, keywords)) {
            const num =
              typeof val === "string" ? ratingMap[val.trim()] ?? null : null;
            if (num !== null) scores.push(num);
          }
        });
        selfAssessment[category] =
          scores.length > 0
            ? parseFloat(
                (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
              )
            : null;
      });
    }

    // Extract question-level data
    // Use all question headers that have ratings
    const questionHeaders = Object.keys(json[0]).filter((header) =>
      peerResponses.some((row) => {
        const val = row[header];
        return typeof val === "string" && ratingMap[val.trim()] !== undefined;
      })
    );

    const questions = questionHeaders.map((header) => {
      const fullQuestion = header;
      const shortQuestion = extractBracketText(fullQuestion);

      // Collect all peer ratings for this question
      const peerRatings = peerResponses
        .map((row) => {
          const val = row[header];
          return typeof val === "string" ? ratingMap[val.trim()] ?? null : null;
        })
        .filter((v) => v !== null);

      const peerAverage =
        peerRatings.length > 0
          ? parseFloat(
              (peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length).toFixed(2)
            )
          : null;

      // Self rating for this question if available
      let selfRating = null;
      if (selfRow) {
        const val = selfRow[header];
        selfRating =
          typeof val === "string" ? ratingMap[val.trim()] ?? null : null;
      }

      return {
        fullQuestion,
        shortQuestion,
        peerRatings,
        peerAverage,
        selfRating,
      };
    });

    // Flexible comment extraction
    const sampleRow = peerResponses[0] || {};
    const stopKey = findColumnByKeyword(sampleRow, "STOP doing");
    const startKey = findColumnByKeyword(sampleRow, "START doing");
    const continueKey = findColumnByKeyword(sampleRow, "CONTINUE doing");
    const generalKey = findColumnByKeyword(sampleRow, "comments you would like to share");

    const comments = {
      stop: stopKey
        ? peerResponses
            .map((r) => r[stopKey])
            .filter((v) => v?.trim())
            .join("\n") || "No comments"
        : "No comments",
      start: startKey
        ? peerResponses
            .map((r) => r[startKey])
            .filter((v) => v?.trim())
            .join("\n") || "No comments"
        : "No comments",
      continue: continueKey
        ? peerResponses
            .map((r) => r[continueKey])
            .filter((v) => v?.trim())
            .join("\n") || "No comments"
        : "No comments",
      general: generalKey
        ? peerResponses
            .map((r) => r[generalKey])
            .filter((v) => v?.trim())
            .join("\n") || "No comments"
        : "No comments",
    };

    leadersData.push({
      leader,
      averageScores,
      peerResponses: peerCount,
      selfAssessment,
      comments,
      questions,    // Added question-level detail here
    });
  });

  return leadersData;
}
