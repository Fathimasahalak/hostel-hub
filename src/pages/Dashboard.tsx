import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Receipt, MessageSquareWarning, Users, AlertCircle, Loader2 } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
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
        const [attendanceRes, feesRes, complaintsRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/attendance`, { headers }),
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

  return (
    <div className="h-full flex flex-col gap-5 animate-fade-in overflow-hidden -mt-2">
      <PageHeader name={user?.name} role={user?.role} />
      {user?.role === 'admin' ? <AdminDashboard stats={stats} /> : <StudentDashboard stats={stats} />}
    </div>
  );
};

const PageHeader = ({ role }: { name?: string; role?: string }) => (
  <div className="shrink-0 flex items-center justify-between">
    <div>
      <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500 mt-0.5">
        Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </div>
    <span className="text-[13px] px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 font-medium">
      {role === 'admin' ? 'Admin view' : 'Student view'}
    </span>
  </div>
);

// Soft pastel badge: light tint background, solid-color icon/text on top — matches the reference's "pill" style
const StatCard = ({ label, value, icon: Icon, to, bg, fg }: any) => (
  <Link
    to={to}
    className="rounded-2xl p-4 bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${fg}`} strokeWidth={2} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    <p className="text-[13px] text-slate-500 mt-0.5">{label}</p>
  </Link>
);

const AdminDashboard = ({ stats }: { stats: any }) => {
  const attendance = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter((a: any) => a.date === todayStr);
  const presentCount = todaysAttendance.filter((a: any) => a.status === 'present').length;
  const absentCount = todaysAttendance.filter((a: any) => a.status === 'absent').length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyAttendanceData = last7Days.map(dateStr => {
    const dayAttendance = attendance.filter((a: any) => a.date === dateStr);
    return {
      day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      present: dayAttendance.filter((a: any) => a.status === 'present').length,
      absent: dayAttendance.filter((a: any) => a.status === 'absent').length
    };
  });

  const complaints = Array.isArray(stats?.complaints) ? stats.complaints : [];
  const openComplaints = complaints.filter((c: any) => c.status === 'open').length || 0;
  const inProgressComplaints = complaints.filter((c: any) => c.status === 'in_progress').length || 0;
  const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved').length || 0;
  const closedComplaints = complaints.filter((c: any) => c.status === 'closed').length || 0;

  // Soft pastel palette, matching the reference donut chart tones
  const pieData = [
    { name: 'Open', value: openComplaints, color: '#fbbf24' },
    { name: 'In Progress', value: inProgressComplaints, color: '#a78bfa' },
    { name: 'Resolved', value: resolvedComplaints, color: '#6ee7b7' },
    { name: 'Closed', value: closedComplaints, color: '#93c5fd' }
  ].filter(d => d.value > 0);

  const quickStats = [
    { label: "Present today", value: presentCount.toString(), icon: CalendarDays, to: "/attendance", bg: "bg-emerald-50", fg: "text-emerald-600" },
    { label: "Absent today", value: absentCount.toString(), icon: AlertCircle, to: "/attendance", bg: "bg-rose-50", fg: "text-rose-600" },
    { label: "Open complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", bg: "bg-amber-50", fg: "text-amber-600" },
    { label: "Total students", value: "View all", icon: Users, to: "/attendance", bg: "bg-violet-50", fg: "text-violet-600" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {quickStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 pb-2">
        <Card className="bg-white border-slate-100 rounded-2xl flex flex-col h-full overflow-hidden shadow-none">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-base font-semibold text-slate-900">Attendance overview</CardTitle>
            <p className="text-[13px] text-slate-500">Daily check-ins/outs</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pb-4 min-h-0 px-4">
            <div className="flex-1 w-full min-h-0 relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={weeklyAttendanceData} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                    <Bar name="Absent" dataKey="absent" fill="#fecaca" barSize={10} radius={[4, 4, 0, 0]} />
                    <Bar name="Present" dataKey="present" fill="#6ee7b7" barSize={10} radius={[4, 4, 0, 0]} />
                    <Line type="monotone" name="Trend" dataKey="present" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3, fill: "#14b8a6", strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 rounded-2xl flex flex-col h-full overflow-hidden shadow-none">
          <CardHeader className="pb-2 shrink-0">
            <CardTitle className="text-base font-semibold text-slate-900">Complaints overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center pb-4 min-h-0 px-4">
            <div className="flex-1 w-full min-h-0 relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: 'None', value: 1, color: '#f1f5f9' }]}
                      cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none"
                    >
                      {(pieData.length > 0 ? pieData : [{ color: '#f1f5f9' }]).map((entry: any, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900 leading-none">{complaints.length}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">total</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 w-full px-4 shrink-0">
              <Legend color="#fbbf24" label="Open" />
              <Legend color="#a78bfa" label="In progress" />
              <Legend color="#6ee7b7" label="Resolved" />
              <Legend color="#93c5fd" label="Closed" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
    <span className="text-[13px] text-slate-600">{label}</span>
  </div>
);

const StudentDashboard = ({ stats }: { stats: any }) => {
  const myAttendance = Array.isArray(stats?.attendance) ? stats.attendance : [];
  const presentDays = myAttendance.filter((a: any) => a.status === 'present').length;
  const totalDays = myAttendance.length || 1;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

  const fees = Array.isArray(stats?.fees) ? stats.fees : [];
  const pendingFees = fees.filter((f: any) => !f.isPaid).reduce((acc: number, curr: any) => acc + curr.totalAmount, 0) || 0;

  const myComplaints = Array.isArray(stats?.complaints) ? stats.complaints : [];
  const openComplaints = myComplaints.filter((c: any) => c.status === 'open').length;

  const quickStats = [
    { label: "My attendance", value: `${attendancePercentage}%`, icon: CalendarDays, to: "/attendance", bg: "bg-emerald-50", fg: "text-emerald-600" },
    { label: "Pending dues", value: `₹${pendingFees}`, icon: Receipt, to: "/bills", bg: "bg-rose-50", fg: "text-rose-600" },
    { label: "My complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", bg: "bg-amber-50", fg: "text-amber-600" },
    { label: "Community", value: "View", icon: Users, to: "/community", bg: "bg-violet-50", fg: "text-violet-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      {quickStats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
};

export default Dashboard;
