import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Camera, Upload, Save, Edit } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle logo upload logic
      setProfileData({...profileData, logo: URL.createObjectURL(file)});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Profile</h1>
          <p className="text-muted-foreground">Manage your business information and company details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Business Information
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={profileData.businessName}
                  onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="vendorId">Vendor ID</Label>
                <Input
                  id="vendorId"
                  value={profileData.vendorId}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="registeredAddress">Registered Address</Label>
                <Input
                  id="registeredAddress"
                  value={profileData.registeredAddress}
                  onChange={(e) => setProfileData({...profileData, registeredAddress: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="businessCategory">Business Category</Label>
                <Select
                  value={profileData.businessCategory}
                  onValueChange={(value) => setProfileData({...profileData, businessCategory: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
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
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  value={profileData.joinDate}
                  disabled
                  className="bg-muted"
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={profileData.contactPerson}
                  onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="preferredCommunication">Preferred Communication</Label>
                <Select
                  value={profileData.preferredCommunication}
                  onValueChange={(value) => setProfileData({...profileData, preferredCommunication: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Company Logo */}
          <Card className="rounded-xl shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profileData.logo} alt="Company Logo" />
                    <AvatarFallback className="text-4xl">
                      {profileData.businessName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="logo-upload" className="absolute -bottom-2 -right-2">
                    <Button
                      size="sm"
                      className="h-10 w-10 rounded-full p-0"
                      variant="secondary"
                      asChild
                    >
                      <span>
                        <Camera className="h-5 w-5" />
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
                  <Button variant="outline" asChild>
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
