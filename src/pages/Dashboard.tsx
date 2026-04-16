import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Receipt, MessageSquareWarning, Users, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        // Parallel data fetching for dashboard
        const [attendanceRes, feesRes, complaintsRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/attendance?date=${new Date().toISOString().split('T')[0]}`, { headers }),
          fetch('http://127.0.0.1:5000/api/fees', { headers }),
          fetch('http://127.0.0.1:5000/api/complaints', { headers })
        ]);

        if (attendanceRes.status === 401 || attendanceRes.status === 403) {
          logout();
          return;
        }

        const attendance = attendanceRes.ok ? await attendanceRes.json() : [];
        const fees = feesRes.ok ? await feesRes.json() : [];
        const complaints = complaintsRes.ok ? await complaintsRes.json() : [];

        setStats({
          attendance: Array.isArray(attendance) ? attendance : [],
          fees: Array.isArray(fees) ? fees : [],
          complaints: Array.isArray(complaints) ? complaints : []
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return user?.role === 'admin' ? <AdminDashboard stats={stats} /> : <StudentDashboard stats={stats} user={user} />;
};

const AdminDashboard = ({ stats }: { stats: any }) => {
  const totalStudents = stats?.attendance?.length || 0; // Assuming attendance returns all users for admin or we fetch users separately. 
  // Note: For a real app we'd want a separate "users" endpoint or aggregate stats endpoint.
  // For now, let's derive what we can.

  const attendance = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const presentCount = attendance.filter((a: any) => a.status === 'present').length || 0;
  const absentCount = totalStudents - presentCount;
  const complaints = Array.isArray(stats?.complaints) ? stats.complaints : [];
  const openComplaints = complaints.filter((c: any) => c.status === 'open').length || 0;

  const quickStats = [
    { label: "Present Today", value: presentCount.toString(), icon: CalendarDays, to: "/attendance", color: "bg-destructive/10 text-primary" },
    { label: "Absent Today", value: absentCount.toString(), icon: AlertCircle, to: "/attendance", color: "bg-destructive/10 text-destructive" },
    { label: "Open Complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", color: "bg-accent/10 text-accent-foreground" },
    { label: "Total Students", value: "View All", icon: Users, to: "/attendance", color: "bg-info/10 text-info" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage hostel operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-[#2a2232] rounded-xl p-5 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all group"
          >
            <div className="flex flex-col justify-between h-full">
  
  {/* Top row: label + icon */}
  <div className="flex justify-between items-start">
    <p className="text-sm text-muted-foreground">{label}</p>

    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>

  {/* Bottom value */}
  <p className="text-2xl font-bold text-white mt-4">
    {value}
  </p>

</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="text-white" >
            <CardTitle>Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.complaints?.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.User?.name} - {c.User?.hostelRoom}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
              {(!stats?.complaints || stats.complaints.length === 0) && <p className="text-muted-foreground">No complaints found.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StudentDashboard = ({ stats, user }: { stats: any, user: any }) => {
  const myAttendance = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const presentDays = myAttendance.filter((a: any) => a.status === 'present').length;
  const totalDays = myAttendance.length || 1; // Avoid division by zero
  const attendancePercentage = Math.round((presentDays / totalDays) * 100); // Simple calculation

  const fees = Array.isArray(stats?.fees) ? stats.fees : [];
  const pendingFees = fees.filter((f: any) => !f.isPaid).reduce((acc: number, curr: any) => acc + curr.totalAmount, 0) || 0;

  const myComplaints = Array.isArray(stats?.complaints) ? stats.complaints : [];
  const openComplaints = myComplaints.filter((c: any) => c.status === 'open').length;

  const quickStats = [
    { label: "My Attendance", value: `${attendancePercentage}%`, icon: CalendarDays, to: "/attendance", color: "bg-primary/10 text-primary" },
    { label: "Pending Dues", value: `₹${pendingFees}`, icon: Receipt, to: "/bills", color: "bg-accent/10 text-accent-foreground" },
    { label: "My Complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", color: "bg-destructive/10 text-destructive" },
    { label: "Community", value: "View", icon: Users, to: "/community", color: "bg-info/10 text-info" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Your hostel dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-[#2a2232] rounded-xl p-5 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all group"
          >
           <div className="flex flex-col justify-between h-full">
  {/* Top row: label + icon */}
  <div className="flex justify-between items-start">
    <p className="text-sm text-muted-foreground">{label}</p>

    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>

  {/* Bottom value */}
  <p className="text-2xl font-bold text-white mt-4">
    {value}
  </p>
</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


