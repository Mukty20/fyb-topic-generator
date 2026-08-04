import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Layout from "../components/Layout";

type QType = "choice" | "text" | "textarea";

interface Question {
  id: string;
  type: QType;
  prompt: string;
  placeholder?: string;
  options?: string[];
  quickOptions?: string[];
  minLength?: number;
  errorMessage?: string;
  ack: (value: string) => string;
}

const questions: Question[] = [
  {
    id: "discipline",
    type: "choice",
    prompt: "First what's your discipline?",
    options: [
      "Computer Science",
      "Computer Engineering",
      "Information Technology",
      "Software Engineering",
      "Electrical Engineering",
      "Mechatronics Engineering",
    ],
    ack: (v) => `${v} good to know. Let's dig into specifics.`,
  },
  {
    id: "areaOfInterest",
    type: "choice",
    prompt: "What area of computing are you actually drawn to?",
    options: [
      "Web Development",
      "Mobile Development",
      "Artificial Intelligence",
      "Cybersecurity",
      "Data Science",
      "Internet of Things",
      "Networking",
      "Database Systems",
      "Cloud Computing",
      "Embedded Systems",
    ],
    ack: (v) => `${v} noted. That's going to shape a lot of what comes next.`,
  },
  {
    id: "sparkMotivation",
    type: "choice",
    prompt:
      "Be real with me did you pick this area because you're genuinely curious about it, because it seemed like the safest bet for a job, or because it's just what was expected of you?",
    options: [
      "Genuinely curious about it",
      "Seemed like the safest bet for a job",
      "It's what was expected of me",
    ],
    ack: (v) => {
      if (v.includes("curious"))
        return "That's the best possible starting point genuine curiosity usually means you'll actually enjoy the process, not just survive it.";
      if (v.includes("safest"))
        return "Completely fair a lot of strong careers start exactly like that. We'll lean toward topics that are solid and employable.";
      return "Thanks for being honest about that we'll aim for something that still feels genuinely yours by the time you're done.";
    },
  },
  {
    id: "confidentSkill",
    type: "text",
    prompt: "What's one thing in that area you could already build or explain confidently to someone else right now?",
    placeholder: "e.g. I can build a basic REST API with Node.js",
    quickOptions: ["I'm not fully confident in anything yet"],
    minLength: 3,
    errorMessage: "Try to name something specific, even something small or tap the option below if it's genuinely nothing yet.",
    ack: (v) =>
      v === "I'm not fully confident in anything yet"
        ? "That's completely okay we'll aim for a topic that builds your confidence rather than assuming it."
        : `Good "${v}" is a real foundation we can build on.`,
  },
  {
    id: "tools",
    type: "text",
    prompt: "What tools, languages, or frameworks do you already have real hands-on experience with?",
    placeholder: "e.g. Python, React, MySQL, Firebase",
    quickOptions: ["I don't have hands-on experience yet"],
    minLength: 2,
    errorMessage: "Just list anything you've touched, even briefly or tap the option below if it's genuinely none yet.",
    ack: (v) =>
      v === "I don't have hands-on experience yet"
        ? "No worries at all we'll steer things toward topics with a gentler learning curve and good learning resources built in."
        : `${v} solid toolkit. That opens up quite a few directions.`,
  },
  {
    id: "stretchAppetite",
    type: "choice",
    prompt: "If this project required you to learn something completely new, how do you feel about that?",
    options: ["Energized bring it on", "Cautiously willing", "I'd rather stick to what I know"],
    ack: (v) => {
      if (v.includes("Energized")) return "Love that energy we'll lean into something a bit more ambitious then.";
      if (v.includes("Cautiously")) return "Balanced approach we'll stretch you a little, not overwhelm you.";
      return "Totally valid we'll keep things within tools you're already comfortable with.";
    },
  },
  {
    id: "projectWhy",
    type: "choice",
    prompt: "What do you most want this project to actually do for you?",
    options: [
      "Impress the panel",
      "Become something I can show employers",
      "Finally fix something that's been bothering me",
      "Just get done with the least stress possible",
    ],
    ack: (v) => {
      if (v.includes("Impress")) return "Noted we'll make sure the topic has real presentation value.";
      if (v.includes("employers")) return "Smart move we'll aim for something portfolio-worthy.";
      if (v.includes("bothering")) return "That's honestly the best motivation there is let's put that problem to work.";
      return "No shame in that we'll aim for something clear and manageable, not a headache.";
    },
  },
  {
    id: "careerDirection",
    type: "choice",
    prompt: "What's actually most likely for you after school?",
    options: [
      "Relocating abroad (japa)",
      "NYSC then job-hunting locally",
      "Joining the Lagos/Nigerian tech scene",
      "A bank or fintech role",
      "Further studies",
      "Starting something of my own",
    ],
    ack: (v) => `${v} got it, that'll help shape how we frame the final project.`,
  },
  {
    id: "realWorldProblem",
    type: "textarea",
    prompt:
      "Think about your own daily life school, home, your community. What's something that genuinely frustrates you or wastes your time, where you keep thinking 'there has to be a better way to do this'?",
    placeholder:
      "Think: JAMB/school portal wahala, NEPA/light scheduling, transport and traffic, market or trading stress, fees/payment tracking, data costs, healthcare access...",
    minLength: 15,
    errorMessage: "Try to describe it a bit more what happens, how often, and who it affects.",
    ack: () => "Thanks for sharing that that's a real, specific problem, which is exactly what makes a strong project.",
  },
  {
    id: "whoElseAffected",
    type: "text",
    prompt: "Who else deals with this same problem besides you?",
    placeholder: "e.g. other students in my department, my whole street, market traders...",
    minLength: 3,
    errorMessage: "Just a quick note on who else deals with this even a general group is fine.",
    ack: () => "Good to know it's not just you that's an important detail.",
  },
  {
    id: "problemIntensity",
    type: "choice",
    prompt: "How much does this actually bother you?",
    options: ["Mild annoyance", "Somewhat bothersome", "Genuinely needs fixing"],
    ack: (v) => {
      if (v.includes("Mild")) return "Got it we'll treat this as one option among a few rather than the sole focus.";
      if (v.includes("Somewhat")) return "Noted worth addressing, but we'll keep the scope realistic.";
      return "That level of frustration is usually a great sign it means you'll stay motivated to actually solve it.";
    },
  },
  {
    id: "resourceReality",
    type: "choice",
    prompt: "How reliable is your access to internet and electricity day-to-day?",
    options: ["Solid most of the time", "Decent, but with regular gaps", "A real daily struggle"],
    ack: (v) => {
      if (v.includes("Solid")) return "Good that gives us flexibility with more connected, always-on ideas.";
      if (v.includes("Decent")) return "Noted we'll keep things reasonably resilient to short outages.";
      return "Thanks for being upfront we'll prioritize something you can actually build and test without fighting your environment.";
    },
  },
  {
    id: "preference",
    type: "choice",
    prompt: "Do you want to build something completely new, or improve something that already exists?",
    options: ["Building something new", "Improving something existing"],
    ack: (v) => (v.includes("new") ? "Building from scratch it is more creative freedom." : "Improving something existing plenty of real, visible impact there."),
  },
  {
    id: "structurePreference",
    type: "choice",
    prompt: "When you picture working on this, do you want clear structure and direction, or room to explore and make your own calls?",
    options: ["Clear structure and direction", "Room to explore and make my own calls"],
    ack: (v) => (v.includes("explore") ? "Good to know we'll leave room for you to make your own calls." : "Clear structure it is you'll always know what's next."),
  },
  {
    id: "ambitionLevel",
    type: "choice",
    prompt: "Last one what are you aiming for?",
    options: [
      "Something solid and manageable",
      "Something that stretches me",
      "Something ambitious enough to stand out",
    ],
    ack: (v) => {
      if (v.includes("manageable")) return "Smart, realistic choice we'll keep it focused and achievable.";
      if (v.includes("stretches")) return "Good balance challenging enough to be worth it, not overwhelming.";
      return "Bold choice — let's aim for something that really stands out.";
    },
  },
];

