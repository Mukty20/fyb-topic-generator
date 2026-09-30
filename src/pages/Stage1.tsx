import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Layout from "../components/Layout";

type QType = "choice" | "text" | "likert";
type Answers = Record<string, string>;

interface Question {
  id: string;
  type: QType;
  prompt: string | ((a: Answers) => string);
  placeholder?: string;
  options?: string[] | ((a: Answers) => string[]);
  quickOptions?: string[];
  likertLabels?: [string, string];
  minLength?: number;
  errorMessage?: string;
  ack: (value: string, a: Answers) => string;
}

const TOTAL_QUESTIONS = 6;
const NO_EXPERIENCE = "I don't have one yet";

const areaOptionsByDepartment: Record<string, string[]> = {
  "Computer Science": [
    "Web Development", "Artificial Intelligence", "Data Science",
    "Database Systems", "Software Engineering Practices", "Algorithms & Computation",
  ],
  "Computer Engineering": [
    "Embedded Systems", "Internet of Things", "Computer Architecture",
    "Robotics", "Digital Systems Design", "Hardware-Software Integration",
  ],
  "Information Technology": [
    "Networking", "Cloud Computing", "IT Infrastructure Management",
    "Systems Administration", "Web Development", "Database Systems",
  ],
  "Software Engineering": [
    "Web Development", "Mobile Development", "Software Architecture",
    "DevOps", "Quality Assurance & Testing", "Database Systems",
  ],
  "Electrical Engineering": [
    "Embedded Systems", "Power Systems", "Control Systems",
    "Signal Processing", "Internet of Things", "Robotics",
  ],
  "Mechatronics Engineering": [
    "Robotics", "Embedded Systems", "Internet of Things",
    "Automation & Control Systems", "Sensor Systems", "AI for Robotics",
  ],
};

const departmentQuestion: Question = {
  id: "department",
  type: "choice",
  prompt: "Let's start — what's your department?",
  options: Object.keys(areaOptionsByDepartment),
  ack: (v) => `${v} got it. Let's narrow that down to something specific.`,
};

const areaOfInterestQuestion: Question = {
  id: "areaOfInterest",
  type: "choice",
  prompt: (a) => `Within ${a.department}, which specific field are you most interested in building around?`,
  options: (a) => areaOptionsByDepartment[a.department] || [],
  ack: (v) => `${v} that gives us a clear technical direction to work with.`,
};

const toolsQuestion: Question = {
  id: "tools",
  type: "text",
  prompt: "What's the main programming language, tool, or framework you're most comfortable with right now?",
  placeholder: "e.g. Python, React, Java, MySQL",
  quickOptions: [NO_EXPERIENCE],
  minLength: 2,
  errorMessage: "Name whatever you've worked with, even briefly or tap the option below if it's genuinely none yet.",
  ack: (v) =>
    v === NO_EXPERIENCE
      ? "No problem at all — that just means we tailor things a bit differently."
      : `${v} — noted. Let's see how confident you are with it.`,
};

const skillLevelQuestion: Question = {
  id: "skillLevel",
  type: "likert",
  prompt: "On a scale of 1 to 5, how would you rate your overall programming proficiency?",
  likertLabels: ["Beginner", "Expert"],
  ack: (v) => {
    const n = Number(v);
    if (n <= 2) return "Good to know we'll lean toward topics that build your confidence rather than assume expertise.";
    if (n === 3) return "Solid middle ground we'll aim for something that stretches you without overwhelming you.";
    return "Strong foundation — that opens the door to more ambitious topics.";
  },
};

const beginnerGuidanceQuestion: Question = {
  id: "beginnerPreference",
  type: "choice",
  prompt: "Since you're starting from scratch, what would help you most with this project?",
  options: [
    "Recommend a beginner-friendly language for me to learn as I build",
    "Keep everything simple and heavily guided, step by step",
    "I'm open to a bit of challenge, as long as it stays genuinely beginner-friendly",
  ],
  ack: () => "Got it we'll shape both the topic and the roadmap around that.",
};

const hardwareQuestion: Question = {
  id: "hardware",
  type: "choice",
  prompt: "What best describes the hardware you'll be developing and testing on?",
  options: [
    "Low-spec laptop (limited storage/RAM)",
    "Mid-range laptop",
    "High-spec machine",
    "I have access to cloud compute resources",
  ],
  ack: (v) =>
    v.includes("Low-spec")
      ? "Thanks for flagging that we'll make sure nothing suggested needs more than your machine can handle."
      : v.includes("cloud")
      ? "Good to know — that opens up more compute-heavy options if you want them."
      : "Noted — that gives us a realistic picture of what you can comfortably run.",
};

