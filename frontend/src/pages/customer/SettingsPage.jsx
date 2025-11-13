import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Settings as SettingsIcon, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../../services/api';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      order_updates: true,
      refund_updates: true,
      support_replies: true
    },
    general: {
      theme: 'light'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.updateSettings(settings);
      applyTheme(settings.general?.theme || 'light');
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (settings.general?.theme) {
      applyTheme(settings.general.theme);
    }
  }, [settings.general?.theme]);

  useEffect(() => {
    // Apply theme on component mount
    const savedTheme = settings.general?.theme || 'light';
    applyTheme(savedTheme);
  }, [loading]); // Run when loading completes



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 dark:from-violet-600/10 dark:via-fuchsia-600/5 dark:to-rose-600/10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 dark:from-blue-600/10 dark:to-indigo-600/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-b border-indigo-200/50 dark:border-gray-600/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 dark:from-gray-100 dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent animate-gradient-x">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 text-base animate-fade-in-up animation-delay-200">Customize your account preferences</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Changes are saved automatically
          </p>
        </div>

        {/* Single Card with Horizontal Layout */}
        <Card className="group relative overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Theme Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Customize your visual experience</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Preference</Label>
                  <Select
                    value={settings.general?.theme || 'light'}
                    onValueChange={(value) => {
                      const newSettings = {
                        ...settings,
                        general: {...settings.general, theme: value}
                      };
                      setSettings(newSettings);
                      applyTheme(value);
                      apiService.updateSettings(newSettings).then(() => {
                        toast.success('Theme updated!');
                      }).catch(() => {
                        toast.error('Failed to save theme');
                      });
                    }}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light Mode</SelectItem>
                      <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Manage your notification preferences</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div>
                      <Label className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.email || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, email: checked}
                        };
                        setSettings(newSettings);
                        apiService.updateSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800">
                    <div>
                      <Label className="font-medium text-gray-900 dark:text-gray-100">Order Updates</Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">Get notified about order changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.order_updates || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, order_updates: checked}
                        };
                        setSettings(newSettings);
                        apiService.updateSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div>
                      <Label className="font-medium text-gray-900 dark:text-gray-100">Support Replies</Label>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">Get notified when support responds</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.support_replies || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, support_replies: checked}
                        };
                        setSettings(newSettings);
                        apiService.updateSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>
              </div>
              
            </div>
          </CardContent>
        </Card>
      </main>

      <ChatBot />
    </div>
  );
};
