import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/dummyData';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../ui/sheet';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'customer':
        return [
          { name: 'Dashboard', path: '/customer/dashboard' },
          { name: 'My Tickets', path: '/customer/tickets' },
          { name: 'My Orders', path: '/customer/orders' },
          { name: 'Profile', path: '/customer/profile' },
          { name: 'Settings', path: '/customer/settings' },
        ];
      case 'agent':
        return [
          { name: 'Dashboard', path: '/agent/dashboard' },
          { name: 'Profile', path: '/agent/profile' },
          { name: 'Settings', path: '/agent/settings' },
        ];
      case 'supervisor':
        return [
          { name: 'Dashboard', path: '/supervisor/dashboard' },
          { name: 'Profile', path: '/supervisor/profile' },
          { name: 'Settings', path: '/supervisor/settings' },
        ];
      case 'vendor':
        return [
          { name: 'Dashboard', path: '/vendor/dashboard' },
          { name: 'Complaints', path: '/vendor/complaints' },
          { name: 'Profile', path: '/vendor/profile' },
          { name: 'Settings', path: '/vendor/settings' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const getRoleGradient = () => {
    switch (user?.role) {
      case 'customer':
        return 'from-sky-500 via-blue-500 to-cyan-500';
      case 'vendor':
        return 'from-blue-500 via-indigo-500 to-purple-500';
      case 'agent':
        return 'from-orange-500 via-red-500 to-pink-500';
      case 'supervisor':
        return 'from-violet-500 via-purple-500 to-fuchsia-500';
      default:
        return 'from-primary to-accent';
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'customer':
        return { bg: 'bg-gradient-to-r from-sky-100 to-cyan-100', border: 'border-sky-300', text: 'text-sky-800', avatar: 'bg-sky-200 text-sky-900' };
      case 'vendor':
        return { bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-blue-200', text: 'text-blue-700', avatar: 'bg-blue-100 text-blue-700' };
      case 'agent':
        return { bg: 'bg-gradient-to-r from-orange-50 to-red-50', border: 'border-orange-200', text: 'text-orange-700', avatar: 'bg-orange-100 text-orange-700' };
      case 'supervisor':
        return { bg: 'bg-gradient-to-r from-violet-50 to-purple-50', border: 'border-violet-200', text: 'text-violet-700', avatar: 'bg-violet-100 text-violet-700' };
      default:
        return { bg: 'bg-gradient-to-r from-slate-50 to-gray-50', border: 'border-slate-200', text: 'text-slate-700', avatar: 'bg-slate-100 text-slate-700' };
    }
  };

  const roleColors = getRoleColor();

  return (
<header className="sticky top-0 z-50 w-full border-b border-sky-200/50 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 backdrop-blur supports-[backdrop-filter]:bg-sky-50/95 shadow-md">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-sky-400/10 via-blue-400/10 to-cyan-400/10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with Enhanced Design */}
          <Link 
            to={
              user?.role === 'vendor' ? '/vendor/dashboard' :
              user?.role === 'agent' ? '/agent/dashboard' :
              user?.role === 'supervisor' ? '/supervisor/dashboard' :
              '/customer/dashboard'
            } 
            className="flex items-center space-x-3 group"
          >
            <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${getRoleGradient()} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
              <Sparkles className="h-5 w-5 text-white absolute animate-pulse" />
              <span className="text-xl font-bold text-white relative z-10">
                I
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-sky-900 group-hover:text-sky-700 transition-colors">
                Intellica
              </span>
              <span className="text-xs text-sky-600 font-medium">
                {user?.role === 'customer' ? 'Customer Portal' :
                 user?.role === 'vendor' ? 'Vendor Portal' :
                 user?.role === 'agent' ? 'Agent Portal' :
                 user?.role === 'supervisor' ? 'Supervisor Portal' :
                 'Customer Support'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Enhanced Styling */}
          <nav className={`hidden md:flex items-center space-x-1 ${user?.role === 'customer' ? 'bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60' : 'bg-white/60'} rounded-full px-2 py-1 backdrop-blur-sm border border-sky-200/50 shadow-sm`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-semibold text-sky-900/80 hover:text-sky-900 rounded-full transition-all duration-200 ${user?.role === 'customer' ? 'hover:bg-indigo-50/80' : 'hover:bg-white/80'} hover:shadow-sm group`}
              >
                <span className="relative z-10">{link.name}</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            ))}
          </nav>

          {/* Right Section with Enhanced Components */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Vendor Badge */}
            {user?.role === 'vendor' && (
              <div className={`hidden md:flex items-center px-4 py-2 ${roleColors.bg} rounded-full ${roleColors.border} border shadow-sm hover:shadow-md transition-all duration-200`}>
                <div className={`w-2 h-2 rounded-full ${roleColors.text.replace('text-', 'bg-')} mr-2 animate-pulse`} />
                <span className={`text-sm font-semibold ${roleColors.text}`}>TechCorp Solutions</span>
              </div>
            )}

            {/* Enhanced Customer Badge */}
            {user?.role === 'customer' && (
              <div className={`hidden md:flex items-center space-x-2 px-4 py-2 ${roleColors.bg} rounded-full ${roleColors.border} border shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer`}>
                <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm group-hover:ring-sky-300 transition-all">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className={`text-xs ${roleColors.avatar} font-semibold`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-sm font-semibold ${roleColors.text}`}>{user?.name}</span>
              </div>
            )}

            {/* Enhanced Agent/Supervisor Badge */}
            {(user?.role === 'agent' || user?.role === 'supervisor') && (
              <div className={`hidden md:flex items-center space-x-2 px-4 py-2 ${roleColors.bg} rounded-full ${roleColors.border} border shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer`}>
                <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm group-hover:ring-opacity-70 transition-all">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className={`text-xs ${roleColors.avatar} font-semibold`}>
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className={`text-sm font-semibold ${roleColors.text}`}>{user?.name}</span>
              </div>
            )}

            {/* Enhanced Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-sky-200/30 rounded-full transition-all duration-200 hover:scale-105"
                >
                  <Bell className="h-5 w-5 text-sky-700 hover:text-sky-900 transition-colors" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-br from-red-500 to-pink-500 border-2 border-background animate-pulse shadow-lg"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 shadow-xl border-sky-200/50 bg-white">
                <DropdownMenuLabel className="text-base font-semibold bg-gradient-to-r from-sky-50 to-cyan-50">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-sky-600">({unreadCount} new)</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sky-600">
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-3 py-3 hover:bg-sky-50/50 cursor-pointer transition-all duration-200 border-l-2 ${
                          !notification.read ? 'bg-sky-50/30 border-sky-500' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-sky-900' : 'text-sky-600'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-sky-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-sky-500 mt-2 flex items-center">
                              <span className="w-1 h-1 rounded-full bg-sky-400 mr-1.5" />
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-sky-500 mt-1 ml-2 shadow-sm shadow-sky-500/50 animate-pulse" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:block font-medium">Logout</span>
            </Button>

            {/* Enhanced Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-full hover:bg-sky-200/30 transition-all duration-200"
                >
                  <Menu className="h-5 w-5 text-sky-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-gradient-to-br from-sky-50 to-cyan-50">
                {/* Mobile Header */}
                <div className={`flex items-center space-x-3 p-4 ${roleColors.bg} rounded-xl ${roleColors.border} border mb-6`}>
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className={`${roleColors.avatar} font-semibold`}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-semibold ${roleColors.text}`}>{user?.name}</p>
                    <p className="text-xs text-sky-600 capitalize">{user?.role}</p>
                  </div>
                </div>

                <nav className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-sky-700 hover:text-sky-900 hover:bg-white/60 rounded-xl transition-all duration-200 hover:translate-x-1"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};