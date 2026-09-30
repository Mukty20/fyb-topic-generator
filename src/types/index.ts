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
  problemGrounding: string;
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
  deliverables: string[];
  tips: string;
}

export interface ProjectData {
  id?: string;
  uid: string;

  department: string;
  areaOfInterest: string;
  tools: string;
  skillLevel: number; // 1-5, forced to 1 for true beginners
  beginnerPreference?: string; // only present when the student has no prior programming experience
  hardware: string;
  learningStyle: string;
  complexityLevel: "Basic" | "Intermediate" | "Advanced";

  generatedTopics: Topic[];
  selectedTopic: string;
  topicDevelopment: TopicDevelopment;
  researchKickstart: ResearchKickstart;
  projectTimeline: TimelinePhase[];
  createdAt: string;
}