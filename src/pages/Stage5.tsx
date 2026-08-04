import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateTimeline } from "../utils/claudeApi";
import Layout from "../components/Layout";

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
      const response = await generateTimeline(selectedTopic, complexityLevel);
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const timelineData = parsed.timeline;

      await updateDoc(doc(db, "projects", user!.uid), { projectTimeline: timelineData });

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
    <Layout activePath="/stage5">
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Stage 05</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Timeline</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          A personalized, phase by phase project plan from proposal to submission,
          including what you should have finished by the end of each phase.
        </p>
      </div>

      {selectedTopic && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Your selected topic</p>
              <p className="text-sm font-semibold text-gray-900">{selectedTopic}</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full self-start">
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

      {!prompted && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Ready to generate your timeline</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Click below to get a phase by phase project plan with clear
            deliverables and tips, tailored to your topic and complexity level.
          </p>
          <button
            onClick={handlePrompt}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? "Generating timeline..." : "Generate my timeline"}
          </button>
        </div>
      )}

      {prompted && timeline.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">Your project timeline</p>

            <div className="flex flex-col gap-4">
              {timeline.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-1">
                      <p className="text-sm font-semibold text-gray-900">{item.phase}</p>
                      <span className="text-xs text-gray-400 shrink-0 bg-white border border-gray-200 px-2 py-1 rounded-lg self-start">
                        {item.duration}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.activity}</p>

                    {item.deliverables?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-1.5">
                          By the end of this phase, you should have:
                        </p>
                        <div className="flex flex-col gap-1">
                          {item.deliverables.map((d: string, di: number) => (
                            <div key={di} className="flex items-start gap-2">
                              <span className="text-gray-300 text-xs mt-0.5">✓</span>
                              <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.tips && (
                      <div className="bg-white border border-gray-100 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          <span className="text-gray-700 font-medium">Tip: </span>
                          {item.tips}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={handlePrompt}
              disabled={loading}
              className="px-5 py-3 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {loading ? "Reprompting..." : "↺ Reprompt"}
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
    </Layout>
  );
};

export default Stage5;