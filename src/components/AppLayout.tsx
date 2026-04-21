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

      {/* Main area offset by exact width of fixed w-56 sidebar */}
      <div className="flex flex-col flex-1 min-h-screen p-4 sm:p-6 gap-4 sm:gap-6 ml-56 relative overflow-x-hidden">
        {/* Header matching image layout */}
        <header
          className="flex items-center justify-between pb-2 bg-transparent z-30 relative"
        >
          <div className="ml-12 lg:ml-0 flex flex-col justify-center">
            <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mt-1">
              Welcome Back, {user?.name}
            </h1>
          </div>

          {/* Right side controls */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Profile Area */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[13px] font-bold text-slate-800 tracking-tight leading-tight">{user.name}</span>
                  <span className="text-[11px] font-semibold text-slate-500 capitalize leading-tight">{user.role}</span>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden outline outline-1 outline-slate-200 shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=f1f5f9&color=0f172a&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
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