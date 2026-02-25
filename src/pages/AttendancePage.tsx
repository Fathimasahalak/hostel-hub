import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, X, Ban, HelpCircle, Save, Loader2, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AttendanceStatus = "present" | "absent" | "leave" | "mess_cut";

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-success text-success-foreground",
  absent: "bg-destructive text-destructive-foreground",
  leave: "bg-warning text-warning-foreground",
  mess_cut: "bg-purple-500 text-white",
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave",
  mess_cut: "Mess Cut",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AttendancePage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  // Data for Student View (Monthly)
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);

  // Data for Admin View (Daily)
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [adminAttendance, setAdminAttendance] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    fetchAttendance();
  }, [date, user]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      if (user?.role === 'student') {
        const res = await fetch(`http://127.0.0.1:5000/api/attendance`, { headers });
        const data = await res.json();
        setStudentAttendance(data);
      } else if (user?.role === 'admin') {
        // Parallel Fetch: All Users AND Attendance for date
        const [usersRes, attendanceRes] = await Promise.all([
          fetch(`http://127.0.0.1:5000/api/users`, { headers }),
          fetch(`http://127.0.0.1:5000/api/attendance?date=${formattedDate}`, { headers })
        ]);

        if (usersRes.status === 401 || usersRes.status === 403 || attendanceRes.status === 401 || attendanceRes.status === 403) {
          logout();
          return;
        }

        const allStudents = await usersRes.json();
        const attendanceData = await attendanceRes.json();

        if (!Array.isArray(allStudents) || !Array.isArray(attendanceData)) {
          setStudentsList([]);
          setAdminAttendance({});
          return;
        }

        // Create a map of existing status
        const statusMap: Record<string, AttendanceStatus> = {};

        // Default everyone to 'present' if no record exists, or just leave undefined?
        // Usually, default to Present makes taking attendance faster.
        allStudents.forEach((student: any) => {
          statusMap[student.id] = 'present';
        });

        // Overwrite with existing records
        attendanceData.forEach((r: any) => {
          statusMap[r.userId] = r.status;
        });

        setStudentsList(allStudents);
        setAdminAttendance(statusMap);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Calendar Navigation
  const goToPrevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const goToNextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const goToPrevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d);
  };
  const goToNextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d);
  };

  const markStatus = async (userId: string, status: AttendanceStatus) => {
    if (user?.role !== 'admin') return;
    setAdminAttendance(prev => ({ ...prev, [userId]: status }));
  };

  const saveAttendance = async () => {
    try {
      const records = Object.entries(adminAttendance).map(([userId, status]) => ({ userId, status }));
      const res = await fetch(`http://127.0.0.1:5000/api/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          records
        })
      });

      if (res.ok) {
        toast.success("Attendance saved successfully");
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error("Failed to save attendance");
    }
  };

  if (loading && !studentAttendance.length && !studentsList.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">{user?.role === 'admin' ? 'Manage Daily Attendance' : 'Track your monthly attendance'}</p>
        </div>
      </div>

      {user?.role === 'student' ? (
        <StudentCalendarView
          currentDate={date}
          attendanceData={studentAttendance}
          onPrev={goToPrevMonth}
          onNext={goToNextMonth}
        />
      ) : (
        <AdminDailyView
          date={date}
          students={studentsList}
          attendance={adminAttendance}
          onPrev={goToPrevDay}
          onNext={goToNextDay}
          onMark={markStatus}
          onSave={saveAttendance}
        />
      )}
    </div>
  );
};

// Component for Student View
const StudentCalendarView = ({ currentDate, attendanceData, onPrev, onNext }: any) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const getStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Find record by date string comparison (ignoring time if relevant)
    // Backend returns YYYY-MM-DD string as .date usually
    const record = attendanceData.find((r: any) => r.date === dateStr);
    return record?.status;
  };

  // Stats calculation
  const counts = attendanceData.reduce((acc: any, curr: any) => {
    // Filter for current month
    if (new Date(curr.date).getMonth() === month && new Date(curr.date).getFullYear() === year) {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["present", "absent", "leave", "mess_cut"] as AttendanceStatus[]).map(s => (
          <div key={s} className="bg-card rounded-xl border border-border p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">{counts[s] || 0}</p>
            <p className="text-xs text-muted-foreground">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onPrev} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">{MONTHS[month]} {year}</h3>
          <button onClick={onNext} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getStatus(day);
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${status ? STATUS_COLORS[status as AttendanceStatus] : "text-muted-foreground"
                  } ${day === today.getDate() && month === today.getMonth() ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Component for Admin View
const AdminDailyView = ({ date, students, attendance, onPrev, onNext, onMark, onSave }: any) => {
  const formattedDate = date.toDateString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-card">
        <div className="flex items-center gap-4">
          <button onClick={onPrev} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-semibold text-lg">{formattedDate}</span>
          <button onClick={onNext} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <Button onClick={onSave} className="gap-2">
          <Save className="w-4 h-4" /> Save Attendance
        </Button>
      </div>

      <div className="space-y-2">
        {students.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No students found.
          </div>
        ) : (
          students.map((student: any) => {
            const status = attendance[student.id] || 'present';
            // Student object from /api/users is direct, not nested under User
            const name = student.name || "Unknown Student";
            const room = student.hostelRoom || "N/A";

            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded-xl border border-border gap-4">
                <div>
                  <p className="font-medium text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">Room: {room} • ID: {student.studentId || 'N/A'}</p>
                </div>
                <div className="flex gap-2 bg-muted/50 p-1 rounded-lg self-start sm:self-auto">
                  {(['present', 'absent', 'mess_cut'] as AttendanceStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => onMark(student.id, s)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${status === s
                        ? STATUS_COLORS[s] + " shadow-sm transform scale-105"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                        }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
