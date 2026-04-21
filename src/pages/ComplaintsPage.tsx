import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Zap, Droplets, SprayCan, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Electrical: <Zap className="w-4 h-4" />,
  Plumbing: <Droplets className="w-4 h-4" />,
  Cleaning: <SprayCan className="w-4 h-4" />,
  Other: <AlertCircle className="w-4 h-4" />
};

const STATUS_STYLE: Record<ComplaintStatus, { label: string; className: string; icon: React.ReactNode }> = {
  open: { label: "Open", className: "bg-destructive/10 text-destructive border-destructive/30", icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { label: "In Progress", className: "bg-warning/10 text-warning-foreground border-warning/30", icon: <Loader2 className="w-3 h-3" /> },
  resolved: { label: "Resolved", className: "bg-success/10 text-success border-success/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border", icon: <CheckCircle2 className="w-3 h-3" /> },
};

const ComplaintsPage = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other"); // Not strictly in DB schema but good for UI if we added it. 
  // Wait, DB schema only has title, description, status, adminResponse. 
  // I'll put category in title or description or just ignore it for now/append to title.

  // Admin Action State
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("in_progress");

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await fetch('http://127.0.0.1:5000/api/complaints', { headers });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      };

      const res = await fetch('http://127.0.0.1:5000/api/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: `[${category}] ${title}`,
          description
        })
      });

      if (res.ok) {
        toast.success("Complaint submitted");
        fetchComplaints();
        setShowForm(false);
        setTitle(""); setDescription("");
      } else {
        toast.error("Failed to submit complaint");
      }
    } catch (error) {
      toast.error("Error submitting complaint");
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      };

      const res = await fetch(`http://127.0.0.1:5000/api/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: newStatus,
          adminResponse
        })
      });

      if (res.ok) {
        toast.success("Complaint updated");
        fetchComplaints();
        setSelectedComplaint(null);
      } else {
        toast.error("Failed to update complaint");
      }
    } catch (error) {
      toast.error("Error updating complaint");
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
          <p className="text-muted-foreground">{user?.role === 'admin' ? 'Manage Student Complaints' : 'Submit and track your complaints'}</p>
        </div>
        {user?.role === 'student' && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2">
            <Plus className="w-4 h-4" /> New Complaint
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4 animate-scale-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Brief complaint title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white border-0">Submit</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {complaints.length === 0 ? <p className="text-muted-foreground">No complaints found.</p> : complaints.map(c => {
          const statusInfo = STATUS_STYLE[c.status as ComplaintStatus] || STATUS_STYLE.open;
          // Extract category from title if possible, or default
          const categoryMatch = c.title.match(/^\[(.*?)\]/);
          const displayCategory = categoryMatch ? categoryMatch[1] : "Other";
          const displayTitle = categoryMatch ? c.title.replace(/^\[.*?\]\s*/, "") : c.title;

          return (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    {CATEGORY_ICONS[displayCategory] || CATEGORY_ICONS.Other}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{displayTitle}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {displayCategory} • {new Date(c.createdAt).toLocaleDateString()}
                      {user?.role === 'admin' && c.User && ` • ${c.User.name} (${c.User.hostelRoom})`}
                    </p>
                    {c.adminResponse && (
                      <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md border border-border">
                        <span className="font-semibold text-xs uppercase text-muted-foreground">Admin Response:</span>
                        <p className="text-foreground">{c.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className={statusInfo.className}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.label}</span>
                  </Badge>
                  {user?.role === 'admin' && (
                    <Button variant="ghost" size="sm" onClick={() => {
                      setSelectedComplaint(c);
                      setAdminResponse(c.adminResponse || "");
                      setNewStatus(c.status);
                    }}>
                      Update Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v: ComplaintStatus) => setNewStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Response</Label>
              <Textarea value={adminResponse} onChange={e => setAdminResponse(e.target.value)} placeholder="Add a response..." rows={3} />
            </div>
            <Button type="submit" className="w-full">Update</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsPage;
