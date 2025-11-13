import React, { useState, useEffect } from "react";
import { Header } from "../../components/common/Supervisor_header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../context/AuthContext";

export const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    autoRefundLimit: 150,
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    autoAssignTickets: true,
    emailNotifications: true,
    systemAlerts: true,
  });

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem(`supervisorSettings_${user?.id || 'default'}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem(`supervisorSettings_${user?.id || 'default'}`, JSON.stringify(settings));
      
      setToast({
        type: "success",
        message: "Settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToast({
        type: "error",
        message: "Failed to save settings. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLimitChange = (delta) => {
    setSettings((prev) => ({
      ...prev,
      autoRefundLimit: Math.max(0, prev.autoRefundLimit + delta),
    }));
  };

  const handleTimeChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>
      <Header />

      {/* 🔔 Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
            toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ---------- Page Header ---------- */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-[0_4px_20px_rgba(147,197,253,0.25)] hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300 p-6 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
              Settings
            </h1>
            <p className="text-gray-600 text-base mt-2 font-medium">
              Customize system preferences, working hours, and automation options.
            </p>
          </div>
          <div className="hidden md:block absolute right-10 top-2 opacity-10 text-[9rem] font-bold select-none">
            ⚙️
          </div>
        </div>

        {/* ---------- Settings Card ---------- */}
        <Card className="shadow-[0_4px_20px_rgba(147,197,253,0.25)] border border-indigo-100 rounded-2xl bg-white/80 backdrop-blur-xl hover:shadow-[0_6px_25px_rgba(147,197,253,0.35)] transition-all duration-300">
          {/* <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-t-2xl px-6 py-5">
            <CardTitle className="text-2xl font-bold">Settings</CardTitle> */}
          {/* </CardHeader> */}

          <CardContent className="space-y-6 py-8 px-6">

            {/* Auto-refund limit */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-indigo-100 shadow-sm px-6 py-5 rounded-xl">
              <span className="text-lg font-semibold text-gray-900">
                Auto-refund limit
              </span>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleLimitChange(-10)}
                >
                  -
                </Button>
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md min-w-[70px] text-center">
                  ${settings.autoRefundLimit.toFixed(2)}
                </div>
                <Button
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleLimitChange(10)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Working hours */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-indigo-100 shadow-sm px-6 py-5 rounded-xl">
              <span className="text-lg font-semibold text-gray-900">
                Working hours
              </span>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={settings.workingHoursStart}
                  onChange={(e) =>
                    handleTimeChange("workingHoursStart", e.target.value)
                  }
                  className="border-gray-300 rounded-md shadow-sm w-28 focus:ring-2 focus:ring-indigo-400"
                />
                <span className="font-semibold text-gray-600">to</span>
                <Input
                  type="time"
                  value={settings.workingHoursEnd}
                  onChange={(e) =>
                    handleTimeChange("workingHoursEnd", e.target.value)
                  }
                  className="border-gray-300 rounded-md shadow-sm w-28 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Auto-assign tickets */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-indigo-100 shadow-sm px-6 py-5 rounded-xl">
              <span className="text-lg font-semibold text-gray-900">
                Auto-assign tickets
              </span>
              <Switch
                checked={settings.autoAssignTickets}
                onCheckedChange={() => handleToggle("autoAssignTickets")}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-indigo-100 shadow-sm px-6 py-5 rounded-xl">
              <span className="text-lg font-semibold text-gray-900">
                Email notifications
              </span>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            {/* System Alerts */}
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-md hover:bg-white/80 transition border border-indigo-100 shadow-sm px-6 py-5 rounded-xl">
              <span className="text-lg font-semibold text-gray-900">
                System alerts
              </span>
              <Switch
                checked={settings.systemAlerts}
                onCheckedChange={() => handleToggle("systemAlerts")}
              />
            </div>

            {/* Save Button */}
            <div className="pt-6 text-center">
              <Button
                className="bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-600 hover:to-sky-700 text-white font-semibold px-8 py-2 rounded-lg shadow-md disabled:opacity-50"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};
