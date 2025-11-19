import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User, Mail, Calendar, Award, Settings as SettingsIcon, HelpCircle, Shield, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getProfile();
      setCustomerData(data);
      setProfileData({
        name: user?.name || data.full_name || '',
        email: data.email || user?.email || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PNG, JPG, or JPEG image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await apiService.uploadAvatar(file);
      
      // Update user context with new avatar (use full URL)
      const avatarUrl = response.avatar_url.startsWith('http') 
        ? response.avatar_url 
        : `http://localhost:8000${response.avatar_url}`;
      const updatedUser = { ...user, avatar: avatarUrl };
      updateUser(updatedUser);
      
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };



  return (
    <div className="min-h-screen bg-custom relative overflow-hidden">
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
              My Profile
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">View your account information and activity</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Profile Avatar Section */}
          <div className="lg:col-span-1">
            <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-blue-100 shadow-xl">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      onClick={triggerFileInput}
                      disabled={uploading}
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                    >
                      {uploading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <Button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{user?.name || profileData.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profileData.email}
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer ID</span>
                      <span className="font-medium">{customerData?.id || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium">{customerData?.total_orders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Member Since</span>
                      <span className="font-medium">{customerData?.member_since ? new Date(customerData.member_since).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">




            {/* Account Details */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-400">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Customer ID</Label>
                    <p className="text-sm font-bold text-blue-700">{customerData?.id || 'N/A'}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Member Since</Label>
                    <p className="text-sm font-bold text-green-700">{customerData?.member_since ? new Date(customerData.member_since).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Total Orders</Label>
                    <p className="text-sm font-bold text-purple-700">{customerData?.total_orders || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Total Tickets</Label>
                    <p className="text-sm font-bold text-orange-700">{customerData?.total_tickets || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-indigo-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => navigate('/customer/settings')}
                    variant="outline"
                    className="justify-start h-12 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                  >
                    <SettingsIcon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Notification Settings</div>
                      <div className="text-xs text-muted-foreground">Manage email and notification preferences</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate('/customer/tickets/new')}
                    variant="outline"
                    className="justify-start h-12 border-green-200 hover:border-green-400 hover:bg-green-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Contact Support</div>
                      <div className="text-xs text-muted-foreground">Get help with your account or orders</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ChatBot />
    </div>
  );
};
