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
    { key: 'customer', label: 'Customer Profile', icon: IdCard },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden flex flex-col">
      <header className="border-b border-sky-200/50 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 backdrop-blur supports-[backdrop-filter]:bg-sky-50/95 shadow-md flex-shrink-0">
        <div className="max-w-full mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-xl font-bold text-primary-foreground">I</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-foreground">Intellica</span>
              <span className="text-xs text-muted-foreground">Agent Portal</span>
            </div>
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
        <aside className="w-64 border-r bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 border-indigo-200/50 border-2 shadow-xl backdrop-blur-sm flex flex-col flex-shrink-0">
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {items.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all duration-200',
                  'hover:bg-indigo-50/80 hover:shadow-md hover:translate-x-[2px] border border-transparent',
                  active === key 
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg border-indigo-300' 
                    : 'text-slate-600 hover:text-slate-900'
                )}
                onClick={() => onNavigate(key)}
              >
                <div className={cn(
                  'p-1.5 rounded-md transition-colors',
                  active === key ? 'bg-white/20' : 'bg-white'
                )}>
                  <Icon className={cn(
                    'h-5 w-5',
                    active === key ? 'text-white' : 'text-slate-500'
                  )} />
                </div>
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t bg-white/60">
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


