import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

interface LayoutProps {
  children: ReactNode;
  activePath: string;
  variant?: "default" | "chat";
}

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Student Profiling", path: "/stage1" },
  { label: "Topic Prompting", path: "/stage2" },
  { label: "Topic Development", path: "/stage3" },
  { label: "Research Kickstart", path: "/stage4" },
  { label: "Project Timeline", path: "/stage5" },
  { label: "Download Plan", path: "/stage6" },
];

const Layout = ({ children, activePath, variant = "default" }: LayoutProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const goTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0]">

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <h1 className="text-sm font-semibold text-gray-900">
          FYP Topic Prompting System
        </h1>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 shrink-0"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-[3px]">
            <span className={`w-4 h-0.5 bg-gray-700 transition ${menuOpen ? "rotate-45 translate-y-[5px]" : ""}`} />
            <span className={`w-4 h-0.5 bg-gray-700 transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`w-4 h-0.5 bg-gray-700 transition ${menuOpen ? "-rotate-45 -translate-y-[5px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-5 py-4 sticky top-[57px] z-20">
          <nav className="flex flex-col gap-1 mb-4">
            {navItems.map((item) => {
              const active = item.path === activePath;
              return (
                <button
                  key={item.label}
                  onClick={() => goTo(item.path)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition ${
                    active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-gray-900" : "bg-gray-300"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-400 truncate mb-3">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-white border-r border-gray-100 flex-col px-5 py-6 fixed left-0 top-0">
        <div className="mb-8">
          <h1 className="text-sm font-semibold text-gray-900">
            FYP Topic Prompting System
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Personalized project guidance
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = item.path === activePath;
            return (
              <button
                key={item.label}
                onClick={() => goTo(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition ${
                  active ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-gray-900" : "bg-gray-300"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</p>
          <p className="text-xs text-gray-400 truncate mb-4">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      {variant === "chat" ? (
        <main className="md:ml-64 flex flex-col h-[calc(100dvh-57px)] md:h-screen max-w-3xl">
          {children}
        </main>
      ) : (
        <main className="md:ml-64 px-5 md:px-10 py-6 md:py-10 max-w-3xl">
          {children}
        </main>
      )}
    </div>
  );
};

export default Layout;