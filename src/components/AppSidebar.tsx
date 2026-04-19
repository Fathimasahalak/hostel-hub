import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  MessageSquareWarning,
  Users,
  LogOut,
  Building2,
  Menu,
  Utensils,
} from "lucide-react";

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 bg-slate-100 border-r border-slate-200 shadow-sm flex flex-col w-64 h-screen overflow-hidden`}>
        {/* Header / Logo */}
        <div className="flex items-center gap-3 px-6 h-[88px] shrink-0 relative z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-blue-600 text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>

          <span className="font-semibold text-slate-900 text-lg tracking-tight">
            Hostel<span className="text-blue-600">Hub</span>
          </span>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide px-4 pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
          `}</style>

          <div className="flex flex-col gap-1.5 mb-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <LayoutDashboard className={`w-[22px] h-[22px] shrink-0`} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <CalendarDays className={`w-[22px] h-[22px] shrink-0`} />
              <span>Attendance</span>
            </NavLink>
            <NavLink
              to="/bills"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <Receipt className={`w-[22px] h-[22px] shrink-0`} />
              <span>Hostel Bills</span>
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <Users className={`w-[22px] h-[22px] shrink-0`} />
              <span>Community Hub</span>
            </NavLink>
            <NavLink
              to="/complaints"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <MessageSquareWarning className={`w-[22px] h-[22px] shrink-0`} />
              <span>Complaints</span>
            </NavLink>
            <NavLink
              to="/mess"
              className={({ isActive }) => `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${isActive ? "text-blue-700 bg-blue-100/50" : "text-slate-900 hover:bg-slate-200"}`}
            >
              <Utensils className={`w-[22px] h-[22px] shrink-0`} />
              <span>Mess Menu</span>
            </NavLink>
          </div>
        </div>

        {/* Footer / Log Out */}
        <div className="px-4 py-6 mt-auto">
            <button
              onClick={logout}
              className="flex items-center gap-3.5 px-3 py-2.5 w-full rounded-lg text-[15px] font-medium text-black hover:text-red-700 hover:bg-red-100 transition-colors group"
              title="Sign Out"
            >
              <LogOut className="w-[22px] h-[22px] shrink-0 group-hover:scale-110 transition-transform" />
              <span>Log Out</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;