import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const stages = [
  {
    number: "01",
    title: "Student Profiling",
    desc: "Tell us about your discipline, interests, skills, and complexity preference.",
    path: "/stage1"
  },
  {
    number: "02",
    title: "Topic Prompting",
    desc: "Get 5 project topics prompted uniquely from your profile inputs.",
    path: "/stage2"
  },
  {
    number: "03",
    title: "Topic Development",
    desc: "Think through your chosen topic with guided questions and get a roadmap.",
    path: "/stage3"
  },
  {
    number: "04",
    title: "Research Kickstart",
    desc: "Get key concepts, related areas, and search terms for your literature review.",
    path: "/stage4"
  },
  {
    number: "05",
    title: "Project Timeline",
    desc: "Get a personalized phase by phase project plan based on your complexity level.",
    path: "/stage5"
  },
  {
    number: "06",
    title: "Download Your Plan",
    desc: "Save and download your complete project plan as a PDF.",
    path: "/stage6"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const firstName = user?.displayName?.split(" ")[0] || "Student";

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col px-5 py-6 fixed left-0 top-0">

        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-sm font-semibold text-gray-900">
            FYP Topic Prompting System
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Personalized project guidance
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 text-sm font-medium text-left"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-900"></span>
            Dashboard
          </button>
          <button
            onClick={() => navigate("/stage1")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-gray-50 text-sm text-left transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
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

        {/* Bottom — User and Logout */}
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
      <main className="ml-64 flex-1 px-10 py-10">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Your workspace is waiting
          </h2>
          <p className="text-sm text-gray-400">
            Work through each stage to get your personalized project topic and complete planning guide.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            Getting started
          </p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome, {firstName}
          </h3>
          <p className="text-sm text-gray-400 mb-5 max-w-lg">
            Begin with Stage 01 Student Profiling. Your inputs drive every stage
            that follows. Each student gets a completely unique result based on
            their own profile.
          </p>
          <button
            onClick={() => navigate("/stage1")}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
          >
            Begin guided setup 
          </button>
        </div>

        {/* Stages Grid */}
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-5">
          All stages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.number}
              onClick={() => navigate(stage.path)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-sm hover:border-gray-200 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl font-bold text-gray-100 group-hover:text-gray-200 transition">
                  {stage.number}
                </span>
                <span className="text-gray-200 group-hover:text-gray-900 transition">
                  →
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {stage.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

      </main>

    </div>
  );
};

export default Dashboard;