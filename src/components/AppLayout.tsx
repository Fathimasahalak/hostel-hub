import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div
      className="min-h-screen flex"
      style={{
  background: `
    radial-gradient(ellipse at 15% 15%, rgba(124, 92, 191, 0.25) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(74, 48, 128, 0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 0%, rgba(100, 70, 160, 0.12) 0%, transparent 45%),
    #0f0a14
  `
}}
    >
      <AppSidebar />

      {/* Main area — offset by sidebar width */}
      <div
        className="flex flex-col flex-1 lg:pl-[260px] transition-all duration-300 min-h-screen p-3 gap-5"
      >
        {/* Header card */}
        <header
          className="fixed top-6 flex items-center justify-between px-5 py-3 rounded-2xl sticky top-3 z-30"
          style={{ background: "#412959" }}
        >
          <div className="ml-10 lg:ml-0">
            <h2 className="text-sm font-medium text-white">
              Welcome back, {user?.name}
            </h2>
            <p className="text-xs capitalize" style={{ color: "rgba(255,255,255,0.4)" }}>
              {user?.role}
              {user?.room ? ` · Room ${user.room}` : ""}
            </p>
          </div>

          {/* Optional right-side badge or actions */}
          <div
            className="text-xs px-3 py-1 rounded-full"
            style={{
              background: "rgba(167,139,250,0.12)",
              border: "0.5px solid rgba(167,139,250,0.25)",
              color: "#c4b5fd",
            }}
          >
            Spring 2026
          </div>
        </header>

        {/* Content area with gradient background */}
        <main
          className="flex-1 rounded-2xl relative overflow-hidden"
          style={{ minHeight: "unset",
            background: "#7d6495"
           }}
        >
          {/* Gradient background layer */}
          

          {/* Subtle grid texture overlay */}
          

          {/* Actual page content */}
          <div className="relative z-10 p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

export default AppLayout;