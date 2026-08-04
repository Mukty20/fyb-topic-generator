import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { generateTopics } from "../utils/claudeApi";
import type { Topic } from "../types";
import Layout from "../components/Layout";

const Stage2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [prompted, setPrompted] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "projects", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          if (data.generatedTopics && data.generatedTopics.length > 0) {
            setTopics(data.generatedTopics);
            setSelectedTopic(data.selectedTopic || "");
            setPrompted(true);
          }
        } else {
          navigate("/stage1");
        }
      } catch (err) {
        console.log("Load profile error:", err);
      }
    };
    loadProfile();
  }, [user]);

  const handlePrompt = async () => {
    if (!profile) return;
    setError("");
    setLoading(true);

    try {
      const response = await generateTopics(profile);
      const clean = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const generatedTopics: Topic[] = parsed.topics;

      await updateDoc(doc(db, "projects", user!.uid), { generatedTopics });

      setTopics(generatedTopics);
      setPrompted(true);
    } catch (err: any) {
      console.log("Prompt error:", err);
      setError("Something went wrong while prompting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = async (title: string) => {
    setSelectedTopic(title);
    try {
      await updateDoc(doc(db, "projects", user!.uid), { selectedTopic: title });
    } catch (err) {
      console.log("Select topic error:", err);
    }
  };

  const handleContinue = () => {
    if (!selectedTopic) {
      setError("Please select a topic before continuing.");
      return;
    }
    navigate("/stage3");
  };

  const handleReprompt = async () => {
    setSelectedTopic("");
    await handlePrompt();
  };

  return (
    <Layout activePath="/stage2">
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Stage 02</p>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Topic Prompting</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Based on your profile, the system will prompt 5 project topics
          uniquely tailored to your inputs. No two students get the same result.
        </p>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Your profile summary</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Discipline", value: profile.discipline },
              { label: "Area of Interest", value: profile.areaOfInterest },
              { label: "Tools", value: profile.tools },
              { label: "Complexity", value: profile.complexityLevel },
              { label: "Preference", value: profile.preference },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/stage1")}
            className="mt-4 text-xs text-gray-400 hover:text-gray-700 transition"
          >
            Edit profile
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {!prompted && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Ready to prompt your topics</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Click below to prompt 5 project topics based specifically on your profile inputs.
          </p>
          <button
            onClick={handlePrompt}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? "Prompting your topics..." : "Prompt my topics →"}
          </button>
        </div>
      )}

      {prompted && topics.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Your 5 prompted topics</p>
            <button
              onClick={handleReprompt}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-gray-700 transition disabled:opacity-50"
            >
              {loading ? "Reprompting..." : "↺ Reprompt"}
            </button>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            {topics.map((topic, index) => (
              <div
                key={index}
                onClick={() => handleSelectTopic(topic.title)}
                className={`bg-white rounded-2xl border p-5 md:p-6 cursor-pointer transition ${
                  selectedTopic === topic.title ? "border-gray-900 shadow-sm" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {selectedTopic === topic.title && (
                    <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Selected</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{topic.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{topic.description}</p>
                <div className="border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-400">
                    <span className="text-gray-600 font-medium">Why it matters:</span> {topic.relevance}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedTopic}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Topic Development
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Stage2;