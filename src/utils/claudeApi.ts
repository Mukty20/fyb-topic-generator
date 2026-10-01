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
    if (!response.ok) throw new Error(`API error: ${response.status}`);
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

// Stage 2 — Generate 3 topic suggestions
export const generateTopics = async (profile: StudentProfile): Promise<string> => {
  const isBeginner = !!profile.beginnerPreference;

  // ---- REAL PROMPT (activate when credits are funded) ----
  // const prompt = isBeginner
  //   ? `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${profile.department}.
  //
  // This student has NO prior programming experience. Their area of interest is ${profile.areaOfInterest}. They told you: "${profile.beginnerPreference}". Hardware available: ${profile.hardware}.
  //
  // Recommend a single, specific, genuinely beginner-friendly language or framework suited to ${profile.areaOfInterest}, and generate exactly 3 project topics built around learning it while building. Every topic must be realistic for someone starting from zero, respect their hardware, and honor their stated preference about how much guidance/challenge they want.
  //
  // For each topic provide: title, description (3-4 sentences, plain language, no jargon), relevance (2-3 sentences connecting to their stated preference), problemGrounding (2-3 sentences, general terms only, no invented citations, point to Stage 4 for real sources).
  //
  // Respond with ONLY valid JSON: {"topics": [{"title": "...", "description": "...", "relevance": "...", "problemGrounding": "..."}]}`
  //   : `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${profile.department}.
  //
  // Student profile: Area of interest: ${profile.areaOfInterest}. Main tool/language: ${profile.tools}. Self-rated proficiency: ${profile.skillLevel}/5. Hardware: ${profile.hardware}. Target complexity: ${profile.complexityLevel}.
  //
  // Generate exactly 3 relevant, original, problem-solving final year project topics. Technical demand MUST respect hardware constraints — avoid heavy compute topics for low-spec hardware with no cloud access. Match difficulty to skill level.
  //
  // For each topic provide: title, description (3-4 sentences), relevance (2-3 sentences), problemGrounding (2-3 sentences, general terms only, no invented citations, point to Stage 4 for real sources).
  //
  // Respond with ONLY valid JSON: {"topics": [{"title": "...", "description": "...", "relevance": "...", "problemGrounding": "..."}]}`;
  // return callClaude(prompt);

  // ---- MOCK (active now) ----
  console.log("Prompting with profile:", profile);

  if (isBeginner) {
    const suggestedTool = beginnerToolSuggestion(profile.areaOfInterest);
    return JSON.stringify({
      topics: [
        {
          title: `Beginner-Friendly ${profile.areaOfInterest} Project Using ${suggestedTool}`,
          description: `This project is designed for someone starting from scratch. You'll learn ${suggestedTool} as part of building a ${profile.complexityLevel.toLowerCase()}-level system focused on ${profile.areaOfInterest.toLowerCase()}. Every step is broken down so you pick up the core programming concepts you need along the way, rather than assuming prior knowledge.`,
          relevance: `You told us "${profile.beginnerPreference}" — ${suggestedTool} has a gentle learning curve and strong beginner documentation, which makes it a realistic starting point that matches what you asked for.`,
          problemGrounding: `${profile.areaOfInterest} is an area where clear, well-documented tooling is genuinely valuable for newcomers entering the field. Stage 4 (Research Kickstart) will help you find real, citable academic sources that discuss this problem space in more depth.`,
        },
        {
          title: `Guided Step-by-Step ${profile.areaOfInterest} System`,
          description: `Built with ${suggestedTool}, this project is structured as a sequence of small, achievable milestones rather than one large build. Each milestone introduces one new concept at a time, so you always know exactly what you're learning and why.`,
          relevance: `Given this is your first hands-on programming project, a milestone-based structure keeps things manageable and gives you regular wins to build confidence as you go.`,
          problemGrounding: `Structured, incremental learning is a well-documented and effective approach for first-time programmers tackling a real project. Use Stage 4 to locate specific academic sources on this for your literature review.`,
        },
        {
          title: `Simple ${profile.areaOfInterest} Tool with Room to Grow`,
          description: `This topic starts with a genuinely small, working version of a ${profile.areaOfInterest.toLowerCase()} tool built in ${suggestedTool}, with clearly optional stretch features if you want to push further once the basics click.`,
          relevance: `This gives you a safe, completable core project first, with the option to challenge yourself further only once you're ready — matching a beginner-friendly pace without capping your ambition.`,
          problemGrounding: `Starting small and expanding scope incrementally is a recognized, defensible approach in student software projects, particularly for first-time builders. Stage 4 will help you ground this further with real sources.`,
        },
      ],
    });
  }

  const skillWord = profile.skillLevel <= 2 ? "still building confidence with" : profile.skillLevel === 3 ? "reasonably comfortable with" : "confident with";
  const hardwareNote = profile.hardware.includes("Low-spec")
    ? " kept lightweight to run comfortably on your hardware"
    : profile.hardware.includes("cloud")
    ? " able to take advantage of your cloud compute access if needed"
    : "";

  return JSON.stringify({
    topics: [
      {
        title: `${profile.areaOfInterest} Platform for ${profile.department} Students`,
        description: `This project involves designing and building a ${profile.complexityLevel.toLowerCase()}-level system using ${profile.tools}, focused on ${profile.areaOfInterest.toLowerCase()}${hardwareNote}. The system would allow users to interact through a structured interface, process and store relevant data, and return organized, useful output.`,
        relevance: `You said you are ${skillWord} ${profile.tools}, and this topic is scoped to match — it gives you room to apply what you already know in ${profile.areaOfInterest} while staying within your ${profile.complexityLevel.toLowerCase()} target.`,
        problemGrounding: `Systems in the ${profile.areaOfInterest.toLowerCase()} space are a well-recognized area of ongoing academic and industry work, particularly around usability, data handling, and accessibility. Stage 4 (Research Kickstart) will help you find real, citable literature that documents this problem space in more depth.`,
      },
      {
        title: `Smart ${profile.areaOfInterest} Tool for ${profile.department}`,
        description: `This topic focuses on a ${profile.complexityLevel.toLowerCase()}-level tool built with ${profile.tools} that automates or simplifies a specific task within ${profile.areaOfInterest}. It emphasizes clean data flow and a genuinely usable interface over unnecessary complexity.`,
        relevance: `Given your ${profile.skillLevel}/5 self-rated skill level, this topic is calibrated to stretch you slightly without being unrealistic, and stays firmly within ${profile.areaOfInterest}.`,
        problemGrounding: `Automation and tooling gaps are a consistently documented challenge across most technical domains, including ${profile.areaOfInterest.toLowerCase()}. Use Stage 4 to locate specific, real academic sources that back this up for your literature review.`,
      },
      {
        title: `${profile.department} ${profile.areaOfInterest} System with ${profile.complexityLevel} Architecture`,
        description: `This topic centers on a system architected specifically at a ${profile.complexityLevel.toLowerCase()} level, using ${profile.tools} as the core technology. It is designed so its scope can be clearly defended and demonstrated within a single academic session.`,
        relevance: `This matches your stated complexity target directly, and keeps the technology stack limited to tools you've already told us you know — ${profile.tools}.`,
        problemGrounding: `Scoping a system correctly to a student's skill level and available hardware is itself a recognized challenge in academic project supervision. This topic is deliberately sized to be defensible and completable, with real supporting literature to be gathered in Stage 4.`,
      },
    ],
  });
};

