import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Save, Plus } from 'lucide-react';

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
      resolvedComplaints: true,
      escalations: true,
      reportAvailability: false
    },
    reportPreferences: {
      defaultFormat: 'pdf',
      autoEmail: false,
      recipients: ['']
    }
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const addRecipient = () => {
    setSettings({
      ...settings,
      reportPreferences: {
        ...settings.reportPreferences,
        recipients: [...settings.reportPreferences.recipients, '']
      }
    });
  };

  const updateRecipient = (index, email) => {
    const newRecipients = [...settings.reportPreferences.recipients];
    newRecipients[index] = email;
    setSettings({
      ...settings,
      reportPreferences: {
        ...settings.reportPreferences,
        recipients: newRecipients
      }
    });
  };

  const removeRecipient = (index) => {
    const newRecipients = settings.reportPreferences.recipients.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      reportPreferences: {
        ...settings.reportPreferences,
        recipients: newRecipients
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Settings</h1>
            <p className="text-muted-foreground">Configure your dashboard preferences and notification settings</p>
          </div>
          <Button onClick={handleSave} size="lg" className="shadow-lg">
            <Save className="h-5 w-5 mr-2" />
            Save Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="dashboardRange">Default Dashboard Range</Label>
                <Select
                  value={settings.general.dashboardRange}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, dashboardRange: value}
                    })
                  }
                >
                  <SelectTrigger>
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
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, timezone: value}
                    })
                  }
                >
                  <SelectTrigger>
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
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.general.theme}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      general: {...settings.general, theme: value}
                    })
                  }
                >
                  <SelectTrigger>
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
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-complaints">New Complaints</Label>
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
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="resolved-complaints">Resolved Complaints</Label>
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
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="escalations">Escalations</Label>
                    <p className="text-sm text-muted-foreground">Get notified when complaints are escalated</p>
                  </div>
                  <Switch
                    id="escalations"
                    checked={settings.notifications.escalations}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, escalations: checked}
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="report-availability">Report Availability</Label>
                    <p className="text-sm text-muted-foreground">Get notified when new reports are available</p>
                  </div>
                  <Switch
                    id="report-availability"
                    checked={settings.notifications.reportAvailability}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: {...settings.notifications, reportAvailability: checked}
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preferences */}
          <Card className="rounded-xl shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Report Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="defaultFormat">Default Report Format</Label>
                  <Select
                    value={settings.reportPreferences.defaultFormat}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        reportPreferences: {...settings.reportPreferences, defaultFormat: value}
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-email"
                    checked={settings.reportPreferences.autoEmail}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        reportPreferences: {...settings.reportPreferences, autoEmail: checked}
                      })
                    }
                  />
                  <div>
                    <Label htmlFor="auto-email">Auto-email Summary</Label>
                    <p className="text-sm text-muted-foreground">Automatically send reports to recipients</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between">
                  Report Recipients
                  <Button variant="outline" size="sm" onClick={addRecipient}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>
                </Label>
                <div className="space-y-2 mt-2">
                  {settings.reportPreferences.recipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                      />
                      {settings.reportPreferences.recipients.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeRecipient(index)}
                          className="px-3"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


      </main>
    </div>
  );
};
