import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";

const AppLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
          <div className="ml-10 lg:ml-0">
            <h2 className="text-lg font-semibold text-foreground">
              Welcome, {user?.name}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role} {user?.room ? `• Room ${user.room}` : ""}
            </p>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default AppLayout;