// Stage 3 — unchanged
export const generateTopicDevelopment = async (
  selectedTopic: string, discipline: string, complexityLevel: string
): Promise<string> => {
  console.log("Developing topic:", selectedTopic, "| complexity:", complexityLevel);
  return JSON.stringify({
    problem: `Many ${discipline} students and institutions struggle with inefficient processes that "${selectedTopic}" aims to solve.`,
    affected: `Final year ${discipline} students, lecturers, and administrative staff at Nigerian tertiary institutions.`,
    solution: `The system will provide a structured, digital approach to solving this problem using modern web technologies, making the process faster, more accurate, and accessible.`,
    difference: `Unlike existing manual approaches, this system is automated, data-driven, and specifically designed for the Nigerian academic context.`,
    roadmap: [
      { step: 1, title: "Define the Problem", description: "Before writing any code, you need to clearly pin down exactly what problem you're solving and why it matters.", guidelines: ["Write a one-paragraph problem statement in plain language", "List 3-5 concrete examples of the problem happening in real life", "Identify exactly who is affected and how often", "Get feedback from at least 2 people who deal with this problem"], estimatedTime: "3-5 days" },
      { step: 2, title: "Review Existing Solutions", description: "This step protects you from building something that already exists, and becomes the foundation of your literature review.", guidelines: ["Search for 3-5 existing tools or systems addressing a similar problem", "Note what each one does well and where it falls short", "Write down what your system will do differently or better", "Save every source you review — you'll need to cite these later"], estimatedTime: "1 week" },
      { step: 3, title: "Design Your System", description: "This is where your idea becomes a concrete plan, before you start building.", guidelines: ["Sketch your system architecture", "Design your database structure", "Map out the user flow step by step", "Choose your tech stack and confirm you can realistically use it"], estimatedTime: "1-2 weeks" },
      { step: 4, title: "Build and Test", description: "Build in small, testable pieces rather than everything at once.", guidelines: ["Build one feature completely before starting the next", "Test each feature as you build it", "Keep a simple weekly log for Chapter Four later", "Back up your code regularly using Git"], estimatedTime: "4-6 weeks" },
      { step: 5, title: "Evaluate and Document", description: "Prove your system works and write up what you found.", guidelines: ["Test with real users, even just classmates", "Collect feedback using a simple questionnaire", "Take screenshots of every major feature working", "Write up your results honestly, including what didn't work"], estimatedTime: "1-2 weeks" },
    ],
  });
};

