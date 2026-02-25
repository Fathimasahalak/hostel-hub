import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Info, Eye, EyeOff, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type MealType = 'Veg' | 'Non-Veg';

interface MessMenuItem {
    id?: number;
    day: DayOfWeek;
    breakfast: string;
    lunch: string;
    snacks: string;
    snacksNonVeg: string;
    dinnerVeg: string;
    dinnerNonVeg: string;
}

interface MessPreference {
    day: DayOfWeek;
    dinnerChoice: MealType;
    snacksChoice: MealType | null;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MessMenuPage = () => {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();

    // Fetch Menu
    const { data: menu = [], isLoading: menuLoading } = useQuery({
        queryKey: ['messMenu'],
        queryFn: async () => {
            const res = await fetch('http://127.0.0.1:5000/api/messmenu', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.status === 401 || res.status === 403) {
                logout();
                throw new Error('Unauthorized');
            }
            if (!res.ok) throw new Error('Failed to fetch menu');
            return res.json() as Promise<MessMenuItem[]>;
        }
    });

    // Fetch Preferences (Student Only)
    const { data: personalPreferences = [], isLoading: prefLoading } = useQuery({
        queryKey: ['messPreferences'],
        queryFn: async () => {
            const res = await fetch('http://127.0.0.1:5000/api/messmenu/preferences', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error('Failed to fetch preferences');
            return res.json() as Promise<MessPreference[]>;
        },
        enabled: user?.role === 'student'
    });

    // Fetch Stats (For Chart)
    const { data: stats = {}, isLoading: statsLoading } = useQuery({
        queryKey: ['messStats'],
        queryFn: async () => {
            const res = await fetch('http://127.0.0.1:5000/api/messmenu/stats', {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        }
    });

    if (menuLoading || (user?.role === 'student' && prefLoading)) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-10 animate-fade-in p-6 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Hostel Mess Menu</h1>
                <p className="text-muted-foreground text-lg italic">
                    {user?.role === 'admin' ? 'Configure the weekly dining schedule and monitor student preferences.' : 'View the weekly menu and select your dining preferences below.'}
                </p>
            </div>

            {user?.role === 'admin' ? (
                <AdminMessView initialMenu={menu} queryClient={queryClient} stats={stats} />
            ) : (
                <div className="space-y-12">
                    <StudentMenuView menu={menu} />
                    <StudentChoiceTable menu={menu} initialPreferences={personalPreferences} queryClient={queryClient} />
                    <MessAnalyticsView stats={stats} />
                </div>
            )}
        </div>
    );
};

// --- Admin Component ---

const AdminMessView = ({ initialMenu, queryClient, stats }: { initialMenu: MessMenuItem[], queryClient: any, stats: any }) => {
    const [menuItems, setMenuItems] = useState<MessMenuItem[]>(() => {
        const map = new Map(initialMenu.map(i => [i.day, {
            ...i,
            breakfast: i.breakfast || '',
            lunch: i.lunch || '',
            snacks: i.snacks || '',
            snacksNonVeg: i.snacksNonVeg || '',
            dinnerVeg: i.dinnerVeg || '',
            dinnerNonVeg: i.dinnerNonVeg || ''
        }]));
        return DAYS.map(day => (map.get(day) as MessMenuItem) || {
            day,
            breakfast: '',
            lunch: '',
            snacks: '',
            snacksNonVeg: '',
            dinnerVeg: '',
            dinnerNonVeg: ''
        });
    });

    const updateMutation = useMutation({
        mutationFn: async (newMenu: MessMenuItem[]) => {
            const res = await fetch('http://127.0.0.1:5000/api/messmenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newMenu)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || 'Failed to update menu');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messMenu'] });
            toast.success("Mess menu updated successfully");
        },
        onError: (err: any) => toast.error(`Error: ${err.message}`)
    });

    const handleChange = (day: DayOfWeek, field: keyof MessMenuItem, value: string) => {
        setMenuItems(prev => prev.map(item =>
            item.day === day ? { ...item, [field]: value } : item
        ));
    };

    return (
        <div className="space-y-10">
            <Card className="border shadow-xl bg-card">
                <CardHeader className="bg-primary/5 pb-6">
                    <CardTitle className="text-2xl">Menu Configuration</CardTitle>
                    <CardDescription>Update the menu for each day. Snacks have Non-Veg options for Tue/Thu.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted hover:bg-muted font-bold">
                                <TableHead className="w-[120px] text-foreground font-black">Day</TableHead>
                                <TableHead className="text-foreground font-black">Breakfast</TableHead>
                                <TableHead className="text-foreground font-black">Lunch</TableHead>
                                <TableHead className="text-foreground font-black">Snacks (Veg)</TableHead>
                                <TableHead className="text-foreground font-black text-red-500">Snacks (Non-Veg)</TableHead>
                                <TableHead className="text-foreground font-black text-green-600">Dinner (Veg)</TableHead>
                                <TableHead className="text-foreground font-black text-red-600">Dinner (Non-Veg)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.map((item) => (
                                <TableRow key={item.day} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-bold text-primary">{item.day}</TableCell>
                                    <TableCell><Input value={item.breakfast} onChange={e => handleChange(item.day, 'breakfast', e.target.value)} className="bg-muted/30" /></TableCell>
                                    <TableCell><Input value={item.lunch} onChange={e => handleChange(item.day, 'lunch', e.target.value)} className="bg-muted/30" /></TableCell>
                                    <TableCell><Input value={item.snacks} onChange={e => handleChange(item.day, 'snacks', e.target.value)} className="bg-muted/30" /></TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.snacksNonVeg}
                                            onChange={e => handleChange(item.day, 'snacksNonVeg', e.target.value)}
                                            disabled={item.day !== 'Tuesday' && item.day !== 'Thursday'}
                                            className={item.day === 'Tuesday' || item.day === 'Thursday' ? "bg-red-50/50" : "bg-transparent border-none"}
                                            placeholder={item.day === 'Tuesday' || item.day === 'Thursday' ? "Enter Non-Veg" : "-"}
                                        />
                                    </TableCell>
                                    <TableCell><Input value={item.dinnerVeg} onChange={e => handleChange(item.day, 'dinnerVeg', e.target.value)} className="bg-green-50/30" /></TableCell>
                                    <TableCell><Input value={item.dinnerNonVeg} onChange={e => handleChange(item.day, 'dinnerNonVeg', e.target.value)} className="bg-red-50/30" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-8 flex justify-end gap-4">
                        <Button onClick={() => updateMutation.mutate(menuItems)} disabled={updateMutation.isPending} className="px-10">
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publish All
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <MessAnalyticsView stats={stats} />
        </div>
    );
};

// --- Student Components ---

const StudentMenuView = ({ menu }: { menu: MessMenuItem[] }) => {
    const [isVeg, setIsVeg] = useState<Record<string, boolean>>({});

    const toggleMode = (day: string) => {
        setIsVeg(prev => ({ ...prev, [day]: !prev[day] }));
    };

    return (
        <Card className="border shadow-xl bg-card overflow-hidden">
            <CardHeader className="border-b bg-muted/30 py-6 px-8">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <UtensilsCrossed className="w-6 h-6 text-primary" />
                    WEEKLY MENU
                </CardTitle>
                <CardDescription>Click on the Dinner cell to toggle between Veg and Non-Veg menu options.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/10">
                            <TableHead className="font-black py-4 pl-8 text-foreground w-[120px]">Day</TableHead>
                            <TableHead className="font-black text-foreground">Breakfast</TableHead>
                            <TableHead className="font-black text-foreground">Lunch</TableHead>
                            <TableHead className="font-black text-foreground">Snacks</TableHead>
                            <TableHead className="font-black text-foreground">Dinner (Toggle Veg/Non-Veg)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {DAYS.map((day) => {
                            const item = menu.find(m => m.day === day) || { day, breakfast: '-', lunch: '-', snacks: '-', snacksNonVeg: '-', dinnerVeg: '-', dinnerNonVeg: '-' };
                            const vegMode = isVeg[day];

                            return (
                                <TableRow key={day} className="h-16 hover:bg-muted/5 transition-colors">
                                    <TableCell className="font-black text-lg pl-8 text-primary">{day}</TableCell>
                                    <TableCell className="font-medium">{item.breakfast || '-'}</TableCell>
                                    <TableCell className="font-medium">{item.lunch || '-'}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.snacks || '-'}</span>
                                            {(day === 'Tuesday' || day === 'Thursday') && item.snacksNonVeg && (
                                                <span className="text-[10px] text-red-500 font-bold italic">Options available</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 cursor-pointer select-none pr-8" onClick={() => toggleMode(day)}>
                                        <div className={`py-3 px-4 rounded-lg border flex flex-col justify-center transition-all ${vegMode ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${vegMode ? "text-green-600" : "text-red-600"}`}>
                                                    {vegMode ? "VEG DINNER" : "NON-VEG DINNER"}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-bold truncate ${vegMode ? "text-green-900" : "text-red-900"}`}>
                                                {vegMode ? (item.dinnerVeg || '-') : (item.dinnerNonVeg || '-')}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const StudentChoiceTable = ({ initialPreferences, queryClient }: { menu: MessMenuItem[], initialPreferences: MessPreference[], queryClient: any }) => {
    const [selections, setSelections] = useState<Record<string, { dinner: MealType, snacks: MealType }>>(() => {
        const s: Record<string, { dinner: MealType, snacks: MealType }> = {};
        DAYS.forEach(day => {
            const existing = initialPreferences.find(p => p.day === day);
            s[day] = {
                dinner: existing?.dinnerChoice || 'Non-Veg',
                snacks: (existing?.snacksChoice as MealType) || 'Veg'
            };
        });
        return s;
    });

    const mutation = useMutation({
        mutationFn: async (prefsArray: any[]) => {
            const res = await fetch('http://127.0.0.1:5000/api/messmenu/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(prefsArray)
            });
            if (!res.ok) throw new Error('Failed to save');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messPreferences', 'messStats'] });
            toast.success("Preferences updated for the week!");
        },
        onError: () => toast.error("Failed to save preferences")
    });

    const updateChoice = (day: string, type: 'dinner' | 'snacks', choice: MealType) => {
        setSelections(prev => ({
            ...prev,
            [day]: { ...prev[day], [type]: choice }
        }));
    };

    const handleSave = () => {
        const payload = DAYS.map(day => ({
            day,
            dinnerChoice: selections[day].dinner,
            snacksChoice: selections[day].snacks
        }));
        mutation.mutate(payload);
    };

    return (
        <Card className="border shadow-xl">
            <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black">My Cooking Preferences</CardTitle>
                    <CardDescription className="text-lg">Select your choices for the entire week and click Save below.</CardDescription>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
                >
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Save Weekly Choices
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/10">
                            <TableHead className="font-black py-6 pl-8 w-1/4">Day</TableHead>
                            <TableHead className="font-black text-center w-1/3">Dinner Choice</TableHead>
                            <TableHead className="font-black text-center w-1/3">Snacks Choice (Tue/Thu)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {DAYS.map(day => (
                            <TableRow key={day} className="h-20 hover:bg-muted/5">
                                <TableCell className="font-black text-xl pl-8 text-primary">{day}</TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-4">
                                        <Button
                                            size="sm"
                                            variant={selections[day].dinner === 'Veg' ? "default" : "outline"}
                                            className={selections[day].dinner === 'Veg' ? "bg-green-600 hover:bg-green-700 w-28 rounded-full font-bold" : "w-28 rounded-full font-bold"}
                                            onClick={() => updateChoice(day, 'dinner', 'Veg')}
                                        >
                                            Veg
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={selections[day].dinner === 'Non-Veg' ? "default" : "outline"}
                                            className={selections[day].dinner === 'Non-Veg' ? "bg-red-600 hover:bg-red-700 w-28 rounded-full font-bold" : "w-28 rounded-full font-bold"}
                                            onClick={() => updateChoice(day, 'dinner', 'Non-Veg')}
                                        >
                                            Non-Veg
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {(day === 'Tuesday' || day === 'Thursday') ? (
                                        <div className="flex justify-center gap-4">
                                            <Button
                                                size="sm"
                                                variant={selections[day].snacks === 'Veg' ? "default" : "outline"}
                                                className={selections[day].snacks === 'Veg' ? "bg-green-600 hover:bg-green-700 w-28 rounded-full font-bold" : "w-28 rounded-full font-bold"}
                                                onClick={() => updateChoice(day, 'snacks', 'Veg')}
                                            >
                                                Veg
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={selections[day].snacks === 'Non-Veg' ? "default" : "outline"}
                                                className={selections[day].snacks === 'Non-Veg' ? "bg-red-600 hover:bg-red-700 w-28 rounded-full font-bold" : "w-28 rounded-full font-bold"}
                                                onClick={() => updateChoice(day, 'snacks', 'Non-Veg')}
                                            >
                                                Non-Veg
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground font-medium italic">Fixed Menu</div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const MessAnalyticsView = ({ stats }: { stats: any }) => {
    const chartData = DAYS.map(day => ({
        name: day.substring(0, 3),
        DinnerVeg: stats[day]?.dinnerVeg || 0,
        DinnerNonVeg: stats[day]?.dinnerNonVeg || 0,
        SnacksVeg: stats[day]?.snacksVeg || 0,
        SnacksNonVeg: stats[day]?.snacksNonVeg || 0
    }));

    return (
        <Card className="border shadow-2xl p-6">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl font-black">Attendance Analytics</CardTitle>
                <CardDescription>Visual distribution of student preferences for the week.</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] pt-6 px-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '15px' }} />
                        <Legend iconType="circle" />
                        <Bar dataKey="DinnerVeg" name="Dinner (Veg)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="DinnerNonVeg" name="Dinner (Non-Veg)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="SnacksVeg" name="Snacks (Veg)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="SnacksNonVeg" name="Snacks (Non-Veg)" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default MessMenuPage;
