export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface Topic {
  title: string;
  description: string;
  relevance: string;
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  guidelines: string[];
  estimatedTime: string;
}

export interface TopicDevelopment {
  problem: string;
  affected: string;
  solution: string;
  difference: string;
  roadmap: RoadmapStep[];
}

export interface ResearchKickstart {
  keyConcepts: string[];
  relatedAreas: string[];
  searchTerms: string[];
}

export interface TimelinePhase {
  phase: string;
  activity: string;
  duration: string;
  deliverable: string[];
  tips: string;
}

export interface ProjectData {
  id?: string;
  uid: string;

  // Core discipline
  discipline: string;
  areaOfInterest: string;

  // Motivation & authenticity signals
  sparkMotivation: string;
  projectWhy: string;
  careerDirection: string;

  // Skill & risk signals
  confidentSkill: string;
  tools: string;
  stretchAppetite: string;

  // The real-world problem
  realWorldProblem: string;
  whoElseAffected: string;
  problemIntensity: string;

  // Practical context
  resourceReality: string;

  // Working style
  preference: string;
  structurePreference: string;
  complexityLevel: "Basic" | "Intermediate" | "Advanced";

  // Generated outputs
  generatedTopics: Topic[];
  selectedTopic: string;
  topicDevelopment: TopicDevelopment;
  researchKickstart: ResearchKickstart;
  projectTimeline: TimelinePhase[];
  createdAt: string;
}