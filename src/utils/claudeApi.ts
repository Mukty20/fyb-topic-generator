const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

// Base Claude API caller — used when you have credits
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
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
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

// Full student profile shape passed into Stage 2
interface StudentProfile {
  discipline: string;
  areaOfInterest: string;
  sparkMotivation: string;
  confidentSkill: string;
  tools: string;
  stretchAppetite: string;
  projectWhy: string;
  careerDirection: string;
  realWorldProblem: string;
  whoElseAffected: string;
  problemIntensity: string;
  resourceReality: string;
  preference: string;
  structurePreference: string;
  complexityLevel: string;
}

// Stage 2 — Generate 5 topic suggestions
export const generateTopics = async (profile: StudentProfile): Promise<string> => {
  // ---- REAL PROMPT (used once callClaude is live) ----
  // const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities studying ${profile.discipline}.
  
  // Here is everything this specific student has shared about themselves:
  // - Area of interest: ${profile.areaOfInterest}
  // - Why they're actually in this area: ${profile.sparkMotivation}
  // - What they can already confidently build/explain: ${profile.confidentSkill}
  // - Tools and languages they know: ${profile.tools}
  // - Their appetite for learning something new: ${profile.stretchAppetite}
  // - What they most want this project to do for them: ${profile.projectWhy}
  // - Their likely path after graduation: ${profile.careerDirection}
  // - A real problem they've personally observed: ${profile.realWorldProblem}
  // - Who else is affected by this problem: ${profile.whoElseAffected}
  // - How much this problem actually bothers them: ${profile.problemIntensity}
  // - Their internet/electricity reliability: ${profile.resourceReality}
  // - Whether they want to build new or improve existing: ${profile.preference}
  // - Whether they want clear structure or room to explore: ${profile.structurePreference}
  // - Target complexity level: ${profile.complexityLevel}
  
  // Generate exactly 5 relevant, original, problem-solving final year project topics tailored specifically to THIS student — not generic suggestions. Let their real-world problem, their motivation, and their career direction meaningfully shape at least some of the topics. If their resource reality suggests unreliable internet/power, avoid suggesting topics that would be hard for them to personally demo and test. If they said they want to build something new, don't suggest an "improve existing system" topic, and vice versa.
  
  // For each topic provide:
  // 1. Topic Title
  // 2. Description — 3 to 4 full sentences explaining clearly what the project actually is, what it does, and roughly how it works. Write it so a student who has never heard of this topic could still understand it.
  // 3. Why it matters — 3 to 4 full sentences that connect this specific topic back to what the student told you about themselves. Do not write generic relevance — make it clearly about THEM.
  
  // Format your response as JSON only, no extra text, like this:
  // { "topics": [ { "title": "...", "description": "...", "relevance": "..." } ] }`;
  // return callClaude(prompt);

  // ---- MOCK RESPONSE (active now — no API credits yet) ----
  console.log("Prompting with full profile:", profile);

  const buildAction = profile.preference?.toLowerCase().includes("new")
    ? "A brand new"
    : "An improved version of an existing";

  return JSON.stringify({
    topics: [
      {
        title: `${buildAction} ${profile.areaOfInterest} Platform for ${profile.discipline} Students`,
        description: `This project involves designing and building a ${profile.complexityLevel.toLowerCase()} web-based system using ${profile.tools} that ${buildAction.toLowerCase()} tool for the problem you described. The system would allow users to interact with a structured interface, store their data securely, and receive useful, organized output tailored to their needs. It brings together the technical foundation you already have with a genuinely useful, real-world application rather than a purely theoretical exercise.`,
        relevance: `You specifically mentioned that ${profile.realWorldProblem.slice(0, 70)}... affects ${profile.whoElseAffected}, and you rated this as "${profile.problemIntensity}." This topic puts that exact problem at the center of your final year project instead of treating it as an afterthought. It also fits your stated goal of wanting this project to "${profile.projectWhy}," since a working solution to a problem you personally care about is far more convincing to a panel — and to yourself — than a generic academic exercise.`,
      },
      {
        title: `${profile.areaOfInterest}-Based Solution for Community Impact`,
        description: `This topic centers on building a system that addresses a recognizable community-level challenge using ${profile.tools}, with a scope calibrated to your ${profile.complexityLevel.toLowerCase()} target. The system would be designed around real usage patterns rather than assumptions, meaning you'd need to think carefully about who actually uses it and how. Given that you said you're "${profile.stretchAppetite.toLowerCase()}" about learning new things, this topic is scoped to stretch your ability in ${profile.tools} just enough without becoming overwhelming.`,
        relevance: `Since your career direction points toward "${profile.careerDirection}," this topic is shaped to produce something genuinely presentable in that context — not just a school project that gets forgotten after submission. It directly reflects the kind of practical, visible impact that stands out whether you're applying for jobs locally or showing your portfolio internationally.`,
      },
      {
        title: `Lightweight ${profile.areaOfInterest} Tool for Low-Connectivity Environments`,
        description: `This project focuses on building a system that remains fully usable even when internet or power access is inconsistent — a real design constraint, not an afterthought. It would use ${profile.tools} with careful attention to minimizing unnecessary network calls and handling interruptions gracefully. The result is a more resilient, practical system that reflects a real understanding of the environment it will actually be used in.`,
        relevance: `You told us your internet and electricity reliability is "${profile.resourceReality}" — most generic project suggestions completely ignore this and assume constant connectivity, which makes them harder for you to build, test, and demo confidently. This topic is built around your actual working conditions, which also makes for a genuinely interesting technical discussion point during your defense.`,
      },
      {
        title: `${profile.discipline} Support System Addressing Everyday Friction`,
        description: `This topic involves designing a targeted system using ${profile.tools} that directly tackles the specific problem you personally flagged. The system would take the everyday frustration you described and turn it into a structured set of features — covering how the problem is currently handled, what breaks down, and how your system changes that. It's deliberately scoped to solve one problem well rather than many problems poorly.`,
        relevance: `You rated this problem as "${profile.problemIntensity}," and problems you personally care about are consistently easier to stay motivated on through a long project timeline than abstract, assigned ones. Building something you'd actually want to use yourself tends to produce sharper thinking and a stronger final defense, because you're not just describing a system — you're describing something real to you.`,
      },
      {
        title: `${profile.areaOfInterest} System with ${
          profile.structurePreference?.toLowerCase().includes("explore")
            ? "Flexible, Exploratory"
            : "Clearly Structured"
        } Architecture`,
        description: `This topic is shaped around how you said you actually like to work: ${profile.structurePreference.toLowerCase()}. It gives you a ${profile.complexityLevel.toLowerCase()} scope built with ${profile.tools}${
          profile.confidentSkill ? `, leaning on your existing strength in "${profile.confidentSkill}"` : ""
        } as a foundation to build outward from. The architecture is deliberately left ${
          profile.structurePreference?.toLowerCase().includes("explore")
            ? "flexible enough for you to make your own design decisions along the way"
            : "clearly mapped out so you always know what to build next"
        }.`,
        relevance: `This matches both your target ambition level and your career direction toward ${profile.careerDirection}, meaning the finished project should feel like a natural next step for you rather than a forced academic detour. It's designed to be something you can speak to confidently and specifically, because every design decision traces back to something you actually told us about how you work.`,
      },
    ],
  });
};

