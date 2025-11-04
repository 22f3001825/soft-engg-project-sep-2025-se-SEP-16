import React, { useState } from 'react';
import { MessageSquare, Users, BarChart3, AlertCircle, LayoutDashboard } from 'lucide-react';
import { AgentLayout } from './AgentLayout';
import { StatsCards } from './components/StatsCards';
import { TicketsTable } from './components/TicketsTable';
import { TicketDetails } from './TicketDetails';
import { ResponseTemplates } from './ResponseTemplates';
import { CommunicationTools } from './CommunicationTools';
import { CustomerProfile } from './CustomerProfile';
import { Settings } from './Settings';
import { tickets as demoTickets } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [tickets, setTickets] = useState([...demoTickets]);
  const [selectedTicket, setSelectedTicket] = useState(undefined);
  const [commTicketId, setCommTicketId] = useState(undefined);

  const stats = [
    { title: 'Total Tickets', value: tickets.length, icon: MessageSquare, tone: 'text-blue-600' },
    { title: 'Assigned to me', value: 5, icon: Users, tone: 'text-emerald-600' },
    { title: 'High Priority', value: tickets.filter(t => t.priority === 'high').length, icon: BarChart3, tone: 'text-violet-600' },
    { title: 'Overdue', value: 1, icon: AlertCircle, tone: 'text-red-600' }
  ];

  

  
  const handleNavigate = (to, params) => {
    let nextTab = typeof to === 'string' ? to : (to.tab || 'dashboard');
    setActive(nextTab);
    if (nextTab !== 'ticket') setSelectedTicket(undefined);
    if (nextTab === 'comm' && params && params.ticketId) {
      setCommTicketId(params.ticketId);
    } else if (nextTab === 'comm' && to.ticketId) {
      setCommTicketId(to.ticketId);
    } else if (nextTab === 'comm') {
      setCommTicketId(undefined);
    }
  };
  return (
    <AgentLayout active={active} onNavigate={handleNavigate}>
      {active === 'dashboard' && (
        <div className="space-y-8 animate-slide-in-up">
          {/* Header */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-lg">
            <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome Mayank!</h1>
                  <p className="text-sm text-muted-foreground mt-1">Manage and track support tickets efficiently</p>
                </div>
              </div>
              
            </div>
          </div>

          

          <StatsCards items={stats} />

          <TicketsTable tickets={tickets} onOpen={t => { setSelectedTicket(t); setActive('ticket'); }} />
        </div>
      )}
      {active === 'ticket' && (
        <TicketDetails
          ticketId={selectedTicket ? selectedTicket.id : undefined}
          onBack={() => setActive('dashboard')}
          onNavigate={handleNavigate}
        />
      )}
      {active === 'templates' && <ResponseTemplates />}
      {active === 'comm' && <CommunicationTools ticketId={commTicketId} />}
      {active === 'customer' && <CustomerProfile />}
      {active === 'settings' && <Settings />}
    </AgentLayout>
  );
};
