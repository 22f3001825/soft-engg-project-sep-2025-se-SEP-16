import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
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
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('customer_notification_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('customer_notification_settings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
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

      <main className="container mx-auto px-6 py-8 space-y-8">


        {/* Single Card with Horizontal Layout */}
        <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative p-8">
            <div className="max-w-2xl mx-auto">
              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="font-medium text-gray-900">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.email || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, email: checked}
                        };
                        setSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-100">
                    <div>
                      <Label className="font-medium text-gray-900">Order Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about order changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.order_updates || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, order_updates: checked}
                        };
                        setSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border border-purple-100">
                    <div>
                      <Label className="font-medium text-gray-900">Support Replies</Label>
                      <p className="text-sm text-muted-foreground">Get notified when support responds</p>
                    </div>
                    <Switch
                      checked={settings.notifications?.support_replies || false}
                      onCheckedChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          notifications: {...settings.notifications, support_replies: checked}
                        };
                        setSettings(newSettings);
                      }}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-8 text-center">
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <ChatBot />
    </div>
  );
};
