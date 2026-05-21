import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Complaint } from "@/lib/types";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

interface ChartsProps {
  complaints: Complaint[];
  isAdmin?: boolean;
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1"];

const ComplaintCharts = ({ complaints, isAdmin = false }: ChartsProps) => {
  // Category breakdown
  const categoryData = Object.entries(
    complaints.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Status breakdown
  const statusData = [
    { name: "Pending", value: complaints.filter((c) => c.status === "Pending").length, fill: "#f59e0b" },
    { name: "Resolved", value: complaints.filter((c) => c.status === "Resolved").length, fill: "#10b981" },
  ];

  // Priority breakdown
  const priorityData = [
    { name: "High", value: complaints.filter((c) => c.priority === "High").length, fill: "#ef4444" },
    { name: "Medium", value: complaints.filter((c) => c.priority === "Medium").length, fill: "#f59e0b" },
    { name: "Low", value: complaints.filter((c) => c.priority === "Low").length, fill: "#10b981" },
  ];

  // Timeline (last 7 days)
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    return {
      name: dateStr,
      complaints: complaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d >= dayStart && d <= dayEnd;
      }).length,
    };
  });

  // Resolution rate
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{complaints.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{complaints.filter((c) => c.status === "Pending").length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent">{resolutionRate}%</p>
            <p className="text-xs text-muted-foreground">Resolution Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Pie */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value" label>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Bar */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              {isAdmin ? (
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" fill="hsl(220, 90%, 56%)" fillOpacity={0.2} stroke="hsl(220, 90%, 56%)" strokeWidth={2} />
                </AreaChart>
              ) : (
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="complaints" stroke="hsl(220, 90%, 56%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintCharts;
