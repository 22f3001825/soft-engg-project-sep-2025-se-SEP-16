import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  BarChart3,
  Activity,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";

import supervisorApi from "../../services/supervisorApi";
import { toast } from "sonner";

const ICONS = { BarChart3, Activity, TrendingUp, CheckCircle2 };
const COLORS = ["#3b82f6", "#facc15", "#22c55e", "#9ca3af"];

export const SupervisorDashboard = () => {
  const [timeRange, setTimeRange] = useState("Last 24 Hours");
  const [chartData, setChartData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateChartData = (range) => {
    switch (range) {
      case "Last 24 Hours":
        return [
          { name: "Open", value: 40 },
          { name: "Assigned", value: 90 },
          { name: "Resolved", value: 50 },
          { name: "Closed", value: 20 },
        ];
      case "Last 7 Days":
        return [
          { name: "Open", value: 60 },
          { name: "Assigned", value: 120 },
          { name: "Resolved", value: 80 },
          { name: "Closed", value: 40 },
        ];
      case "Last 15 Days":
        return [
          { name: "Open", value: 50 },
          { name: "Assigned", value: 150 },
          { name: "Resolved", value: 100 },
          { name: "Closed", value: 50 },
        ];
      case "Last 30 Days":
        return [
          { name: "Open", value: 150 },
          { name: "Assigned", value: 380 },
          { name: "Resolved", value: 180 },
          { name: "Closed", value: 140 },
        ];
      default:
        return [
          { name: "Open", value: 40 },
          { name: "Assigned", value: 90 },
          { name: "Resolved", value: 50 },
          { name: "Closed", value: 20 },
        ];
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await supervisorApi.getDashboard();
      setDashboardData(data);
      
      // Use real chart data from API
      if (data.chart_data) {
        setChartData(data.chart_data);
      } else {
        // Fallback chart data
        setChartData([
          { name: "Open", value: data.stats.open_tickets },
          { name: "In Progress", value: data.stats.assigned_tickets },
          { name: "Resolved", value: data.stats.resolved_tickets },
          { name: "Closed", value: data.stats.closed_tickets }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Backend server not running. Using demo data.');
      
      // Fallback to demo data
      const fallbackData = {
        stats: {
          total_tickets: 245,
          active_agents: 8,
          open_tickets: 42,
          assigned_tickets: 89,
          resolved_tickets: 67,
          closed_tickets: 47
        },
        team_performance: [
          { name: "Emma Wilson", status: "AVAILABLE", solved_tickets: 23, avg_response_time: "2.1h" },
          { name: "James Chen", status: "BUSY", solved_tickets: 18, avg_response_time: "1.8h" },
          { name: "Sarah Davis", status: "AVAILABLE", solved_tickets: 31, avg_response_time: "2.3h" }
        ]
      };
      
      setDashboardData(fallbackData);
      setChartData([
        { name: "Open", value: 42 },
        { name: "Assigned", value: 89 },
        { name: "Resolved", value: 67 },
        { name: "Closed", value: 47 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = async (value) => {
    setTimeRange(value);
    try {
      const timeMap = {
        "Last 24 Hours": "24h",
        "Last 7 Days": "7d", 
        "Last 15 Days": "15d",
        "Last 30 Days": "30d"
      };
      const analytics = await supervisorApi.getAnalytics(timeMap[value] || "24h");
      setChartData([
        { name: "Open", value: analytics.ticket_stats.open },
        { name: "Assigned", value: analytics.ticket_stats.assigned },
        { name: "Resolved", value: analytics.ticket_stats.resolved },
        { name: "Closed", value: analytics.ticket_stats.closed }
      ]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setChartData(updateChartData(value));
    }
  };

  const totalTickets = chartData.reduce((sum, item) => sum + item.value, 0);

  const cardGradients = [
    "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    "bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200",
    "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
    "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundColor: '#F4F9E9'}}>
      {/* ✨ Animated Background — same as Customer Dashboard */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* ---------- Welcome Section ---------- */}
        <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border border-gray-200 shadow-lg backdrop-blur-sm p-6 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
                Welcome back, Supervisor!
              </h1>
              <p className="text-gray-600 text-base mt-2 font-medium">
                Here’s your team’s performance and ticket insights at a glance.
              </p>
            </div>
            <div className="hidden md:block absolute right-10 top-2 opacity-10 text-[10rem] font-bold select-none">
              📊
            </div>
          </div>
        </div>

        {/* ---------- Stats Cards ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="animate-pulse bg-gray-200 h-24"></Card>
            ))
          ) : dashboardData ? [
            { title: "Total Tickets", value: dashboardData.stats.total_tickets, icon: "BarChart3" },
            { title: "Active Agents", value: dashboardData.stats.active_agents, icon: "Activity" },
            { title: "Open Tickets", value: dashboardData.stats.open_tickets, icon: "TrendingUp" },
            { title: "Resolved Tickets", value: dashboardData.stats.resolved_tickets, icon: "CheckCircle2" }
          ].map((stat, index) => {
            const Icon = ICONS[stat.icon];
            return (
              <Card
                key={index}
                className={`${cardGradients[index]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border rounded-xl`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {stat.title}
                      </p>
                      <p
                        className={`text-3xl font-bold mt-1 ${
                          [
                            "text-blue-700",
                            "text-teal-700",
                            "text-green-700",
                            "text-amber-700",
                          ][index]
                        }`}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-xl bg-white/90 flex items-center justify-center shadow-md`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          [
                            "text-blue-600",
                            "text-teal-600",
                            "text-green-600",
                            "text-amber-600",
                          ][index]
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : []}
        </div>

        {/* ---------- Team Performance & Ticket Chart ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------- Team Performance ---------- */}
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Team Performance
              </CardTitle>
              <Link to="/supervisor/team_management">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-indigo-400 text-indigo-700 font-medium hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  View Team <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="pb-4">
              <div className="space-y-3">
                {loading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                  ))
                ) : dashboardData?.team_performance?.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 shadow-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned: {member.assigned_tickets} | Resolved: {member.resolved_tickets}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ---------- Ticket Volume ---------- */}
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Ticket Volume
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-2 pb-0">
              <div className="relative w-full h-[400px] flex items-center justify-center -mb-2">
                <ResponsiveContainer>
                  <PieChart margin={{ top: 0, bottom: 0 }}>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={130}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                      <Label
                        value={`Total\n${totalTickets}`}
                        position="center"
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          fill: "#1e3b2eff",
                          textAnchor: "middle",
                          whiteSpace: "pre-line",
                        }}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#24d7a7ff",
                        color: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #475569",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center -mt-2 pb-3">
                {chartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center justify-center bg-white border rounded-lg py-2 hover:shadow-md transition"
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <p className="text-xs font-medium text-gray-600">
                      {item.name}
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