// Stage 3 — Generate topic development and roadmap
export const generateTopicDevelopment = async (
  selectedTopic: string,
  discipline: string,
  // complexityLevel: string
): Promise<string> => {
  // ---- REAL PROMPT (used once callClaude is live) ----
  // const prompt = `You are an academic project advisor for final year undergraduate students in Nigerian universities.
  
  // A student has selected this final year project topic: "${selectedTopic}"
  // Discipline: ${discipline}
  // Complexity Level: ${complexityLevel}
  
  // Help the student think through their topic by providing:
  // 1. The core problem this topic addresses
  // 2. Who is most affected by this problem
  // 3. How the proposed system will solve it
  // 4. What makes this approach different from existing solutions
  // 5. A step by step roadmap of how to approach this project. For EACH step provide:
  //    - step: the step number
  //    - title: a short, clear step name
  //    - description: 2 to 4 sentences in plain language explaining what this step actually involves and why it matters at this point in the project — written for a student who has never done a final year project before
  //    - guidelines: an array of 3 to 4 specific, actionable bullet points on exactly how to approach this step
  //    - estimatedTime: a realistic time estimate for this step (e.g. "3-5 days", "1-2 weeks"), scaled to the ${complexityLevel} complexity level
  
  // Format your response as JSON only, no extra text, like this:
  // { "problem": "...", "affected": "...", "solution": "...", "difference": "...",
  //   "roadmap": [ { "step": 1, "title": "...", "description": "...", "guidelines": ["...","...","..."], "estimatedTime": "..." } ] }`;
  // return callClaude(prompt);

  // ---- MOCK RESPONSE (active now — no API credits yet) ----
  console.log("Developing topic:", selectedTopic);

  return JSON.stringify({
    problem: `Many ${discipline} students and institutions struggle with inefficient processes that "${selectedTopic}" aims to solve.`,
    affected: `Final year ${discipline} students, lecturers, and administrative staff at Nigerian tertiary institutions.`,
    solution: `The system will provide a structured, digital approach to solving this problem using modern web technologies, making the process faster, more accurate, and accessible.`,
    difference: `Unlike existing manual approaches, this system is automated, data-driven, and specifically designed for the Nigerian academic context.`,
    roadmap: [
      {
        step: 1,
        title: "Define the Problem",
        description:
          "Before writing any code, you need to clearly pin down exactly what problem you're solving and why it matters. This step is about turning a vague idea into something specific enough that a supervisor or panel member instantly understands it — and specific enough that you know exactly when you've actually solved it.",
        guidelines: [
          "Write a one-paragraph problem statement in plain language, avoiding jargon",
          "List 3-5 concrete examples of the problem happening in real life",
          "Identify exactly who is affected and how often",
          "Get feedback from at least 2 people who deal with this problem to confirm it's real",
        ],
        estimatedTime: "3-5 days",
      },
      {
        step: 2,
        title: "Review Existing Solutions",
        description:
          "This step protects you from building something that already exists, and helps you clearly articulate what makes your approach different. It also becomes the foundation of your literature review in Chapter Two, so doing it properly now saves you time later.",
        guidelines: [
          "Search for at least 3-5 existing tools or systems that attempt to solve a similar problem",
          "Note what each one does well and where it falls short",
          "Write down specifically what your system will do differently or better",
          "Save every source you review  you'll need to cite these later",
        ],
        estimatedTime: "1 week",
      },
      {
        step: 3,
        title: "Design Your System",
        description:
          "This is where your idea becomes a concrete plan. You're deciding how the different parts of your system will fit together before you start building, which prevents costly restructuring later on.",
        guidelines: [
          "Sketch your system architecture  what are the main components and how do they connect",
          "Design your database structure  what data you need to store and how it relates",
          "Map out the user flow — what does a user actually click through, step by step",
          "Choose your tech stack and confirm you can realistically learn/use every part of it",
        ],
        estimatedTime: "1-2 weeks",
      },
      {
        step: 4,
        title: "Build and Test",
        description:
          "This is the core development phase. The key here is building in small, testable pieces rather than trying to build everything at once — that way you always have something working, even if you run out of time later.",
        guidelines: [
          "Build one feature completely before starting the next, not all features half-done",
          "Test each feature as you build it, not just at the very end",
          "Keep a simple log of what you built each week — this becomes useful for Chapter Four later",
          "Back up your code regularly using version control (Git)",
        ],
        estimatedTime: "4-6 weeks",
      },
      {
        step: 5,
        title: "Evaluate and Document",
        description:
          "A working system without proper evaluation is incomplete in the eyes of an academic panel. This step is about proving your system actually works and clearly writing up what you found.",
        guidelines: [
          "Test your system with real users if possible, even just classmates",
          "Collect feedback using a simple form or questionnaire",
          "Take screenshots of every major feature working correctly",
          "Write up your results honestly, including anything that didn't work as planned",
        ],
        estimatedTime: "1-2 weeks",
      },
    ],
  });
};

