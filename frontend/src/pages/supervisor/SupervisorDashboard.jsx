import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  BarChart3,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Users,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ✅ Importing shared dummy data
import {
  supervisor,
  dashboardStats,
  ticketChartData,
  alerts as dummyAlerts,
  teamPerformance,
} from "./data/supervisordummydata";

const ICONS = { BarChart3, Activity, TrendingUp, CheckCircle2 };
const COLORS = ["#4ade80", "#60a5fa", "#fbbf24"];

export const SupervisorDashboard = () => {
  const [alerts, setAlerts] = useState(dummyAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [modalType, setModalType] = useState(null); // 'review' | 'resolve'

  // 🔹 Open modal
  const handleReview = (alert) => {
    setSelectedAlert(alert);
    setModalType("review");
  };

  const handleResolvePrompt = (alert) => {
    setSelectedAlert(alert);
    setModalType("resolve");
  };

  // 🔹 Confirm resolve
  const handleConfirmResolve = () => {
    setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));
    setModalType(null);
    setSelectedAlert(null);
  };

  // 🔹 Close modal
  const closeModal = () => {
    setModalType(null);
    setSelectedAlert(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between animate-slide-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, {supervisor.name}!
            </h1>
            <p className="text-muted-foreground">
              Here’s your team’s performance and system health overview.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {dashboardStats.map((stat, index) => {
            const Icon = ICONS[stat.icon];
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition cursor-pointer group animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition`}
                    >
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Team Performance & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Performance */}
          <Card className="animate-slide-in-up">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Team Performance</CardTitle>
              <Link to="/supervisor/team_management">
                <Button variant="ghost" size="sm">
                  View Team <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary transition"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Solved: {member.solved} | Avg: {member.avg} | CSAT:{" "}
                          {member.csat}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ticket Chart */}
          <Card className="animate-slide-in-up">
            <CardHeader>
              <CardTitle className="text-xl">Ticket Volume (7 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={ticketChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {ticketChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card className="animate-slide-in-up">
          <CardHeader>
            <CardTitle className="text-xl">Urgent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      alert.type === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>{alert.message}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground transition"
                        onClick={() => handleReview(alert)}
                      >
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-destructive hover:text-destructive-foreground transition"
                        onClick={() => handleResolvePrompt(alert)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  🎉 All alerts have been reviewed or resolved.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------- MODALS ---------- */}
        {modalType && selectedAlert && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] md:w-[400px] animate-fade-in text-center">
              {modalType === "review" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Alert Details</h2>
                  <p className="text-gray-600 mb-2">
                    <strong>Type:</strong> {selectedAlert.type.toUpperCase()}
                  </p>
                  <p className="text-gray-700 mb-6">{selectedAlert.message}</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Close
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => {
                        closeModal();
                        handleConfirmResolve();
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </>
              )}

              {modalType === "resolve" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Resolve Alert #{selectedAlert.id}?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to resolve this alert?
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleConfirmResolve}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


