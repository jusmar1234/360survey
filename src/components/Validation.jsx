export default function validateSurveyData(data) {
    const errors = [];
  
    if (!Array.isArray(data) || data.length === 0) {
      errors.push("No data found. Please upload a valid Excel file with survey sheets.");
      return errors;
    }
  
    data.forEach((leaderData, idx) => {
      const prefix = `Leader "${leaderData.leader}" (sheet #${idx + 1})`;
  
      if (!leaderData.averageScores || Object.keys(leaderData.averageScores).length === 0) {
        errors.push(`${prefix} has no average peer scores.`);
      }
  
      if (!leaderData.selfAssessment || Object.keys(leaderData.selfAssessment).length === 0) {
        errors.push(`${prefix} has no self-assessment data.`);
      }
  
      if (!Array.isArray(leaderData.questions) || leaderData.questions.length === 0) {
        errors.push(`${prefix} has no question-level data.`);
      }
  
      if (leaderData.peerResponses === 0) {
        errors.push(`${prefix} has no peer responses.`);
      }
  
      ["stop", "start", "continue", "general"].forEach((key) => {
        if (!leaderData.comments[key] || leaderData.comments[key] === "No comments") {
          errors.push(`${prefix} is missing ${key} comments.`);
        }
      });
    });
  
    return errors;
  }
  