// Stage 4 — Generate research kickstart
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
      "Software Testing and Evaluation",
    ],
    relatedAreas: [
      "Human Computer Interaction",
      "Information Systems Management",
      "Cloud Computing and Deployment",
    ],
    searchTerms: [
      `${selectedTopic} Nigerian universities`,
      `${discipline} management system developing countries`,
      `web-based ${discipline} system design and implementation`,
      `${selectedTopic} system evaluation`,
      `intelligent recommendation systems in education`,
    ],
  });
};

// Stage 5 — Generate project timeline
export const generateTimeline = async (
  selectedTopic: string,
  complexityLevel: string
): Promise<string> => {
  console.log("Timeline for:", selectedTopic, complexityLevel);

  const durations: Record<string, string[]> = {
    Basic: ["Week 1 - 2", "Week 3 - 4", "Week 5 - 6", "Week 7 - 9", "Week 10 - 11", "Week 12 - 13"],
    Intermediate: ["Week 1 - 2", "Week 3 - 5", "Week 6 - 7", "Week 8 - 11", "Week 12 - 13", "Week 14 - 15"],
    Advanced: ["Week 1 - 2", "Week 3 - 6", "Week 7 - 8", "Week 9 - 13", "Week 14 - 15", "Week 16 - 17"],
  };

  const d = durations[complexityLevel] || durations["Intermediate"];

  return JSON.stringify({
    timeline: [
      {
        phase: "Phase 1 — Topic Selection and Proposal",
        activity: `Finalize "${selectedTopic}" as your official project topic, write a clear one-to-two page proposal covering the problem and your proposed approach, and get formal sign-off from your supervisor before doing any further work.`,
        duration: d[0],
        deliverables: [
          "A signed or approved project proposal document",
          "A one-paragraph problem statement you can recite confidently",
          "Supervisor's written or verbal go-ahead to proceed",
        ],
        tips: "Don't wait for a 'perfect' topic description — get supervisor feedback early, even on a rough draft, so you're not building on an unapproved idea.",
      },
      {
        phase: "Phase 2 — Literature Review",
        activity: "Research existing systems and academic work related to your topic, identify at least 6-10 relevant sources, and write up Chapter Two covering related literature, related studies, and the gap your project fills.",
        duration: d[1],
        deliverables: [
          "A reference list of verified, real academic sources",
          "A completed draft of Chapter Two",
          "A clear, written statement of the research gap your project addresses",
        ],
        tips: "Verify every citation on Google Scholar before including it — a fabricated or misquoted reference can seriously damage your credibility at defense.",
      },
      {
        phase: "Phase 3 — System Analysis and Design",
        activity: "Analyze your requirements in detail, design your system architecture, database structure, and user flow, and produce all necessary diagrams (flowchart, ER diagram, use case diagram) for Chapter Three.",
        duration: d[2],
        deliverables: [
          "A completed system architecture diagram",
          "An entity relationship diagram for your database",
          "A finished draft of Chapter Three",
        ],
        tips: "Sketch your diagrams on paper first before using a tool like draw.io — it's faster to change your mind on paper than to redraw a finished diagram.",
      },
      {
        phase: "Phase 4 — Development and Implementation",
        activity: "Build the system module by module, starting with authentication and core data storage before moving to your main features, testing each module as you complete it rather than leaving all testing until the end.",
        duration: d[3],
        deliverables: [
          "A working authentication and data storage layer",
          "All core features functional and individually tested",
          "Code committed regularly to version control (Git)",
        ],
        tips: "Build in small, working slices — a system that does one thing correctly beats a system that half-does five things when you run out of time.",
      },
      {
        phase: "Phase 5 — Testing and Evaluation",
        activity: "Conduct structured functional testing across every feature, run a user acceptance test with real students or a supervisor, collect feedback through a questionnaire, and analyze the results for Chapter Four.",
        duration: d[4],
        deliverables: [
          "A completed functional testing table with pass/fail results",
          "Questionnaire responses from real test users",
          "A written discussion of findings for Chapter Four",
        ],
        tips: "Take screenshots of every working feature as you test — you'll need them for Chapter Four and it's much harder to go back and recreate them later.",
      },
      {
        phase: "Phase 6 — Documentation and Submission",
        activity: "Finalize and proofread all five chapters, format the report according to your department's guidelines, prepare your slides for defense, and submit the completed project for assessment.",
        duration: d[5],
        deliverables: [
          "A fully formatted, guideline-compliant final report",
          "A rehearsed defense presentation",
          "Submitted project ready for internal and external defense",
        ],
        tips: "Read your entire report out loud at least once before submitting — it's the fastest way to catch awkward phrasing and typos your eyes have gone blind to.",
      },
    ],
  });
};