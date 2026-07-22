const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

// Main function to call Claude API
export const callClaude = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
};

// Stage 2 — Generate 5 topic suggestions
export const generateTopics = async (
  discipline: string,
  areaOfInterest: string,
  tools: string,
  complexityLevel: string,
  realWorldProblem: string
): Promise<string> => {
  const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${discipline}.

A student has provided the following profile:
- Area of Interest: ${areaOfInterest}
- Tools and Languages they know: ${tools}
- Preferred Complexity Level: ${complexityLevel}
- Real world problem they have observed: ${realWorldProblem}

Generate exactly 5 relevant, original, and problem-solving final year project topic suggestions tailored specifically to this student's profile.

For each topic provide:
1. Topic Title
2. Brief Description (2 sentences)
3. Why it is relevant right now (1 sentence)

Format your response as JSON only, no extra text, like this:
{
  "topics": [
    {
      "title": "topic title here",
      "description": "description here",
      "relevance": "relevance here"
    }
  ]
}`;

  return callClaude(prompt);
};

// Stage 3 — Generate topic development and roadmap
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
5. A step by step roadmap of how to approach this project

Format your response as JSON only, no extra text, like this:
{
  "problem": "the core problem here",
  "affected": "who is affected here",
  "solution": "how it solves the problem here",
  "difference": "what makes it different here",
  "roadmap": [
    {
      "step": 1,
      "title": "step title here",
      "description": "step description here"
    }
  ]
}`;

  return callClaude(prompt);
};

// Stage 4 — Generate research kickstart
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
3. Two recommended search terms to use on Google Scholar

Format your response as JSON only, no extra text, like this:
{
  "keyConcepts": ["concept 1", "concept 2", "concept 3", "concept 4", "concept 5"],
  "relatedAreas": ["area 1", "area 2", "area 3"],
  "searchTerms": ["search term 1", "search term 2"]
}`;

  return callClaude(prompt);
};

// Stage 5 — Generate project timeline
export const generateTimeline = async (
  selectedTopic: string,
  complexityLevel: string
): Promise<string> => {
  const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities.

A student is working on this final year project topic: "${selectedTopic}"
Complexity Level: ${complexityLevel}

Generate a realistic phase by phase project timeline for this student to complete their final year project from start to submission.

Adjust the duration of each phase based on the complexity level:
- Basic: shorter durations
- Intermediate: moderate durations  
- Advanced: longer durations

Format your response as JSON only, no extra text, like this:
{
  "timeline": [
    {
      "phase": "Phase 1 — Topic Selection and Proposal",
      "activity": "activity description here",
      "duration": "Week 1 - 2"
    }
  ]
}

Include these phases: Topic Selection and Proposal, Literature Review, System Analysis and Design, Development and Implementation, Testing and Evaluation, Documentation and Submission.`;

  return callClaude(prompt);
};