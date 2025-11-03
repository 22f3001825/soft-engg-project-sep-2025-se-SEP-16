import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Save, Download, Settings as SettingsIcon, Bell, Shield, Palette, Globe, TrendingUp, Plus } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      dashboardRange: '30',
      timezone: 'UTC-5',
      theme: 'light'
    },
    notifications: {
      newComplaints: true,
      resolvedComplaints: true
    }
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
    // Apply theme changes
    if (settings.general.theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    } else if (settings.general.theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      // System theme - could implement later
      document.documentElement.classList.remove('theme-light', 'theme-dark');
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border-b border-gray-200/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent animate-gradient-x">
              Vendor Settings
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">Configure your dashboard preferences and notification settings</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fade-in-up">
            <Button onClick={handleSave} size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
              <Save className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              Save Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div>
                <Label htmlFor="dashboardRange" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Default Dashboard Range
                </Label>
                <Select
                  value={settings.general.dashboardRange}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, dashboardRange: value}
                    })
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  Timezone
                </Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, timezone: value}
                    })
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                    <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="UTC+5:30">India Time (UTC+5:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme" className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-amber-600" />
                  Theme
                </Label>
                <Select
                  value={settings.general.theme}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, theme: value}
                    })
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-600" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100">
                  <div>
                    <Label htmlFor="new-complaints" className="font-medium text-gray-900">New Complaints</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new complaints are filed</p>
                  </div>
                  <Switch
                    id="new-complaints"
                    checked={settings.notifications.newComplaints}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, newComplaints: checked}
                      })
                    }
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-100">
                  <div>
                    <Label htmlFor="resolved-complaints" className="font-medium text-gray-900">Resolved Complaints</Label>
                    <p className="text-sm text-muted-foreground">Get notified when complaints are resolved</p>
                  </div>
                  <Switch
                    id="resolved-complaints"
                    checked={settings.notifications.resolvedComplaints}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, resolvedComplaints: checked}
                      })
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  );
};
