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

export interface TopicDevelopment {
  problem: string;
  affected: string;
  solution: string;
  difference: string;
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
}

export interface ProjectData {
  id?: string;
  uid: string;
  discipline: string;
  areaOfInterest: string;
  tools: string;
  complexityLevel: "Basic" | "Intermediate" | "Advanced";
  realWorldProblem: string;
  generatedTopics: Topic[];
  selectedTopic: string;
  topicDevelopment: TopicDevelopment;
  researchKickstart: ResearchKickstart;
  projectTimeline: TimelinePhase[];
  createdAt: string;
}