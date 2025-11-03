import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Settings, Menu, X } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={
            user?.role === 'vendor' ? '/vendor/dashboard' :
            user?.role === 'agent' ? '/agent/dashboard' :
            user?.role === 'supervisor' ? '/supervisor/dashboard' :
            '/customer/dashboard'
          } className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-xl font-bold text-primary-foreground">
                I
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-foreground">Intellica</span>
              <span className="text-xs text-muted-foreground">
                {user?.role === 'customer' ? 'Customer Portal' :
                 user?.role === 'vendor' ? 'Vendor Portal' :
                 user?.role === 'agent' ? 'Agent Portal' :
                 'Customer Support'}
              </span>
            </div>

          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md btn-transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Company Name for Vendor */}
            {user?.role === 'vendor' && (
              <div className="hidden md:flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">TechCorp Solutions</span>
              </div>
            )}

            {/* Customer Name with Avatar */}
            {user?.role === 'customer' && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs bg-green-100 text-green-700">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold text-green-700">{user?.name}</span>
              </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-2 py-3 hover:bg-secondary cursor-pointer btn-transition ${
                        !notification.read ? 'bg-primary-light' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:block">Logout</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md btn-transition"
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
