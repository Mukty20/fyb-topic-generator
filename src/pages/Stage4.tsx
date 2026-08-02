import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateResearchKickstart } from "../utils/claudeApi";

const Stage4 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [kickstart, setKickstart] = useState<any>(null);
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
          if (
            data.researchKickstart &&
            data.researchKickstart.keyConcepts
          ) {
            setKickstart(data.researchKickstart);
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
      const response = await generateResearchKickstart(
        selectedTopic,
        discipline
      );
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      await updateDoc(doc(db, "projects", user!.uid), {
        researchKickstart: parsed
      });

      setKickstart(parsed);
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
            { label: "Research Kickstart", path: "/stage4", active: true },
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
            Stage 04
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Research Kickstart
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Get key concepts to read about, related technology areas
            to explore, and Google Scholar search terms to begin
            your literature review.
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
              Ready to kickstart your research
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
              Click below to get tailored research suggestions
              based on your chosen topic and discipline.
            </p>
            <button
              onClick={handlePrompt}
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {loading ? "Generating suggestions...": "Get research suggestions"}
            </button>
          </div>
        )}

        {/* Kickstart Results */}
        {prompted && kickstart && (
          <div className="flex flex-col gap-5">

            {/* Key Concepts */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                Key Concepts to Read About
              </p>
              <div className="flex flex-col gap-3">
                {kickstart.keyConcepts?.map((concept: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-gray-300 mt-0.5 w-5 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-gray-700">{concept}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Areas */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                Related Technology Areas to Explore
              </p>
              <div className="flex flex-wrap gap-2">
                {kickstart.relatedAreas?.map((area: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

           {/* Search Terms */}
<div className="bg-white rounded-2xl border border-gray-100 p-6">
  <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
    Google Scholar Search Terms
  </p>
  <div className="flex flex-col gap-3">
    {kickstart.searchTerms?.map((term: string, i: number) => (
      <div
        key={i}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
      >
        <p className="text-sm text-gray-700 font-mono">
          "{term}"
        </p>
        <button
          onClick={() =>
            window.open(
              `https://scholar.google.com/scholar?q=${encodeURIComponent(term)}`,
              "_blank"
            )
          }
          className="text-xs text-gray-400 hover:text-gray-700 transition ml-4 shrink-0"
        >
          Search
        </button>
      </div>
    ))}
  </div>
  <p className="text-xs text-gray-400 mt-3">
    Click "Search " to open each term directly in Google Scholar.
  </p>
</div>

            {/* Reprompt and Continue */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPrompted(false);
                  setKickstart(null);
                }}
                className="px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                 Reprompt
              </button>
              <button
                onClick={() => navigate("/stage5")}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Continue to Project Timeline
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Stage4;