import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import agentApi from '../../services/agentApi';
import { User, Bell, FileText, Save, Settings as SettingsIcon, Mail } from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [settings, setSettings] = useState({ 
    email_signature: '', 
    notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getSettings();
      setSettings({
        email_signature: data.email_signature || '',
        notifications: data.notifications !== false
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      await agentApi.updateSettings(settings);
      toast.success('Settings saved successfully', {
        description: 'Your preferences have been updated.'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in-up">
      {/* Header*/}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-lg">
        <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <SettingsIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your agent profile and preferences</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between rounded-lg border-2 border-primary/10 p-4 bg-gradient-to-br from-muted/30 to-primary/5 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">Notifications</div>
                  <div className="text-xs text-muted-foreground">Email and in-app updates</div>
                </div>
              </div>
              <Switch 
                checked={settings.notifications} 
                onCheckedChange={v => setSettings({ ...settings, notifications: v })} 
              />
            </div>
          </CardContent>
        </Card>

        

        <Card className="shadow-lg border-2 border-accent/10 bg-gradient-to-br from-background to-accent/5">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-accent">
              <Mail className="h-5 w-5" />
              Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Signature</label>
              <Textarea 
                rows={8} 
                placeholder="Best regards,\nYour Name\nIntellica Customer Support" 
                value={settings.email_signature} 
                onChange={e => setSettings({ ...settings, email_signature: e.target.value })}
                className="border-2 focus:border-accent transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                This will be appended to all outgoing emails
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={save} 
          size="lg" 
          disabled={saving || loading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};


