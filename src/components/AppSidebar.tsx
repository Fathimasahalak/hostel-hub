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

  return (
    <>
      {/* Mobile overlay */}
      <button
        onClick={() => setCollapsed(false)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-card border border-border"
        style={{ display: collapsed ? "none" : undefined }}
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"
          } max-lg:${collapsed ? "-translate-x-full" : "translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary/20 shrink-0">
            <Building2 className="w-5 h-5 text-sidebar-primary" />
          </div>
          {!collapsed && <span className="font-bold text-lg text-sidebar-accent-foreground">HostelHub</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded hover:bg-sidebar-accent transition-colors hidden lg:block"
          >
            <ChevronLeft className={`w-4 h-4 text-sidebar-muted transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="animate-slide-in-left">{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-sidebar-border">
          {!collapsed && user && (
            <div className="px-3 mb-3">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-muted capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
