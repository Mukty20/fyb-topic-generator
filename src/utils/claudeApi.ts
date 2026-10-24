const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

export const callClaude = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error response:", errText);
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
};

interface StudentProfile {
  department: string;
  areaOfInterest: string;
  tools: string;
  skillLevel: number;
  hardware: string;
  complexityLevel: string;
  beginnerPreference?: string;
}

const beginnerToolSuggestion = (area: string): string => {
  const a = area.toLowerCase();
  if (a.includes("web")) return "HTML, CSS, and JavaScript";
  if (a.includes("data") || a.includes("artificial")) return "Python";
  if (a.includes("mobile")) return "Flutter (Dart)";
  if (a.includes("embedded") || a.includes("iot") || a.includes("robot") || a.includes("automation") || a.includes("sensor")) return "Arduino C/C++";
  if (a.includes("network")) return "Python (with basic networking libraries)";
  if (a.includes("database")) return "SQL with a simple HTML/JavaScript front-end";
  if (a.includes("cloud")) return "Python with a cloud provider's free tier";
  return "Python";
};

// ─────────────────────────────────────────────
// Stage 2 — Generate 3 topic suggestions, avoiding titles already issued
// to other students with the same department + area of interest
// ─────────────────────────────────────────────
export const generateTopics = async (
  profile: StudentProfile,
  excludedTitles: string[] = []
): Promise<string> => {
  const isBeginner = !!profile.beginnerPreference;

  const exclusionClause = excludedTitles.length > 0
    ? `\n\nThe following topic titles have already been issued to other students with this exact department and area of interest combination. Do NOT suggest any of these, or anything substantially similar in concept — generate genuinely different topics:\n${excludedTitles.map(t => `- "${t}"`).join("\n")}`
    : "";

  const prompt = isBeginner
    ? `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${profile.department}.

This student has NO prior programming experience. Their area of interest is ${profile.areaOfInterest}. They told you: "${profile.beginnerPreference}". Hardware available: ${profile.hardware}.

Recommend a single, specific, genuinely beginner-friendly language or framework suited to ${profile.areaOfInterest}, and generate exactly 3 project topics built around learning it while building. Every topic must be realistic for someone starting from zero, respect their hardware, and honor their stated preference about how much guidance/challenge they want.${exclusionClause}

For each topic provide: title, description (3-4 sentences, plain language, no jargon), relevance (2-3 sentences connecting to their stated preference), problemGrounding (2-3 sentences, general terms only, no invented citations, point to Stage 4 for real sources).

Respond with ONLY valid JSON, no markdown code fences: {"topics": [{"title": "...", "description": "...", "relevance": "...", "problemGrounding": "..."}]}`
    : `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${profile.department}.

Student profile: Area of interest: ${profile.areaOfInterest}. Main tool/language: ${profile.tools}. Self-rated proficiency: ${profile.skillLevel}/5. Hardware: ${profile.hardware}. Target complexity: ${profile.complexityLevel}.

Generate exactly 3 relevant, original, problem-solving final year project topics. Technical demand MUST respect hardware constraints — avoid heavy compute topics for low-spec hardware with no cloud access. Match difficulty to skill level.${exclusionClause}

For each topic provide: title, description (3-4 sentences), relevance (2-3 sentences), problemGrounding (2-3 sentences, general terms only, no invented citations, point to Stage 4 for real sources).

Respond with ONLY valid JSON, no markdown code fences: {"topics": [{"title": "...", "description": "...", "relevance": "...", "problemGrounding": "..."}]}`;

  return callClaude(prompt);

  // ---- MOCK FALLBACK (uncomment if live API fails right before presenting) ----
  // console.log("Prompting with profile:", profile, "Excluding:", excludedTitles);
  // if (isBeginner) {
  //   const suggestedTool = beginnerToolSuggestion(profile.areaOfInterest);
  //   return JSON.stringify({ topics: [
  //     { title: `Beginner-Friendly ${profile.areaOfInterest} Project Using ${suggestedTool}`, description: `...`, relevance: `...`, problemGrounding: `...` },
  //   ]});
  // }
};

// ─────────────────────────────────────────────
// Stage 3 — Generate topic development and roadmap
// ─────────────────────────────────────────────
export const generateTopicDevelopment = async (
  selectedTopic: string,
  discipline: string,
  complexityLevel: string
): Promise<string> => {
  const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities.

A student has selected this final year project topic: "${selectedTopic}"
Discipline: ${discipline}
Complexity Level: ${complexityLevel}

Help the student think through their topic by providing:
1. The core problem this topic addresses
2. Who is most affected by this problem
3. How the proposed system will solve it
4. What makes this approach different from existing solutions
5. A step by step roadmap of how to approach this project. For EACH step provide:
   - step: the step number
   - title: a short, clear step name
   - description: 2 to 4 sentences in plain language explaining what this step involves and why it matters, written for a student who has never done a final year project before
   - guidelines: an array of 3 to 4 specific, actionable bullet points
   - estimatedTime: a realistic time estimate (e.g. "3-5 days", "1-2 weeks"), scaled to the ${complexityLevel} complexity level

Respond with ONLY valid JSON, no markdown code fences:
{"problem": "...", "affected": "...", "solution": "...", "difference": "...", "roadmap": [{"step": 1, "title": "...", "description": "...", "guidelines": ["...","...","..."], "estimatedTime": "..."}]}`;

  return callClaude(prompt);
};

// ─────────────────────────────────────────────
// Stage 4 — Generate research kickstart
// ─────────────────────────────────────────────
export const generateResearchKickstart = async (
  selectedTopic: string,
  discipline: string
): Promise<string> => {
  const prompt = `You are an academic research advisor for final year undergraduate students in Nigerian universities.

A student is working on this final year project topic: "${selectedTopic}"
Discipline: ${discipline}

Help the student get started on their literature review by providing:
1. Five key concepts they should read about
2. Three related technology areas to explore
3. Five recommended search terms to use on Google Scholar

Respond with ONLY valid JSON, no markdown code fences:
{"keyConcepts": ["...","...","...","...","..."], "relatedAreas": ["...","...","..."], "searchTerms": ["...","...","...","...","..."]}`;

  return callClaude(prompt);
};

// ─────────────────────────────────────────────
// Stage 5 — Generate project timeline
// ─────────────────────────────────────────────
export const generateTimeline = async (
  selectedTopic: string,
  complexityLevel: string
): Promise<string> => {
  const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities.

A student is working on this final year project topic: "${selectedTopic}"
Complexity Level: ${complexityLevel}

Generate a realistic 6-phase project timeline for this student to complete their final year project from start to submission: Topic Selection and Proposal, Literature Review, System Analysis and Design, Development and Implementation, Testing and Evaluation, Documentation and Submission.

Adjust the duration of each phase based on complexity level — Basic gets shorter durations, Intermediate moderate, Advanced longer. For EACH phase provide:
- phase: the phase name
- activity: a description of the activity involved
- duration: a realistic week range (e.g. "Week 1 - 2")
- deliverables: an array of 3 concrete things the student should have completed by the end of this phase
- tips: one practical tip for this phase

Respond with ONLY valid JSON, no markdown code fences:
{"timeline": [{"phase": "...", "activity": "...", "duration": "...", "deliverables": ["...","...","..."], "tips": "..."}]}`;

  return callClaude(prompt);
};
