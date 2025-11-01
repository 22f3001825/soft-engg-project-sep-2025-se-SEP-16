import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, MessageSquare, FileText, LayoutGrid, Mail, IdCard } from 'lucide-react';

export const AgentLayout = ({ active, onNavigate, actions, children }) => {
  const { user, logout } = useAuth();

  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'ticket', label: 'Ticket Details', icon: FileText },
    { key: 'templates', label: 'Response Templates', icon: FileText },
    { key: 'comm', label: 'Communication Tools', icon: Mail },
    { key: 'customer', label: 'Customer Profile', icon: IdCard },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 flex-shrink-0">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/20 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">Intellica — Agent</span>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <Separator orientation="vertical" className="h-6" />
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-card shadow-lg flex flex-col flex-shrink-0">
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {items.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                  'hover:bg-accent hover:shadow-md hover:scale-[1.02]',
                  active === key 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02] border-l-4 border-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => onNavigate(key)}
              >
                <div className={cn(
                  'p-1.5 rounded-md transition-colors',
                  active === key ? 'bg-primary-foreground/20' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'h-5 w-5',
                    active === key ? 'text-primary-foreground' : 'text-muted-foreground'
                  )} />
                </div>
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
              </Avatar>
              <span className="truncate">{user?.name || 'Agent'}</span>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};


