import React, { useState, useEffect } from 'react';
import { Header } from '../../components/common/Supervisor_header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const Settings = () => {
  const [settings, setSettings] = useState({
    autoRefundLimit: 150,
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    teamAccess: true,
    fraudChecks: true,
    csatSurveys: true,
  });

  // ✅ Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('supervisorSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // ✅ Save settings to localStorage whenever they change
  const handleSave = () => {
    localStorage.setItem('supervisorSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
    alert('✅ Settings have been changed successfully.');
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card className="animate-slide-in-up border border-gray-200 shadow-lg bg-white rounded-3xl">
          <CardHeader className="bg-blue-600 text-white rounded-t-3xl px-6 py-4">
            <CardTitle className="text-3xl font-bold">Settings</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 py-6 px-6">

            {/* Auto-refund limit */}
            <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-gray-900 px-6 py-5 rounded-md border border-gray-200 shadow-sm">
              <span className="text-lg font-semibold">Auto-refund limit</span>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleLimitChange(-10)}
                >
                  -
                </Button>
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md min-w-[70px] text-center">
                  ${settings.autoRefundLimit.toFixed(2)}
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  onClick={() => handleLimitChange(10)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Working hours */}
            <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-gray-900 px-6 py-5 rounded-md border border-gray-200 shadow-sm">
              <span className="text-lg font-semibold">Working hours</span>
              <div className="flex items-center gap-3">
                <Input
                  type="time"
                  value={settings.workingHoursStart}
                  onChange={(e) => handleTimeChange('workingHoursStart', e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm w-28"
                />
                <span className="font-semibold">to</span>
                <Input
                  type="time"
                  value={settings.workingHoursEnd}
                  onChange={(e) => handleTimeChange('workingHoursEnd', e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm w-28"
                />
              </div>
            </div>

            {/* Team member access */}
            <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-gray-900 px-6 py-5 rounded-md border border-gray-200 shadow-sm">
              <span className="text-lg font-semibold">Team member access</span>
              <Switch
                checked={settings.teamAccess}
                onCheckedChange={() => handleToggle('teamAccess')}
              />
            </div>

            {/* Fraud checks */}
            <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-gray-900 px-6 py-5 rounded-md border border-gray-200 shadow-sm">
              <span className="text-lg font-semibold">Fraud checks</span>
              <Switch
                checked={settings.fraudChecks}
                onCheckedChange={() => handleToggle('fraudChecks')}
              />
            </div>

            {/* CSAT surveys */}
            <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-gray-900 px-6 py-5 rounded-md border border-gray-200 shadow-sm">
              <span className="text-lg font-semibold">CSAT surveys</span>
              <Switch
                checked={settings.csatSurveys}
                onCheckedChange={() => handleToggle('csatSurveys')}
              />
            </div>

            {/* Save Button */}
            <div className="pt-6 text-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-lg shadow-md"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};