const ambitionToComplexity: Record<string, string> = {
  "Something solid and manageable": "Basic",
  "Something that stretches me": "Intermediate",
  "Something ambitious enough to stand out": "Advanced",
};

interface ChatMessage {
  from: "system" | "user";
  text: string;
}

const Stage1 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    showTyping().then(() => {
      setMessages([{ from: "system", text: questions[0].prompt }]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const showTyping = (): Promise<void> => {
    return new Promise((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        resolve();
      }, 550);
    });
  };

  const submitAnswer = async (value: string) => {
    if (!value.trim()) return;

    const q = currentQuestion;

    setMessages((prev) => [...prev, { from: "user", text: value }]);
    setTextInput("");

    const isQuickOption = q.quickOptions?.some((qo) => qo.toLowerCase() === value.toLowerCase());
    if (
      (q.type === "text" || q.type === "textarea") &&
      q.minLength &&
      !isQuickOption &&
      value.trim().length < q.minLength
    ) {
      await showTyping();
      setMessages((prev) => [
        ...prev,
        { from: "system", text: q.errorMessage || "Could you give me a bit more detail?" },
      ]);
      return;
    }

    const updatedAnswers = { ...answers, [q.id]: value };
    setAnswers(updatedAnswers);

    await showTyping();
    setMessages((prev) => [...prev, { from: "system", text: q.ack(value) }]);

    const nextIndex = currentIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      await showTyping();
      setMessages((prev) => [...prev, { from: "system", text: questions[nextIndex].prompt }]);
    } else {
      setFinished(true);
      setSaving(true);
      try {
        const complexityLevel = ambitionToComplexity[updatedAnswers.ambitionLevel] || "Intermediate";

        await setDoc(doc(db, "projects", user!.uid), {
          uid: user!.uid,
          discipline: updatedAnswers.discipline,
          areaOfInterest: updatedAnswers.areaOfInterest,
          sparkMotivation: updatedAnswers.sparkMotivation,
          confidentSkill: updatedAnswers.confidentSkill,
          tools: updatedAnswers.tools,
          stretchAppetite: updatedAnswers.stretchAppetite,
          projectWhy: updatedAnswers.projectWhy,
          careerDirection: updatedAnswers.careerDirection,
          realWorldProblem: updatedAnswers.realWorldProblem,
          whoElseAffected: updatedAnswers.whoElseAffected,
          problemIntensity: updatedAnswers.problemIntensity,
          resourceReality: updatedAnswers.resourceReality,
          preference: updatedAnswers.preference,
          structurePreference: updatedAnswers.structurePreference,
          complexityLevel,
          generatedTopics: [],
          selectedTopic: "",
          topicDevelopment: {},
          researchKickstart: {},
          projectTimeline: [],
          createdAt: new Date().toISOString(),
        });

        setTimeout(() => navigate("/stage2"), 1200);
      } catch (err) {
        console.log("Stage 1 save error:", err);
        setSaving(false);
      }
    }
  };

  const progress = Math.round((currentIndex / questions.length) * 100);

  return (
    <Layout activePath="/stage1" variant="chat">
      {/* Header + Progress */}
      <div className="px-5 md:px-10 pt-6 md:pt-8 pb-4 shrink-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Stage 01</p>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Let's get to know you</h2>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${finished ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 md:px-10 py-4">
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "bg-gray-900 text-white rounded-br-md"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
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

          {finished && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500">
                {saving ? "Perfect saving your profile..." : "All done! Taking you to your topics..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {!finished && !typing && currentQuestion && (
        <div className="px-5 md:px-10 pb-6 md:pb-8 pt-2 shrink-0 border-t border-gray-100 bg-[#f5f5f0]">

          {currentQuestion.type === "choice" && (
            <div className="flex flex-wrap gap-2 mt-3">
              {currentQuestion.options!.map((opt) => (
                <button
                  key={opt}
                  onClick={() => submitAnswer(opt)}
                  className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition text-gray-700"
                >
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
                    <button
                      key={qo}
                      onClick={() => submitAnswer(qo)}
                      className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition text-gray-500"
                    >
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
                <button
                  onClick={() => submitAnswer(textInput)}
                  className="px-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition shrink-0"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {currentQuestion.type === "textarea" && (
            <div className="mt-3">
              <textarea
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={3}
                className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition resize-none"
              />
              <button
                onClick={() => submitAnswer(textInput)}
                className="mt-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Stage1;