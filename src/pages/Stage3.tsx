import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateTopicDevelopment } from "../utils/claudeApi";

const Stage3 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [discipline, setDiscipline] = useState("");
  // const [complexityLevel, setComplexityLevel] = useState("");
  const [development, setDevelopment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "projects", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!data.selectedTopic) {
            navigate("/stage2");
            return;
          }
          setSelectedTopic(data.selectedTopic);
          setDiscipline(data.discipline);
          // setComplexityLevel(data.complexityLevel);
          if (data.topicDevelopment && data.topicDevelopment.problem) {
            setDevelopment(data.topicDevelopment);
            setPrompted(true);
          }
        } else {
          navigate("/stage1");
        }
      } catch (err) {
        console.log("Load error:", err);
      }
    };
    loadData();
  }, [user]);

  const handlePrompt = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await generateTopicDevelopment(
        selectedTopic,
        discipline,
        // complexityLevel
      );
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      await updateDoc(doc(db, "projects", user!.uid), {
        topicDevelopment: parsed
      });

      setDevelopment(parsed);
      setPrompted(true);
    } catch (err: any) {
      console.log("Prompt error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col px-5 py-6 fixed left-0 top-0">
        <div className="mb-8">
          <h1 className="text-sm font-semibold text-gray-900">
            FYP Topic Prompting System
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Personalized project guidance
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Student Profiling", path: "/stage1" },
            { label: "Topic Prompting", path: "/stage2" },
            { label: "Topic Development", path: "/stage3", active: true },
            { label: "Research Kickstart", path: "/stage4" },
            { label: "Project Timeline", path: "/stage5" },
            { label: "Download Plan", path: "/stage6" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition ${
                item.active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-gray-900" : "bg-gray-300"}`}></span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.displayName}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user?.email}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 px-10 py-10 max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            Stage 03
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Topic Development
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            The system will guide you through thinking about your chosen
            topic — breaking it down into a problem, solution, and
            step by step development roadmap.
          </p>
        </div>

        {/* Selected Topic */}
        {selectedTopic && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
              Your selected topic
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {selectedTopic}
            </p>
            <button
              onClick={() => navigate("/stage2")}
              className="mt-2 text-xs text-gray-400 hover:text-gray-700 transition"
            >
              ← Change topic
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Not yet prompted */}
        {!prompted && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Ready to develop your topic
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Click below to get a structured breakdown of your topic
              including a step by step development roadmap.
            </p>
            <button
              onClick={handlePrompt}
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? "Developing your topic..." : "Develop my topic →"}
            </button>
          </div>
        )}

        {/* Development Results */}
        {prompted && development && (
          <div className="flex flex-col gap-5">

            {/* Problem */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                The Problem
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {development.problem}
              </p>
            </div>

            {/* Who is affected */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Who is Affected
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {development.affected}
              </p>
            </div>

            {/* Solution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                The Solution
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {development.solution}
              </p>
            </div>

            {/* What makes it different */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                What Makes it Different
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {development.difference}
              </p>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-5">
                Development Roadmap
              </p>
              <div className="flex flex-col gap-5">
                {development.roadmap?.map((step: any) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium shrink-0">
                        {step.step}
                      </div>
                      {step.step < development.roadmap.length && (
                        <div className="w-px flex-1 bg-gray-100 mt-2" />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reprompt and Continue */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPrompted(false);
                  setDevelopment(null);
                }}
                className="px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                ↺ Reprompt
              </button>
              <button
                onClick={() => navigate("/stage4")}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Continue to Research Kickstart →
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Stage3;