// Stage 4 — unchanged
export const generateResearchKickstart = async (selectedTopic: string, discipline: string): Promise<string> => {
  console.log("Research kickstart for:", selectedTopic);
  return JSON.stringify({
    keyConcepts: ["System Analysis and Design", "Database Management Systems", "Web Application Development", "User Interface Design Principles", "Software Testing and Evaluation"],
    relatedAreas: ["Human Computer Interaction", "Information Systems Management", "Cloud Computing and Deployment"],
    searchTerms: [
      `${selectedTopic} Nigerian universities`,
      `${discipline} management system developing countries`,
      `web-based ${discipline} system design and implementation`,
      `${selectedTopic} system evaluation`,
      `intelligent recommendation systems in education`,
    ],
  });
};

// Stage 5 — unchanged
export const generateTimeline = async (selectedTopic: string, complexityLevel: string): Promise<string> => {
  console.log("Timeline for:", selectedTopic, complexityLevel);
  const durations: Record<string, string[]> = {
    Basic: ["Week 1 - 2", "Week 3 - 4", "Week 5 - 6", "Week 7 - 9", "Week 10 - 11", "Week 12 - 13"],
    Intermediate: ["Week 1 - 2", "Week 3 - 5", "Week 6 - 7", "Week 8 - 11", "Week 12 - 13", "Week 14 - 15"],
    Advanced: ["Week 1 - 2", "Week 3 - 6", "Week 7 - 8", "Week 9 - 13", "Week 14 - 15", "Week 16 - 17"],
  };
  const d = durations[complexityLevel] || durations["Intermediate"];
  return JSON.stringify({
    timeline: [
      { phase: "Phase 1 — Topic Selection and Proposal", activity: "Finalize your topic, write your proposal, and get supervisor approval.", duration: d[0], deliverables: ["An approved project proposal document", "A one-paragraph problem statement", "Supervisor's go-ahead to proceed"], tips: "Get supervisor feedback early, even on a rough draft." },
      { phase: "Phase 2 — Literature Review", activity: "Research related works and write Chapter Two.", duration: d[1], deliverables: ["A verified reference list", "A completed draft of Chapter Two", "A clear research gap statement"], tips: "Verify every citation on Google Scholar before including it." },
      { phase: "Phase 3 — System Analysis and Design", activity: "Design architecture, database, and diagrams for Chapter Three.", duration: d[2], deliverables: ["System architecture diagram", "ER diagram", "Completed Chapter Three draft"], tips: "Sketch on paper first before using a diagramming tool." },
      { phase: "Phase 4 — Development and Implementation", activity: "Build the system module by module, testing as you go.", duration: d[3], deliverables: ["Working authentication and data layer", "All core features functional and tested", "Regular Git commits"], tips: "Build in small, working slices rather than everything at once." },
      { phase: "Phase 5 — Testing and Evaluation", activity: "Conduct functional and user acceptance testing, analyze results.", duration: d[4], deliverables: ["Completed functional testing table", "Real user questionnaire responses", "Written discussion of findings"], tips: "Take screenshots as you test — you'll need them for Chapter Four." },
      { phase: "Phase 6 — Documentation and Submission", activity: "Finalize all chapters, format the report, prepare for defense.", duration: d[5], deliverables: ["Fully formatted final report", "Rehearsed defense presentation", "Submitted project"], tips: "Read your report out loud once before submitting to catch errors." },
    ],
  });
};