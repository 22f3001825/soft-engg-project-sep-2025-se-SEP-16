import React from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export const NotificationDropdown = ({ notifications, onMarkRead, onRefresh, onDelete, userType }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await onMarkRead(notification.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  return (
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
                } group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleNotificationClick(notification)}>
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
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50 animate-pulse" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await onDelete(notification.id);
                          onRefresh();
                        } catch (error) {
                          console.error('Failed to delete notification:', error);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};