import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  Receipt,
  MessageSquareWarning,
  Users,
  LogOut,
  Building2,
  Utensils,
} from "lucide-react";

const AppSidebar = () => {
  const { logout } = useAuth();

  const navItem = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
      isActive
        ? "bg-teal-500/15 text-teal-400"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 bg-[#14181f] border-r border-white/5 flex flex-col w-56 h-screen overflow-hidden">
      <div className="flex items-center gap-3 px-6 h-[88px] shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 bg-teal-500 text-white">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-semibold text-white text-lg tracking-tight">
          Hostel<span className="text-teal-400">Hub</span>
        </span>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-4" style={{ scrollbarWidth: "none" }}>
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Menu</p>
        <div className="flex flex-col gap-1 mb-6">
          <NavLink to="/dashboard" className={navItem}>
            <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/attendance" className={navItem}>
            <CalendarDays className="w-[18px] h-[18px] shrink-0" />
            <span>Attendance</span>
          </NavLink>
          <NavLink to="/bills" className={navItem}>
            <Receipt className="w-[18px] h-[18px] shrink-0" />
            <span>Hostel Bills</span>
          </NavLink>
          <NavLink to="/community" className={navItem}>
            <Users className="w-[18px] h-[18px] shrink-0" />
            <span>Community Hub</span>
          </NavLink>
          <NavLink to="/complaints" className={navItem}>
            <MessageSquareWarning className="w-[18px] h-[18px] shrink-0" />
            <span>Complaints</span>
          </NavLink>
          <NavLink to="/mess" className={navItem}>
            <Utensils className="w-[18px] h-[18px] shrink-0" />
            <span>Mess Menu</span>
          </NavLink>
        </div>
      </div>

      <div className="px-4 py-6 mt-auto border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-3 py-2.5 w-full rounded-lg text-[14px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;