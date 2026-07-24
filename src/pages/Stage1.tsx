import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const disciplines = [
  "Computer Science",
  "Computer Engineering",
  "Information Technology",
  "Software Engineering",
  "Electrical Engineering",
  "Mechatronics Engineering",
];

const interests = [
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
];

const complexityLevels = ["Basic", "Intermediate", "Advanced"];

const Stage1 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [discipline, setDiscipline] = useState("");
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [tools, setTools] = useState("");
  const [complexityLevel, setComplexityLevel] = useState("");
  const [realWorldProblem, setRealWorldProblem] = useState("");
  const [preference, setPreference] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (
      !discipline ||
      !areaOfInterest ||
      !tools ||
      !complexityLevel ||
      !realWorldProblem ||
      !preference
    ) {
      setError("Please fill in all fields before continuing.");
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "projects", user!.uid), {
        uid: user!.uid,
        discipline,
        areaOfInterest,
        tools,
        complexityLevel,
        realWorldProblem,
        preference,
        generatedTopics: [],
        selectedTopic: "",
        topicDevelopment: {},
        researchKickstart: {},
        projectTimeline: [],
        createdAt: new Date().toISOString()
      });

      navigate("/stage2");
    } catch (err: any) {
      console.log("Stage 1 error:", err);
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
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Dashboard
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-medium text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-900"></span>
            Student Profiling
          </button>
          <button
            onClick={() => navigate("/stage2")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Topic Prompting
          </button>
          <button
            onClick={() => navigate("/stage3")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Topic Development
          </button>
          <button
            onClick={() => navigate("/stage4")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Research Kickstart
          </button>
          <button
            onClick={() => navigate("/stage5")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Project Timeline
          </button>
          <button
            onClick={() => navigate("/stage6")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Download Plan
          </button>
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
            Stage 01
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Student Profiling
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your answers below drive every stage that follows.
            Be as specific as possible the more detail you give,
            the more unique and relevant your results will be.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8">

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Discipline */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              What is your discipline?
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
            >
              <option value="">Select your discipline</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Area of Interest */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              What area of computing interests you most?
            </label>
            <select
              value={areaOfInterest}
              onChange={(e) => setAreaOfInterest(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
            >
              <option value="">Select your area of interest</option>
              {interests.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Tools */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              What tools or programming languages do you already know?
            </label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="e.g. Python, React, Java, MySQL..."
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
            />
          </div>

          {/* Preference */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-3">
              Do you prefer building something new or improving something existing?
            </label>
            <div className="flex gap-3">
              {["Building something new", "Improving something existing"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPreference(p)}
                  className={`flex-1 py-3 text-sm rounded-lg border transition ${
                    preference === p
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity Level */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-3">
              What complexity level are you aiming for?
            </label>
            <div className="flex gap-3">
              {complexityLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setComplexityLevel(level)}
                  className={`flex-1 py-3 text-sm rounded-lg border transition ${
                    complexityLevel === level
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Real World Problem */}
          <div className="mb-8">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Is there a real problem you have personally observed that technology could solve?
            </label>
            <textarea
              value={realWorldProblem}
              onChange={(e) => setRealWorldProblem(e.target.value)}
              placeholder="Describe a problem you have noticed around you — in your school, community, or daily life..."
              rows={4}
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving your profile..." : "Continue to Topic Prompting →"}
          </button>

        </div>

      </main>

    </div>
  );
};

export default Stage1;