const learningStyleQuestion: Question = {
  id: "learningStyle",
  type: "choice",
  prompt: "Last one how do you learn a new technical concept best?",
  options: [
    "Reading documentation",
    "Watching video tutorials",
    "Building small examples hands-on",
    "Discussing it with someone",
  ],
  ack: () => "Got it that's everything I need.",
};

const getQuestionAt = (index: number, a: Answers): Question => {
  switch (index) {
    case 0: return departmentQuestion;
    case 1: return areaOfInterestQuestion;
    case 2: return toolsQuestion;
    case 3: return a.tools === NO_EXPERIENCE ? beginnerGuidanceQuestion : skillLevelQuestion;
    case 4: return hardwareQuestion;
    case 5: return learningStyleQuestion;
    default: return departmentQuestion;
  }
};

const deriveComplexity = (skillLevel: number, hardware: string): "Basic" | "Intermediate" | "Advanced" => {
  const lowHardware = hardware.includes("Low-spec");
  const strongHardware = hardware.includes("High-spec") || hardware.includes("cloud");
  if (skillLevel <= 2 || lowHardware) return "Basic";
  if (skillLevel >= 4 && strongHardware) return "Advanced";
  return "Intermediate";
};

interface ChatMessage {
  from: "system" | "user";
  text: string;
}

