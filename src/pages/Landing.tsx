import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900">

      {/* Navbar */}
      <nav className="px-8 py-5 flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-base font-medium tracking-tight text-gray-900">
          FYP Topic Generator
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 pt-24 pb-28 max-w-4xl mx-auto">
        <span className="text-sm text-gray-400 tracking-wide">
          For final year undergraduate students
        </span>
        <h2 className="text-5xl font-semibold leading-tight mt-5 mb-6 text-gray-900">
          Find a project topic <br /> that actually matters.
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Answer a few questions about your interests and skills.
          Get project topics prompted specifically from your inputs, a development roadmap,
          research guidance, and a project timeline all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
          >
            Begin guided setup →
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            I already have an account
          </button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Features */}
      <section className="px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
          {[
            {
              title: "Personalized profiling",
              desc: "Progressive questions that adapt to your discipline, skills, area of interest, and preferred complexity level."
            },
            {
              title: "Tailored topic suggestions",
              desc: "Five project topics prompted uniquely from your interests, skills, and goals   no two students get the same result not generic, not recycled, built around you."
            },
            {
              title: "Roadmap you can follow",
              desc: "A step by step development guide, research kickstart suggestions, and a phase by phase project timeline."
            }
          ].map((f) => (
            <div key={f.title}>
              <h4 className="text-base font-semibold text-gray-900 mb-3">
                {f.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* What you get */}
      <section className="px-8 py-20">
        <p className="text-xs text-gray-400 uppercase tracking-widest text-center mb-12">
          What you get
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            {
              title: "5 personalized topics",
              desc: "Generated based on your interests, tools, and complexity preference."
            },
            {
              title: "Topic development roadmap",
              desc: "Step by step breakdown of how to approach and build your chosen topic."
            },
            {
              title: "Research kickstart",
              desc: "Key concepts, related areas, and Google Scholar search terms."
            },
            {
              title: "Project timeline",
              desc: "Phase by phase plan from proposal to submission."
            },
            {
              title: "Personal dashboard",
              desc: "All your content saved and accessible anytime from your account."
            },
            {
              title: "PDF download",
              desc: "Export your complete project plan to share with your supervisor."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 bg-white rounded-2xl border border-gray-100 text-center hover:shadow-sm transition"
            >
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {item.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* CTA */}
      <section className="px-8 py-24 text-center max-w-3xl mx-auto">
        <h3 className="text-3xl font-semibold text-gray-900 mb-4 leading-snug">
          Ready to start your final year <br /> project the right way?
        </h3>
        <p className="text-gray-400 text-sm mb-10 max-w-md mx-auto leading-relaxed">
          Built for Computer Science and Engineering students at
          Kaduna State University and similar Nigerian institutions.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition"
        >
          Get started now →
        </button>
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200" />
      <footer className="px-8 py-6 max-w-6xl mx-auto flex justify-between items-center text-xs text-gray-400">
        <p>FYP Topic Generator</p>
        <p>Kaduna State University Computer Science</p>
      </footer>

    </div>
  );
};

export default Landing;