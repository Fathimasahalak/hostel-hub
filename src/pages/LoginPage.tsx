import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Building2, GraduationCap, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<UserRole>("student");
  // Auth State
  const [isRegistering, setIsRegistering] = useState(false);

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRoom, setRegRoom] = useState("");

  const [error, setError] = useState("");
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: activeTab })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Defaulting to student role for public registration
      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: 'student',
          hostelRoom: parseInt(regRoom)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after registration or just switch to login?
      // Let's notify and switch to login for safety/ UX flow
      // Or just login immediately? 
      // Let's try to login immediately if we got a success, but the signup API might not return a token.
      // Checking authRoutes.js: Signup returns { message, userId }. No token.

      // So, switch to login view and pre-fill logic
      setIsRegistering(false);
      setEmail(regEmail);
      setPassword(regPassword); // Convenience
      setActiveTab('student');
      setError(""); // Clear any errors
      alert("Registration successful! Please sign in.");

    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HostelHub</h1>
        </div>

        <div className="bg-card rounded-xl shadow-elevated border border-border p-6">

          {!isRegistering ? (
            /* Login View */
            <>
              <div className="flex rounded-lg bg-muted p-1 mb-6">
                <button
                  onClick={() => { setActiveTab("student"); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "student"
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Student
                </button>
                <button
                  onClick={() => { setActiveTab("admin"); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === "admin"
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={activeTab === "student" ? "student@hostel.com" : "admin@hostel.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors">
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? 'Signing in...' : `Sign In as ${activeTab === "student" ? "Student" : "Admin"}`}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account? <button type="button" onClick={() => { setIsRegistering(true); setError(""); }} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Register</button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* Registration View */
            <>
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold">Student Registration</h2>
                <p className="text-sm text-muted-foreground">Create your account to join</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="regName">Full Name</Label>
                  <Input id="regName" placeholder="John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regRoom">Room No (Numbers only)</Label>
                  <Input id="regRoom" type="number" placeholder="101" value={regRoom} onChange={(e) => setRegRoom(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email (Username)</Label>
                  <Input id="regEmail" type="email" placeholder="student@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regPassword">Password</Label>
                  <Input id="regPassword" type="password" placeholder="Create a password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-colors">
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account? <button type="button" onClick={() => { setIsRegistering(false); setError(""); }} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Sign In</button>
                  </p>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
