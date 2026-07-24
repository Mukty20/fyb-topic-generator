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
  // Mock response — replace with real API call when you have credits
  console.log("Prompting with:", { discipline, areaOfInterest, tools, complexityLevel, realWorldProblem });

  return JSON.stringify({
    topics: [
      {
        title: `Smart ${areaOfInterest} System for ${discipline} Students`,
        description: `A ${complexityLevel.toLowerCase()} web-based platform that leverages ${tools} to address common challenges faced by ${discipline} students in Nigerian universities.`,
        relevance: `Directly addresses the real problem of ${realWorldProblem.slice(0, 60)}... using modern technology.`
      },
      {
        title: `Automated ${areaOfInterest} Management Platform`,
        description: `A system built with ${tools} that automates key processes in ${areaOfInterest}, reducing manual effort and improving efficiency for end users.`,
        relevance: `Highly relevant in Nigerian institutions where manual processes still dominate most workflows.`
      },
      {
        title: `${discipline} Student Performance Tracking System`,
        description: `A ${complexityLevel.toLowerCase()} dashboard that tracks and visualizes student academic performance using ${tools}, helping lecturers identify struggling students early.`,
        relevance: `Addresses the lack of data-driven academic support in most Nigerian tertiary institutions.`
      },
      {
        title: `Community Problem Reporting and Resolution System`,
        description: `A platform using ${tools} that allows community members to report local problems and track their resolution by relevant authorities.`,
        relevance: `Directly inspired by the real world problem of ${realWorldProblem.slice(0, 50)}... and provides a structured digital solution.`
      },
      {
        title: `${areaOfInterest}-Based Resource Allocation System`,
        description: `A ${complexityLevel.toLowerCase()} system built with ${tools} that intelligently allocates resources based on demand patterns and priority levels.`,
        relevance: `Solves a practical resource management challenge common across Nigerian universities and organizations.`
      }
    ]
  });
};

export const generateTopicDevelopment = async (
  selectedTopic: string,
  discipline: string,
  // complexityLevel: string
): Promise<string> => {
  console.log("Developing topic:", selectedTopic);

  return JSON.stringify({
    problem: `Many ${discipline} students and institutions struggle with inefficient processes that ${selectedTopic.toLowerCase()} aims to solve.`,
    affected: `Final year ${discipline} students, lecturers, and administrative staff at Nigerian tertiary institutions.`,
    solution: `The system will provide a structured, digital approach to solving this problem using modern web technologies, making the process faster, more accurate, and accessible.`,
    difference: `Unlike existing manual approaches, this system is automated, data-driven, and specifically designed for the Nigerian academic context.`,
    roadmap: [
      {
        step: 1,
        title: "Define the Problem",
        description: "Clearly identify the specific problem your system will solve and document it with evidence from your institution."
      },
      {
        step: 2,
        title: "Review Existing Solutions",
        description: "Research what tools or systems currently exist and identify the gaps your project will address."
      },
      {
        step: 3,
        title: "Design Your System",
        description: "Plan your system architecture, database structure, user interface, and data flow diagrams."
      },
      {
        step: 4,
        title: "Build and Test",
        description: "Develop the system module by module, testing each component before moving to the next."
      },
      {
        step: 5,
        title: "Evaluate and Document",
        description: "Test with real users, collect feedback, analyze results, and document your findings thoroughly."
      }
    ]
  });
};

export const generateResearchKickstart = async (
  selectedTopic: string,
  discipline: string
): Promise<string> => {
  console.log("Research kickstart for:", selectedTopic);

  return JSON.stringify({
    keyConcepts: [
      "System Analysis and Design",
      "Database Management Systems",
      "Web Application Development",
      "User Interface Design Principles",
      "Software Testing and Evaluation"
    ],
    relatedAreas: [
      "Human Computer Interaction",
      "Information Systems Management",
      "Cloud Computing and Deployment"
    ],
    searchTerms: [
      `${selectedTopic} Nigerian universities`,
      `${discipline} management system developing countries`
    ]
  });
};

export const generateTimeline = async (
  selectedTopic: string,
  complexityLevel: string
): Promise<string> => {
  console.log("Timeline for:", selectedTopic, complexityLevel);

  const durations: Record<string, string[]> = {
    Basic: ["Week 1 - 2", "Week 3 - 4", "Week 5 - 6", "Week 7 - 9", "Week 10 - 11", "Week 12 - 13"],
    Intermediate: ["Week 1 - 2", "Week 3 - 5", "Week 6 - 7", "Week 8 - 11", "Week 12 - 13", "Week 14 - 15"],
    Advanced: ["Week 1 - 2", "Week 3 - 6", "Week 7 - 8", "Week 9 - 13", "Week 14 - 15", "Week 16 - 17"]
  };

  const d = durations[complexityLevel] || durations["Intermediate"];

  return JSON.stringify({
    timeline: [
      { phase: "Phase 1 — Topic Selection and Proposal", activity: "Finalize your project topic, write your proposal, and get supervisor approval.", duration: d[0] },
      { phase: "Phase 2 — Literature Review", activity: "Research related works, review existing systems, and document your findings in Chapter Two.", duration: d[1] },
      { phase: "Phase 3 — System Analysis and Design", activity: "Analyze requirements, design architecture, flowcharts, ER diagrams, and UI mockups.", duration: d[2] },
      { phase: "Phase 4 — Development and Implementation", activity: "Build the system module by module, integrating all components and features.", duration: d[3] },
      { phase: "Phase 5 — Testing and Evaluation", activity: "Conduct functional testing and user acceptance testing, collect and analyze feedback.", duration: d[4] },
      { phase: "Phase 6 — Documentation and Submission", activity: "Complete all chapters, format the final report, and submit for assessment.", duration: d[5] }
    ]
  });
};