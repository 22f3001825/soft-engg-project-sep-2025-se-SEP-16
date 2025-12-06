import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Camera, Edit, Save, User, Mail, Shield, Award, Users } from "lucide-react";
import supervisorApi from "../../services/supervisorApi";

export const SupervisorProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null); // ✅ Toast State

  const boyAvatar = "https://cdn-icons-png.flaticon.com/512/4322/4322991.png";

  const [profileData, setProfileData] = useState({
    name: user?.name || "Robert Johnson",
    email: user?.email || "supervisor.demo@intellica.com",
    role: user?.role || "supervisor",
    avatar: user?.avatar || boyAvatar,
  });

  const [performanceData, setPerformanceData] = useState({
    totalTickets: 0,
    activeAgents: 0,
    resolvedTickets: 0,
    loading: true
  });

  // 🔁 Load from localStorage if exists
  useEffect(() => {
    const savedUser = localStorage.getItem("intellica_user");
    if (!savedUser) {
      localStorage.setItem("intellica_user", JSON.stringify(profileData));
    }
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const data = await supervisorApi.getDashboard();
      setPerformanceData({
        totalTickets: data.stats.total_tickets,
        activeAgents: data.stats.active_agents,
        solvedTickets: data.stats.solved_tickets,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setPerformanceData(prev => ({ ...prev, loading: false }));
    }
  };

  // 🔔 Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 💾 Save and show notification
  const handleSave = () => {
    localStorage.setItem("intellica_user", JSON.stringify(profileData));
    setIsEditing(false);
    setToast({
      type: "success",
      message: "Profile updated successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* ✨ Subtle Animated Gradient Background */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* 🔔 Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in
            ${toast.type === "success" ? "bg-green-500" : "bg-blue-500"}`}
        >
          {toast.message}
        </div>
      )}

      {/* ---------- Page Header ---------- */}
      <div className="relative bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-[0_4px_20px_rgba(147,197,253,0.25)] hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300 mt-6 mx-4 md:mx-auto max-w-5xl px-6 py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
          Supervisor Profile
        </h1>
        <p className="text-gray-600 mt-2 text-base font-medium">
          Manage your personal details and performance overview.
        </p>
      </div>

      {/* ---------- Main Content ---------- */}
      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ---------- Left: Profile Card ---------- */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-[0_4px_20px_rgba(147,197,253,0.25)] hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-28 w-28 ring-4 ring-indigo-100 shadow-xl">
                    <AvatarImage src={profileData.avatar} alt={profileData.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
                      {profileData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full p-0 bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-600 hover:to-sky-700 shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-lg text-gray-800">{profileData.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Mail className="h-3 w-3" /> {profileData.email}
                  </p>
                  <Badge className="mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
                    {profileData.role.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ---------- Right: Info & Performance ---------- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Info */}
            <Card className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-[0_4px_20px_rgba(147,197,253,0.25)] hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-800">
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5 text-indigo-600" />
                    Personal Information
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-600 hover:to-sky-700 text-white shadow-md"
                  >
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-[0_4px_20px_rgba(147,197,253,0.25)] hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <Shield className="h-5 w-5 text-green-600" />
                  Team Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceData.loading ? (
                  <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
                ) : (
                  <>
                    <div className="text-center p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 hover:shadow-md transition">
                      <Award className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                      <Label className="text-xs text-gray-500">Total Tickets</Label>
                      <p className="text-lg font-bold text-indigo-700 mt-1">
                        {performanceData.totalTickets}
                      </p>
                    </div>

                    <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition">
                      <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <Label className="text-xs text-gray-500">Active Agents</Label>
                      <p className="text-lg font-bold text-green-700 mt-1">
                        {performanceData.activeAgents}
                      </p>
                    </div>

                    <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition">
                      <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <Label className="text-xs text-gray-500">Solved Tickets</Label>
                      <p className="text-lg font-bold text-purple-700 mt-1">
                        {performanceData.solvedTickets}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

