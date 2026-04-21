import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Receipt, MessageSquareWarning, Users, TrendingUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
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

  return user?.role === 'admin' ? <AdminDashboard stats={stats} /> : <StudentDashboard stats={stats} user={user} />;
};

const AdminDashboard = ({ stats }: { stats: any }) => {
  const totalStudents = stats?.attendance?.length || 0; // Assuming attendance returns all users for admin or we fetch users separately. 
  // Note: For a real app we'd want a separate "users" endpoint or aggregate stats endpoint.
  // For now, let's derive what we can.

  const attendance = Array.isArray(stats?.attendance) ? stats.attendance : [];
  
  // Calculate today's attendance
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter((a: any) => a.date === todayStr);
  const presentCount = todaysAttendance.filter((a: any) => a.status === 'present').length;
  const absentCount = todaysAttendance.filter((a: any) => a.status === 'absent').length;

  // Generate real weekly data from the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyAttendanceData = last7Days.map(dateStr => {
    const dayAttendance = attendance.filter((a: any) => a.date === dateStr);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      present: dayAttendance.filter((a: any) => a.status === 'present').length,
      absent: dayAttendance.filter((a: any) => a.status === 'absent').length
    };
  });

  const complaints = Array.isArray(stats?.complaints) ? stats.complaints : [];
  const openComplaints = complaints.filter((c: any) => c.status === 'open').length || 0;
  const inProgressComplaints = complaints.filter((c: any) => c.status === 'in_progress').length || 0;
  const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved').length || 0;
  const closedComplaints = complaints.filter((c: any) => c.status === 'closed').length || 0;

  const pieData = [
    { name: 'Open', value: openComplaints, color: '#1e40af' },
    { name: 'In Progress', value: inProgressComplaints, color: '#3b82f6' },
    { name: 'Resolved', value: resolvedComplaints, color: '#60a5fa' },
    { name: 'Closed', value: closedComplaints, color: '#93c5fd' }
  ].filter(d => d.value > 0);

  const quickStats = [
    { label: "Present Today", value: presentCount.toString(), icon: CalendarDays, to: "/attendance", color: "bg-blue-50 text-blue-600" },
    { label: "Absent Today", value: absentCount.toString(), icon: AlertCircle, to: "/attendance", color: "bg-blue-50 text-blue-600" },
    { label: "Open Complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", color: "bg-blue-50 text-blue-600" },
    { label: "Total Students", value: "View All", icon: Users, to: "/attendance", color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in overflow-hidden -mt-2">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {quickStats.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:scale-[1.02] transition-all group"
          >
            <div className="flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5 text-current" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">
                {value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 pb-2">
        {/* Attendance Composed Chart */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl flex flex-col h-full overflow-hidden">
          <CardHeader className="text-slate-800 pb-2 shrink-0">
            <CardTitle className="text-lg font-bold">Attendance Overview</CardTitle>
            <p className="text-sm text-slate-500 font-medium">Daily Check-ins/outs</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center pb-4 min-h-0 px-4">
            <div className="flex-1 w-full min-h-0 relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyAttendanceData} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    ticks={[0, 30, 60, 90, 120]}
                    domain={[0, 120]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  />
                  <Bar 
                    name="Checked Out"
                    dataKey="absent" 
                    fill="#cbd5e1" 
                    barSize={10}
                  />
                  <Bar 
                    name="Checked In"
                    dataKey="present" 
                    fill="#2b5c8f" 
                    barSize={10}
                  />
                  <Line 
                    type="monotone" 
                    name="Trend"
                    dataKey="present" 
                    stroke="#2b5c8f" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#2b5c8f", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex w-full justify-between mt-4 border-t border-slate-100 pt-3 px-2 shrink-0">
               <p className="text-sm text-slate-700 font-bold">Checked In: <span className="text-slate-900">{presentCount}</span></p>
               <p className="text-sm text-slate-700 font-bold">Checked Out: <span className="text-slate-900">{absentCount}</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Donut Chart */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-xl flex flex-col h-full overflow-hidden">
          <CardHeader className="text-slate-800 pb-2 shrink-0">
            <CardTitle className="text-lg font-bold">Complaints Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center pb-4 min-h-0 px-4">
            <div className="flex-1 w-full min-h-0 relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length > 0 ? pieData : [{ name: 'No Complaints', value: 1, color: '#e2e8f0' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {(pieData.length > 0 ? pieData : [{ name: 'No Complaints', value: 1, color: '#e2e8f0' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-2xl font-bold text-slate-900 leading-none">{complaints.length}</p>
                   <p className="text-[11px] text-slate-500 font-medium">complaints</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 w-full px-6 shrink-0">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#1e40af]"></div><span className="text-[13px] text-slate-600 font-medium">Open</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div><span className="text-[13px] text-slate-600 font-medium">In Progress</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></div><span className="text-[13px] text-slate-600 font-medium">Resolved</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]"></div><span className="text-[13px] text-slate-600 font-medium">Closed</span></div>
            </div>

            <div className="flex w-full justify-between mt-4 border-t border-slate-100 pt-3 px-2 shrink-0">
               <p className="text-[13.5px] text-slate-700 font-semibold">Resolved/Closed: <span className="text-slate-900 font-bold">{resolvedComplaints + closedComplaints}</span></p>
               <p className="text-[13.5px] text-slate-700 font-semibold">Pending: <span className="text-slate-900 font-bold">{openComplaints + inProgressComplaints}</span></p>
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
    { label: "My Attendance", value: `${attendancePercentage}%`, icon: CalendarDays, to: "/attendance", color: "bg-blue-50 text-blue-600" },
    { label: "Pending Dues", value: `₹${pendingFees}`, icon: Receipt, to: "/bills", color: "bg-blue-50 text-blue-600" },
    { label: "My Complaints", value: openComplaints.toString(), icon: MessageSquareWarning, to: "/complaints", color: "bg-blue-50 text-blue-600" },
    { label: "Community", value: "View", icon: Users, to: "/community", color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in overflow-hidden -mt-2">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {quickStats.map(({ label, value, icon: Icon, to, color }) => (
          <Link
            key={label}
            to={to}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 hover:scale-[1.02] transition-all group"
          >
           <div className="flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5 text-current" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">
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


