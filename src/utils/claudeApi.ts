import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase/config";

type Task = "topics" | "development" | "kickstart" | "timeline";

const generateCallable = httpsCallable<{ task: Task; payload: unknown }, { text: string }>(
  functions,
  "generate"
);

const run = async (task: Task, payload: unknown): Promise<string> => {
  try {
    const result = await generateCallable({ task, payload });
    return result.data.text;
  } catch (err: any) {
    console.error("Generation call failed:", err?.code, err?.message);
    if (err?.code === "functions/resource-exhausted") {
      throw new Error("DAILY_LIMIT");
    }
    throw err;
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

export const generateTopics = (profile: StudentProfile, excludedTitles: string[] = []) =>
  run("topics", {
    profile: {
      department: profile.department,
      areaOfInterest: profile.areaOfInterest,
      tools: profile.tools,
      skillLevel: profile.skillLevel,
      hardware: profile.hardware,
      complexityLevel: profile.complexityLevel,
      beginnerPreference: profile.beginnerPreference,
    },
    excludedTitles,
  });

export const generateTopicDevelopment = (
  selectedTopic: string,
  discipline: string,
  complexityLevel: string
) => run("development", { selectedTopic, discipline, complexityLevel });

export const generateResearchKickstart = (selectedTopic: string, discipline: string) =>
  run("kickstart", { selectedTopic, discipline });

export const generateTimeline = (selectedTopic: string, complexityLevel: string) =>
  run("timeline", { selectedTopic, complexityLevel });