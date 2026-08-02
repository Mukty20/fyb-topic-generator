import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import jsPDF from "jspdf";

const Stage6 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
          setProjectData(data);
        } else {
          navigate("/stage1");
        }
      } catch (err) {
        console.log("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleDownload = () => {
    if (!projectData) return;
    setGenerating(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = 25;

      const addWrappedText = (text: string, fontSize: number, isBold: boolean, spaceAfter: number) => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (y > 275) {
            pdf.addPage();
            y = 25;
          }
          pdf.text(line, margin, y);
          y += fontSize * 0.5;
        });
        y += spaceAfter;
      };

      const addSectionHeader = (text: string) => {
        if (y > 260) {
          pdf.addPage();
          y = 25;
        }
        y += 4;
        pdf.setFillColor(20, 20, 30);
        pdf.rect(margin, y - 5, maxWidth, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(text.toUpperCase(), margin + 3, y);
        pdf.setTextColor(0, 0, 0);
        y += 10;
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("Personal Project Plan", margin, y);
      y += 8;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Prepared for ${user?.displayName || "Student"}`, margin, y);
      pdf.setTextColor(0, 0, 0);
      y += 12;

      // Selected Topic
      addSectionHeader("Selected Project Topic");
      addWrappedText(projectData.selectedTopic, 13, true, 5);

      // Profile Summary
      addSectionHeader("Student Profile Summary");
      addWrappedText(`Discipline: ${projectData.discipline}`, 10, false, 2);
      addWrappedText(`Area of Interest: ${projectData.areaOfInterest}`, 10, false, 2);
      addWrappedText(`Tools & Languages: ${projectData.tools}`, 10, false, 2);
      addWrappedText(`Complexity Level: ${projectData.complexityLevel}`, 10, false, 2);
      addWrappedText(`Preference: ${projectData.preference}`, 10, false, 5);

      // Topic Development
      if (projectData.topicDevelopment?.problem) {
        addSectionHeader("Topic Development");
        addWrappedText("The Problem:", 10, true, 1);
        addWrappedText(projectData.topicDevelopment.problem, 10, false, 3);
        addWrappedText("Who is Affected:", 10, true, 1);
        addWrappedText(projectData.topicDevelopment.affected, 10, false, 3);
        addWrappedText("The Solution:", 10, true, 1);
        addWrappedText(projectData.topicDevelopment.solution, 10, false, 3);
        addWrappedText("What Makes it Different:", 10, true, 1);
        addWrappedText(projectData.topicDevelopment.difference, 10, false, 5);

        if (projectData.topicDevelopment.roadmap?.length > 0) {
          addWrappedText("Development Roadmap:", 10, true, 2);
          projectData.topicDevelopment.roadmap.forEach((step: any) => {
            addWrappedText(`Step ${step.step}: ${step.title}`, 10, true, 1);
            addWrappedText(step.description, 9, false, 3);
          });
        }
      }

      // Research Kickstart
      if (projectData.researchKickstart?.keyConcepts) {
        addSectionHeader("Research Kickstart");
        addWrappedText("Key Concepts to Explore:", 10, true, 1);
        projectData.researchKickstart.keyConcepts.forEach((c: string, i: number) => {
          addWrappedText(`${i + 1}. ${c}`, 9, false, 1);
        });
        y += 3;
        addWrappedText("Related Technology Areas:", 10, true, 1);
        projectData.researchKickstart.relatedAreas.forEach((a: string) => {
          addWrappedText(`- ${a}`, 9, false, 1);
        });
        y += 3;
        addWrappedText("Recommended Search Terms:", 10, true, 1);
        projectData.researchKickstart.searchTerms.forEach((s: string) => {
          addWrappedText(`"${s}"`, 9, false, 1);
        });
        y += 3;
      }

      // Project Timeline
      if (projectData.projectTimeline?.length > 0) {
        addSectionHeader("Project Timeline");
        projectData.projectTimeline.forEach((phase: any) => {
          addWrappedText(`${phase.phase} (${phase.duration})`, 10, true, 1);
          addWrappedText(phase.activity, 9, false, 3);
        });
      }

      // Footer
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          "Generated by FYP Topic Prompting System",
          margin,
          290
        );
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 290);
      }

      pdf.save("Personal_Project_Plan.pdf");
    } catch (err) {
      console.log("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading your project plan...</p>
      </div>
    );
  }

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
            { label: "Project Timeline", path: "/stage5" },
            { label: "Download Plan", path: "/stage6", active: true },
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
            Stage 06
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Personal Project Plan
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Everything you've built across all five stages, ready to review
            and download as a single document to share with your supervisor.
          </p>
        </div>

        {projectData && (
          <div className="flex flex-col gap-5">

            {/* Topic */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Your Topic
              </p>
              <p className="text-base font-semibold text-gray-900">
                {projectData.selectedTopic}
              </p>
            </div>

            {/* Completion Checklist */}
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
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        item.done
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-300"
                      }`}
                    >
                      {item.done ? "✓" : "○"}
                    </span>
                    <p className={`text-sm ${item.done ? "text-gray-700" : "text-gray-400"}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Ready to download
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                Your complete project plan will be compiled into a clean PDF
                document, ready to share with your supervisor.
              </p>
              <button
                onClick={handleDownload}
                disabled={generating}
                className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                {generating ? "Generating PDF..." : "Download Project Plan"}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default Stage6;