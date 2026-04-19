import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30 selection:text-blue-900 min-h-screen">
      <AppSidebar />

      {/* Main area offset by exact width of fixed w-64 (256px) sidebar */}
      <div className="flex flex-col flex-1 min-h-screen p-4 sm:p-6 gap-4 sm:gap-6 ml-64 relative overflow-x-hidden">
        {/* Header card */}
        <header
          className="flex items-center justify-between px-6 py-4 rounded-2xl sticky top-4 z-30 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm"
        >
          <div className="ml-12 lg:ml-0 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Welcome back, <span className="text-blue-600">{user?.name}</span>
            </h2>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="uppercase tracking-widest text-blue-600/80">{user?.role}</span>
              {user?.room && <span className="w-1 h-1 rounded-full bg-slate-300" />}
              {user?.room && <span>Room {user.room}</span>}
            </p>
          </div>

          {/* Right-side User Profile */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-slate-900 tracking-tight">{user.name}</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{user.role}</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-blue-700 bg-blue-100/50 border border-blue-200 shadow-sm shrink-0">
                {user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Content area */}
        <main
          className="flex-1 rounded-3xl relative z-10 w-full min-h-0 relative"
        >
          <Outlet />
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

export default AppLayout;