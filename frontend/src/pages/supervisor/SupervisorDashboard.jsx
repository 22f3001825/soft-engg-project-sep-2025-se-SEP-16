import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, ArrowLeft, User, LogOut, TrendingUp, Users, BarChart3, Settings } from 'lucide-react';

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { title: 'Team Members', value: '8', icon: Users, color: 'text-blue-600' },
    { title: 'Avg Resolution Time', value: '2.4h', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Customer Satisfaction', value: '4.8/5', icon: BarChart3, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <Button
          onClick={() => navigate('/login')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {user?.role}
          </Badge>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name}</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warning to-accent shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Supervisor Portal</h1>
          <p className="text-muted-foreground">Oversee team performance and monitor operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Supervisor Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-6 text-center">
              <p className="text-foreground mb-4">
                Welcome to the Supervisor Portal, {user?.name}!
              </p>
              <p className="text-sm text-muted-foreground">
                Monitor team performance, manage operations, and oversee customer service quality.
                Build your supervisory features here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Management Tools</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Team Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics Dashboard
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Recent Updates</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Team metrics updated</p>
                  <p>• New agent training completed</p>
                  <p>• Customer feedback reviewed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
