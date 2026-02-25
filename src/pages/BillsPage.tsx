import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Download, Plus, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BillsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("bills"); // 'bills' or 'settings'
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fee Structure State
  const [structureMonth, setStructureMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [rates, setRates] = useState({
    messRatePerDay: 0,
    establishmentFee: 0,
    wifiFee: 0,
    waterBill: 0
  });

  useEffect(() => {
    fetchFees();
    if (user?.role === 'admin') {
      fetchStructure();
    }
  }, [user, structureMonth]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await fetch('http://127.0.0.1:5000/api/fees', { headers });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      const data = await res.json();
      setFees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch fees", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructure = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await fetch(`http://127.0.0.1:5000/api/fees/structure?month=${structureMonth}`, { headers });
      const data = await res.json();
      setRates({
        messRatePerDay: data.messRatePerDay || 0,
        establishmentFee: data.establishmentFee || 0,
        wifiFee: data.wifiFee || 0,
        waterBill: data.waterBill || 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  const saveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      };
      const res = await fetch('http://127.0.0.1:5000/api/fees/structure', {
        method: 'POST',
        headers,
        body: JSON.stringify({ month: structureMonth, ...rates })
      });
      if (res.ok) toast.success("Fee structure saved");
      else toast.error("Failed to save");
    } catch (e) {
      toast.error("Error saving structure");
    }
  };

  const generateBills = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      };
      const res = await fetch('http://127.0.0.1:5000/api/fees/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ month: structureMonth })
      });
      if (res.ok) {
        toast.success("Bills generated successfully");
        fetchFees();
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to generate");
      }
    } catch (e) {
      toast.error("Error generating bills");
    }
  };

  if (loading && fees.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hostel Bills</h1>
          <p className="text-muted-foreground">{user?.role === 'admin' ? 'Manage Student Fees' : 'Your Payment History'}</p>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div className="flex rounded-lg bg-muted p-1 w-full max-w-md">
          <button
            onClick={() => setActiveTab("bills")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "bills" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Student Bills
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "settings" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Fee Settings & Generation
          </button>
        </div>
      )}

      {activeTab === "settings" && user?.role === 'admin' ? (
        <div className="bg-card rounded-xl border border-border p-6 shadow-card max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Fee Structure Configuration</h2>
          <form onSubmit={saveStructure} className="space-y-4">
            <div className="space-y-2">
              <Label>Target Month</Label>
              <Input type="month" value={structureMonth} onChange={e => setStructureMonth(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mess Rate (Per Day)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input type="number" className="pl-6" value={rates.messRatePerDay} onChange={e => setRates({ ...rates, messRatePerDay: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Establishment Fee (Fixed)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input type="number" className="pl-6" value={rates.establishmentFee} onChange={e => setRates({ ...rates, establishmentFee: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>WiFi Fee (Fixed)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input type="number" className="pl-6" value={rates.wifiFee} onChange={e => setRates({ ...rates, wifiFee: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Water Bill (Fixed)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input type="number" className="pl-6" value={rates.waterBill} onChange={e => setRates({ ...rates, waterBill: parseFloat(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 gap-2"><Save className="w-4 h-4" /> Save Rates</Button>
              <Button type="button" variant="secondary" className="flex-1 gap-2" onClick={generateBills}>
                <Clock className="w-4 h-4" /> Generate Bills for {structureMonth}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Generating bills will calculate mess charges based on attendance (Present days) and apply the fixed fees above for all students.
            </p>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {fees.length === 0 ? <p className="text-muted-foreground p-4">No fee records found.</p> : fees.map((fee) => (
            <div key={fee.id} className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{fee.month}</h3>
                  {user?.role === 'admin' && <p className="text-sm text-muted-foreground">{fee.User?.name} ({fee.User?.hostelRoom})</p>}
                </div>
                <Badge variant="outline" className={fee.isPaid ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"}>
                  {fee.isPaid ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</> : <><Clock className="w-3 h-3 mr-1" /> Pending</>}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Mess Charge:</span> ₹{fee.messCharge}</div>
                <div><span className="text-muted-foreground">Est. Fee:</span> ₹{fee.establishmentFee}</div>
                <div><span className="text-muted-foreground">WiFi Fee:</span> ₹{fee.wifiFee}</div>
                <div><span className="text-muted-foreground">Water Bill:</span> ₹{fee.waterBill}</div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-primary">₹{fee.totalAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillsPage;
