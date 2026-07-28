import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateTimeline } from "../utils/claudeApi";

const Stage5 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [complexityLevel, setComplexityLevel] = useState("");
  const [timeline, setTimeline] = useState<any[]>([]);
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
          setComplexityLevel(data.complexityLevel);
          if (data.projectTimeline && data.projectTimeline.length > 0) {
            setTimeline(data.projectTimeline);
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
      const response = await generateTimeline(
        selectedTopic,
        complexityLevel
      );
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const timelineData = parsed.timeline;

      await updateDoc(doc(db, "projects", user!.uid), {
        projectTimeline: timelineData
      });

      setTimeline(timelineData);
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
            { label: "Topic Development", path: "/stage3" },
            { label: "Research Kickstart", path: "/stage4" },
            { label: "Project Timeline", path: "/stage5", active: true },
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
              <span className={`w-1.5 h-1.5 rounded-full ${
                item.active ? "bg-gray-900" : "bg-gray-300"
              }`}></span>
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
            Stage 05
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Project Timeline
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Get a personalized phase by phase project plan from
            proposal to submission tailored to your complexity level.
          </p>
        </div>

        {/* Selected Topic */}
        {selectedTopic && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Your selected topic
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedTopic}
                </p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {complexityLevel}
              </span>
            </div>
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
              Ready to generate your timeline
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Click below to get a phase by phase project plan
              tailored to your topic and complexity level.
            </p>
            <button
              onClick={handlePrompt}
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? "Generating timeline..." : "Generate my timeline "}
            </button>
          </div>
        )}

        {/* Timeline Results */}
        {prompted && timeline.length > 0 && (
          <div className="flex flex-col gap-5">

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                Your project timeline
              </p>

              <div className="flex flex-col gap-4">
                {timeline.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    {/* Phase number */}
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.phase}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                          {item.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {item.activity}
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
                  setTimeline([]);
                }}
                className="px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                ↺ Reprompt
              </button>
              <button
                onClick={() => navigate("/stage6")}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Continue to Download Plan
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Stage5;