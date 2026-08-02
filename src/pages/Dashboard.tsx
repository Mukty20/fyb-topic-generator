import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "projects", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProjectData(docSnap.data());
        }
      } catch (err) {
        console.log("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const firstName = user?.displayName?.split(" ")[0] || "Student";

  // A user only counts as "has data" once they've completed Stage 1
  const hasStarted = projectData && projectData.discipline;

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
            { label: "Dashboard", path: "/dashboard", active: true },
            { label: "Student Profiling", path: "/stage1" },
            { label: "Topic Prompting", path: "/stage2" },
            { label: "Topic Development", path: "/stage3" },
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
          <p className="text-xs text-gray-400 truncate mb-4">
            {user?.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 px-10 py-10 max-w-4xl">

        {loading ? (
          <p className="text-sm text-gray-400">Loading your workspace...</p>
        ) : !hasStarted ? (

          /* ───────── NEW USER — no data yet ───────── */
          <>
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Welcome back, {firstName}
              </h2>
              <p className="text-sm text-gray-400">
                Your personalized project topic journey continues here.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Getting started
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your workspace is waiting
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-lg leading-relaxed">
                Begin with <span className="text-gray-700 font-medium">Student Profiling</span> from
                the sidebar. Your inputs drive every stage that follows —
                each student gets a completely unique result based on their own profile.
              </p>
              <button
                onClick={() => navigate("/stage1")}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
              >
                Begin guided setup
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
                How it works
              </p>
              <div className="flex flex-col gap-5">
                {[
                  { step: "01", text: "Complete your student profile so the system understands your interests and goals." },
                  { step: "02", text: "Receive 5 project topics prompted uniquely from your inputs — no two students get the same result." },
                  { step: "03", text: "Develop your chosen topic with guided questions and get a step by step roadmap." },
                  { step: "04", text: "Get key concepts and search terms to kick off your literature review." },
                  { step: "05", text: "Receive a personalized project timeline from proposal to submission." },
                  { step: "06", text: "Download your complete project plan as a PDF to share with your supervisor." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="text-xs font-bold text-gray-300 mt-0.5 w-6 shrink-0">
                      {item.step}
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>

        ) : (

          /* ───────── RETURNING USER — has data ───────── */
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Welcome back, {firstName}
              </h2>
              <p className="text-sm text-gray-400">
                Here's where your project stands right now.
              </p>
            </div>

            {/* Selected Topic */}
            {projectData.selectedTopic && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                  Your Selected Topic
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {projectData.selectedTopic}
                </p>
              </div>
            )}

            {/* Profile Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Profile Summary
                </p>
                <button
                  onClick={() => navigate("/stage1")}
                  className="text-xs text-gray-400 hover:text-gray-700 transition"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Discipline", value: projectData.discipline },
                  { label: "Area of Interest", value: projectData.areaOfInterest },
                  { label: "Tools", value: projectData.tools },
                  { label: "Complexity", value: projectData.complexityLevel },
                  { label: "Preference", value: projectData.preference },
                ].filter(item => item.value).map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Development Roadmap (Stage 3) */}
            {projectData.topicDevelopment?.roadmap?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    Topic Development Roadmap
                  </p>
                  <button
                    onClick={() => navigate("/stage3")}
                    className="text-xs text-gray-400 hover:text-gray-700 transition"
                  >
                    View full stage
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {projectData.topicDevelopment.roadmap.map((step: any) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-medium shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Timeline (Stage 5) */}
            {projectData.projectTimeline?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">
                    Project Timeline
                  </p>
                  <button
                    onClick={() => navigate("/stage5")}
                    className="text-xs text-gray-400 hover:text-gray-700 transition"
                  >
                    View full stage →
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {projectData.projectTimeline.map((phase: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{phase.phase}</p>
                        <p className="text-xs text-gray-400">{phase.activity}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                        {phase.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                Completion Status
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Student Profiling", done: !!projectData.discipline },
                  { label: "Topic Prompting", done: !!projectData.selectedTopic },
                  { label: "Topic Development", done: !!projectData.topicDevelopment?.problem },
                  { label: "Research Kickstart", done: !!projectData.researchKickstart?.keyConcepts },
                  { label: "Project Timeline", done: projectData.projectTimeline?.length > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      item.done ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-300"
                    }`}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <p className={`text-sm ${item.done ? "text-gray-700" : "text-gray-400"}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              {projectData.projectTimeline?.length > 0 && (
                <button
                  onClick={() => navigate("/stage6")}
                  className="w-full mt-5 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
                >
                  Go to Download Plan
                </button>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
};

export default Dashboard;