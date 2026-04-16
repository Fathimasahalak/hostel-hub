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
  ChevronLeft,
  Menu,
  Utensils,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/bills", label: "Hostel Bills", icon: Receipt },
  { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/mess", label: "Mess Menu", icon: Utensils },
  { to: "/community", label: "Community", icon: Users },
];

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(false)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border"
        style={{
          background: "#18121E",
          borderColor: "rgba(255,255,255,0.12)",
          display: collapsed ? "none" : undefined,
        }}
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      <aside
  className={`fixed inset-y-0 left-4 top-2 z-40 flex flex-col gap-2 p-3 transition-all duration-300 ${
    collapsed ? "w-[68px]" : "w-60"
  }`}
  
   
>

  {/* MAIN CARD */}
  <div
    className="flex flex-col gap-3 p-3 rounded-xl flex-1"
    style={{
      background: "#412959",
    }}
  >

    {/* Logo */}
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <Building2 className="w-4 h-4 text-white" />
      </div>

      {!collapsed && (
        <span className="font-medium text-white text-sm">
          HostelHub
        </span>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="ml-auto p-1 rounded hidden lg:block"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <ChevronLeft
          className={`w-4 h-4 transition-transform ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>

    {/* User */}
    {user && (
      <div className="flex items-center gap-3 mt-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium text-white"
          style={{
            background:
              "linear-gradient(135deg, #7c5cbf, #4a3080)",
          }}
        >
          {initials}
        </div>

        {!collapsed && (
          <div>
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>

            <p
              className="text-xs capitalize"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              {user.role}
            </p>
          </div>
        )}
      </div>
    )}

    {/* Divider */}
    <div className="h-px bg-white/10 my-2" />

    {/* Nav Links */}
    <div className="flex flex-col gap-1 flex-1">
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;

        return (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: isActive
                ? "rgba(255,255,255,0.12)"
                : "transparent",
              color: isActive
                ? "#ffffff"
                : "rgba(255,255,255,0.55)",
            }}
          >
            <Icon className="w-4 h-4 shrink-0" />

            {!collapsed && <span>{label}</span>}
          </NavLink>
        );
      })}
    </div>

  </div>


  {/* SEPARATE SIGN OUT CARD */}
  <div
    className="p-2 rounded-xl"
    style={{
      background: "#412959",
    }}
  >
    <button
      onClick={logout}
      className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors"
      style={{ color: "rgba(255,255,255,0.4)" }}
    >
      <LogOut className="w-4 h-4 shrink-0" />

      {!collapsed && "Sign out"}
    </button>
  </div>

</aside>
    </>
  );
};

export default AppSidebar;