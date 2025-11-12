import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Save, Settings as SettingsIcon, Bell, Palette, Globe } from 'lucide-react';
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
      theme: 'light',
      timezone: 'UTC+0',
      currency: 'USD'
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
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
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
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border-b border-indigo-200/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent animate-gradient-x">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">Customize your account preferences</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-fade-in-up">
            <Button 
              onClick={handleSave} 
              size="lg" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
            >
              <Save className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
              {loading ? 'Loading...' : 'Save Settings'}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Changes are saved automatically when you toggle settings
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg hover:-translate-y-1 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="theme" className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4 text-purple-600" />
                    Theme
                  </Label>
                  <Select
                    value={settings.general?.theme || 'light'}
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

                <div>
                  <Label htmlFor="timezone" className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    Timezone
                  </Label>
                  <Select
                    value={settings.general?.timezone || 'UTC+0'}
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
                  <Label htmlFor="currency" className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600">$</span>
                    Currency
                  </Label>
                  <Select
                    value={settings.general?.currency || 'USD'}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        general: {...settings.general, currency: value}
                      })
                    }
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-200">
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
                    <Label htmlFor="email" className="font-medium text-gray-900">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.notifications?.email || false}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, email: checked}
                      })
                    }
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-100">
                  <div>
                    <Label htmlFor="order-updates" className="font-medium text-gray-900">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch
                    id="order-updates"
                    checked={settings.notifications?.order_updates || false}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, order_updates: checked}
                      })
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border border-purple-100">
                  <div>
                    <Label htmlFor="refund-updates" className="font-medium text-gray-900">Refund Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about refund status</p>
                  </div>
                  <Switch
                    id="refund-updates"
                    checked={settings.notifications?.refund_updates || false}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, refund_updates: checked}
                      })
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg border border-amber-100">
                  <div>
                    <Label htmlFor="support-replies" className="font-medium text-gray-900">Support Replies</Label>
                    <p className="text-sm text-muted-foreground">Get notified when support responds</p>
                  </div>
                  <Switch
                    id="support-replies"
                    checked={settings.notifications?.support_replies || false}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, support_replies: checked}
                      })
                    }
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>

      <ChatBot />
    </div>
  );
};