const Stage1 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [startInterview, setStartInterview] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saveError, setSaveError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuestion = getQuestionAt(currentIndex, answers);

  const resolvePrompt = (q: Question, a: Answers) => (typeof q.prompt === "function" ? q.prompt(a) : q.prompt);
  const resolveOptions = (q: Question, a: Answers): string[] =>
    typeof q.options === "function" ? q.options(a) : q.options || [];

  // On mount: check if a completed profile already exists — if so, show a choice
  // screen instead of silently redirecting or silently restarting.
  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "projects", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().department) {
          setHasExistingProfile(true);
        }
      } catch (err) {
        console.log("Stage 1 existing-profile check error:", err);
      }
      setCheckingExisting(false);
    };
    checkExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (checkingExisting || hasExistingProfile) return;
    if (!startInterview) return;
    showTyping().then(() => {
      setMessages([{ from: "system", text: resolvePrompt(getQuestionAt(0, {}), {}) }]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingExisting, hasExistingProfile, startInterview]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const showTyping = (): Promise<void> =>
    new Promise((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        resolve();
      }, 550);
    });

  const saveProfile = async (updatedAnswers: Answers) => {
    setSaving(true);
    setSaveError("");
    try {
      const isBeginner = updatedAnswers.tools === NO_EXPERIENCE;
      const skillLevel = isBeginner ? 1 : Number(updatedAnswers.skillLevel);
      const complexityLevel = deriveComplexity(skillLevel, updatedAnswers.hardware);

      const payload: any = {
        uid: user!.uid,
        department: updatedAnswers.department,
        areaOfInterest: updatedAnswers.areaOfInterest,
        tools: updatedAnswers.tools,
        skillLevel,
        hardware: updatedAnswers.hardware,
        learningStyle: updatedAnswers.learningStyle,
        complexityLevel,
        generatedTopics: [],
        selectedTopic: "",
        topicDevelopment: {},
        researchKickstart: {},
        projectTimeline: [],
        createdAt: new Date().toISOString(),
      };

      if (isBeginner) {
        payload.beginnerPreference = updatedAnswers.beginnerPreference;
      }

      await setDoc(doc(db, "projects", user!.uid), payload);
      navigate("/stage2");
    } catch (err: any) {
      console.log("Stage 1 save error:", err);
      setSaving(false);
      setSaveError(
        err?.code === "permission-denied"
          ? "Permission denied while saving. Please check your authentication status and try again."
          : err?.message || "Something went wrong while saving your profile."
      );
    }
  };

  const submitAnswer = async (value: string) => {
    if (!value.trim()) return;
    const q = currentQuestion;

    setMessages((prev) => [...prev, { from: "user", text: value }]);
    setTextInput("");

    const isQuickOption = q.quickOptions?.some((qo) => qo.toLowerCase() === value.toLowerCase());
    if (q.type === "text" && q.minLength && !isQuickOption && value.trim().length < q.minLength) {
      await showTyping();
      setMessages((prev) => [...prev, { from: "system", text: q.errorMessage || "Could you give me a bit more detail?" }]);
      return;
    }

    const updatedAnswers = { ...answers, [q.id]: value };
    setAnswers(updatedAnswers);

    await showTyping();
    setMessages((prev) => [...prev, { from: "system", text: q.ack(value, updatedAnswers) }]);

    const nextIndex = currentIndex + 1;

    if (nextIndex < TOTAL_QUESTIONS) {
      setCurrentIndex(nextIndex);
      await showTyping();
      const nextQ = getQuestionAt(nextIndex, updatedAnswers);
      setMessages((prev) => [...prev, { from: "system", text: resolvePrompt(nextQ, updatedAnswers) }]);
    } else {
      setFinished(true);
      await saveProfile(updatedAnswers);
    }
  };

  const progress = Math.round((currentIndex / TOTAL_QUESTIONS) * 100);

  if (checkingExisting) {
    return (
      <Layout activePath="/stage1" variant="chat">
        <div className="flex-1 flex items-center justify-center px-5">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  // Completed profile exists and student hasn't chosen to restart yet — show a choice, don't decide for them
  if (hasExistingProfile && !startInterview) {
    return (
      <Layout activePath="/stage1">
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Stage 01</p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">You've already completed profiling</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            You can continue on to your topics, or start profiling over from scratch.
            Starting over will replace your current answers once you finish the new set of questions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/stage2")}
            className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
          >
            Continue to My Topics
          </button>
          <button
            onClick={() => {
              const confirmed = window.confirm(
                "This restarts profiling from question 1. Nothing is deleted until you finish and submit the new answers. Continue?"
              );
              if (confirmed) {
                setAnswers({});
                setCurrentIndex(0);
                setFinished(false);
                setSaveError("");
                setStartInterview(true);
              }
            }}
            className="px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Start Profiling Over
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePath="/stage1" variant="chat">
      <div className="px-5 md:px-10 pt-6 md:pt-8 pb-4 shrink-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Stage 01</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Let's get to know you</h2>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-900 rounded-full transition-all duration-500" style={{ width: `${finished ? 100 : progress}%` }} />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 md:px-10 py-4">
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.from === "user" ? "bg-gray-900 text-white rounded-br-md" : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {finished && !saveError && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500">
                {saving ? "Perfect — saving your profile..." : "All done! Taking you to your topics..."}
              </div>
            </div>
          )}

          {saveError && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] sm:max-w-[80%]">
                <p className="text-sm text-red-600 mb-2">{saveError}</p>
                <button
                  onClick={() => saveProfile(answers)}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {saving ? "Retrying..." : "Retry Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!finished && !typing && currentQuestion && (
        <div className="px-5 md:px-10 pb-6 md:pb-8 pt-2 shrink-0 border-t border-gray-100 bg-[#f5f5f0]">

          {currentQuestion.type === "choice" && (
            <div className="flex flex-wrap gap-2 mt-3">
              {resolveOptions(currentQuestion, answers).map((opt) => (
                <button key={opt} onClick={() => submitAnswer(opt)}
                  className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition text-gray-700">
                  {opt}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === "text" && (
            <div className="mt-3">
              {currentQuestion.quickOptions && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentQuestion.quickOptions.map((qo) => (
                    <button key={qo} onClick={() => submitAnswer(qo)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition text-gray-500">
                      {qo}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitAnswer(textInput)}
                  placeholder={currentQuestion.placeholder}
                  className="flex-1 min-w-0 px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition"
                />
                <button onClick={() => submitAnswer(textInput)}
                  className="px-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition shrink-0">
                  Send
                </button>
              </div>
            </div>
          )}

          {currentQuestion.type === "likert" && (
            <div className="mt-3">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => submitAnswer(String(n))}
                    className="w-12 h-12 rounded-xl bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition text-gray-700 text-base font-semibold">
                    {n}
                  </button>
                ))}
              </div>
              {currentQuestion.likertLabels && (
                <div className="flex justify-between mt-2 px-1 max-w-xs mx-auto">
                  <span className="text-xs text-gray-400">{currentQuestion.likertLabels[0]}</span>
                  <span className="text-xs text-gray-400">{currentQuestion.likertLabels[1]}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Stage1;