import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Camera, MapPin, Plus, Trash2, Edit, Save, User, Mail, Calendar, Award } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Ali Jawad',
    email: user?.email || 'customer@intellica.com',
    dob: '1990-01-15',
    gender: 'male',
    customerId: 'CUST-2024-001',
    joinDate: '2024-01-01',
    totalOrders: 12,
    addresses: [
      {
        id: 1,
        type: 'Home',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        isDefault: true
      },
      {
        id: 2,
        type: 'Work',
        street: '456 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        country: 'USA',
        isDefault: false
      }
    ],
    preferences: {
      email: true,
      whatsapp: false
    }
  });

  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    type: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    setEditingAddress(null);
  };

  const handleAddressSave = (addressId) => {
    // Save address logic
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    // Add new address logic
    setNewAddress({
      type: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false
    });
  };

  const handleDeleteAddress = (addressId) => {
    // Delete address logic
  };

  const handleSetDefaultAddress = (addressId) => {
    // Set default address logic
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
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">Manage your personal information and preferences</p>
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
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-blue-100 shadow-xl">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      variant="secondary"
                    >
                      <Camera className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{profileData.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Mail className="h-3 w-3" />
                      {profileData.email}
                    </p>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Customer ID</span>
                      <span className="font-medium">{profileData.customerId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium">{profileData.totalOrders}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg hover:-translate-y-1 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group/btn"
                  >
                    <Edit className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      disabled={!isEditing}
                      className="focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                      disabled={!isEditing}
                      className="focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={profileData.gender}
                      onValueChange={(value) => setProfileData({...profileData, gender: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isEditing && (
                  <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
                    <Save className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                    Save Changes
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Address Information
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAddress}
                    className="border-gray-300 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 group/btn"
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                    Add Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {profileData.addresses.map((address, index) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4 space-y-3 hover:border-blue-300 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={address.isDefault ? "default" : "secondary"} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAddress(address.id)}
                          className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group/btn"
                        >
                          <Edit className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300 group/btn"
                        >
                          <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-gray-900">{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <User className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Customer ID</Label>
                    <p className="text-sm font-bold text-blue-700">{profileData.customerId}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Join Date</Label>
                    <p className="text-sm font-bold text-green-700">{profileData.joinDate}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <Label className="text-xs text-muted-foreground">Total Orders</Label>
                    <p className="text-sm font-bold text-purple-700">{profileData.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-600">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Communication Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label htmlFor="email-pref" className="font-medium text-gray-900">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-pref"
                      checked={profileData.preferences.email}
                      onCheckedChange={(checked) =>
                        setProfileData({
                          ...profileData,
                          preferences: {...profileData.preferences, email: checked}
                        })
                      }
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-lg border border-green-100">
                    <div>
                      <Label htmlFor="whatsapp-pref" className="font-medium text-gray-900">WhatsApp Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
                    </div>
                    <Switch
                      id="whatsapp-pref"
                      checked={profileData.preferences.whatsapp}
                      onCheckedChange={(checked) =>
                        setProfileData({
                          ...profileData,
                          preferences: {...profileData.preferences, whatsapp: checked}
                        })
                      }
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>

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
