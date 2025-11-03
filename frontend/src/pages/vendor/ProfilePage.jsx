import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Camera, Upload, Save, Edit, Phone, Mail, MessageSquare, User, MapPin, Calendar, Award } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: 'TechCorp Solutions',
    vendorId: 'VEND-2024-001',
    registeredAddress: '123 Business Park, Industrial Area',
    businessCategory: 'Electronics',
    joinDate: '2024-01-01',
    contactPerson: user?.name || 'Aman Vendor',
    email: user?.email || 'vendor@intellica.com',
    phone: '+1-555-0123',
    preferredCommunication: 'email',
    logo: null
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const handleContactSave = () => {
    // Save contact logic here
    setIsEditingContact(false);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle logo upload logic
      setProfileData({...profileData, logo: URL.createObjectURL(file)});
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
              Vendor Profile
            </h1>
            <p className="text-gray-600 mt-1 text-base animate-fade-in-up animation-delay-200">Manage your business information and company details</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-600" />
                  Business Information
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div>
                <Label htmlFor="businessName" className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-purple-600" />
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                  disabled={!isEditing}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <Label htmlFor="vendorId" className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-green-600" />
                  Vendor ID
                </Label>
                <Input
                  id="vendorId"
                  value={profileData.vendorId}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="registeredAddress" className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-orange-600" />
                  Registered Address
                </Label>
                <Input
                  id="registeredAddress"
                  value={profileData.registeredAddress}
                  onChange={(e) => setProfileData({...profileData, registeredAddress: e.target.value})}
                  disabled={!isEditing}
                  className="focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <Label htmlFor="businessCategory" className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-indigo-600" />
                  Business Category
                </Label>
                <Select
                  value={profileData.businessCategory}
                  onValueChange={(value) => setProfileData({...profileData, businessCategory: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="joinDate" className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-teal-600" />
                  Join Date
                </Label>
                <Input
                  id="joinDate"
                  value={profileData.joinDate}
                  disabled
                  className="bg-muted"
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
                  <Save className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                  Save Business Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingContact(!isEditingContact)}
                  className="hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditingContact ? 'Cancel' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div>
                <Label htmlFor="contactPerson" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Contact Person
                </Label>
                <Input
                  id="contactPerson"
                  value={profileData.contactPerson}
                  onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                  disabled={!isEditingContact}
                  className="focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditingContact}
                  className="focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditingContact}
                  className="focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div>
                <Label htmlFor="preferredCommunication" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  Preferred Communication
                </Label>
                <Select
                  value={profileData.preferredCommunication}
                  onValueChange={(value) => setProfileData({...profileData, preferredCommunication: value})}
                  disabled={!isEditingContact}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-green-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isEditingContact && (
                <Button onClick={handleContactSave} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 group/btn">
                  <Save className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                  Save Contact Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Logo */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 animate-fade-in-up animation-delay-400 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-purple-100 hover:ring-purple-200 transition-all duration-300">
                    <AvatarImage src={profileData.logo} alt="Company Logo" />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2">
                    <Button
                      size="sm"
                      className="h-10 w-10 rounded-full p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      variant="secondary"
                      asChild
                    >
                      <span>
                        <Camera className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      </span>
                    </Button>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your company logo (PNG, JPG up to 5MB)
                  </p>
                  <Button variant="outline" className="hover:bg-purple-50 hover:border-purple-300 transition-colors duration-200" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  );
};
