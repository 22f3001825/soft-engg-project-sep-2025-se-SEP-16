import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Save, Download, Settings as SettingsIcon, Bell, Shield, Palette, Globe } from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      theme: 'light',
      timezone: 'UTC-5',
      currency: 'USD'
    },
    notifications: {
      orderUpdates: true,
      refundUpdates: true,
      newOffers: false,
      supportReplies: true,
      chatbotAlerts: true
    },
    privacy: {
      allowChatbotData: true
    }
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const handleDownloadData = () => {
    // Download data logic here
    alert('Data download functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-300/30 to-blue-300/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-white via-slate-50 to-gray-50 border-b border-gray-200/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent animate-gradient-x">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">Customize your account preferences and privacy settings</p>
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
                <Label htmlFor="theme" className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-600" />
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
                <Label htmlFor="currency" className="flex items-center gap-2">
                  <span className="text-amber-600">$</span>
                  Currency
                </Label>
                <Select
                  value={settings.general.currency}
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
                    <Label htmlFor="order-updates" className="font-medium text-gray-900">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                  </div>
                  <Switch
                    id="order-updates"
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, orderUpdates: checked}
                      })
                    }
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-100">
                  <div>
                    <Label htmlFor="refund-updates" className="font-medium text-gray-900">Refund Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about refund status</p>
                  </div>
                  <Switch
                    id="refund-updates"
                    checked={settings.notifications.refundUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, refundUpdates: checked}
                      })
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border border-purple-100">
                  <div>
                    <Label htmlFor="new-offers" className="font-medium text-gray-900">New Offers</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional offers and discounts</p>
                  </div>
                  <Switch
                    id="new-offers"
                    checked={settings.notifications.newOffers}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, newOffers: checked}
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
                    checked={settings.notifications.supportReplies}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, supportReplies: checked}
                      })
                    }
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-lg border border-indigo-100">
                  <div>
                    <Label htmlFor="chatbot-alerts" className="font-medium text-gray-900">Chatbot Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts from AI assistant</p>
                  </div>
                  <Switch
                    id="chatbot-alerts"
                    checked={settings.notifications.chatbotAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, chatbotAlerts: checked}
                      })
                    }
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-400 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50/50 to-pink-50/50 rounded-lg border border-red-100">
                <div>
                  <Label htmlFor="chatbot-data" className="font-medium text-gray-900">Allow Chatbot Data Usage</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the AI assistant to use your conversation data to improve responses
                  </p>
                </div>
                <Switch
                  id="chatbot-data"
                  checked={settings.privacy.allowChatbotData}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      privacy: {...settings.privacy, allowChatbotData: checked}
                    })
                  }
                  className="data-[state=checked]:bg-red-600"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-lg border border-gray-100">
                  <div>
                    <Label className="font-medium text-gray-900">Data Download</Label>
                    <p className="text-sm text-muted-foreground">
                      Download a copy of all your personal data
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadData} className="border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group/btn">
                    <Download className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                    Download Data
                  </Button>
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
