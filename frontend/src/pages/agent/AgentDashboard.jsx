import React, { useState } from 'react';
import { MessageSquare, Users, BarChart3, Plus, AlertCircle, LayoutDashboard } from 'lucide-react';
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
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('dashboard');
  const [tickets, setTickets] = useState([...demoTickets]);
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'low' });

  const stats = [
    { title: 'Total Tickets', value: tickets.length, icon: MessageSquare, tone: 'text-blue-600' },
    { title: 'Assigned to me', value: 5, icon: Users, tone: 'text-emerald-600' },
    { title: 'High Priority', value: tickets.filter(t => t.priority === 'high').length, icon: BarChart3, tone: 'text-violet-600' },
    { title: 'Overdue', value: 1, icon: AlertCircle, tone: 'text-red-600' }
  ];

  const handleNewTicket = (e) => {
    e.preventDefault();
    const id = `TKT-${String(Math.floor(Math.random()*900)+100)}`;
    const createdAt = new Date().toISOString();
    const ticket = {
      id,
      subject: newTicket.subject,
      status: 'open',
      priority: newTicket.priority,
      createdAt,
      messages: [],
      orderId: 'ORD-2024-001'
    };
    setTickets([ticket, ...tickets]);
    setShowNewTicket(false);
    setNewTicket({ subject: '', priority: 'low' });
    toast.success('Ticket created successfully', {
      description: `New ticket ${id} has been created.`
    });
  };

  return (
    <AgentLayout active={active} onNavigate={setActive}>
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
              <Button 
                onClick={() => setShowNewTicket(v => !v)} 
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Plus className="h-5 w-5" /> New Ticket
              </Button>
            </div>
          </div>

          {showNewTicket && (
            <Card className="mb-8 shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5 animate-slide-in-up">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Plus className="h-5 w-5" />
                  Create New Ticket
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form className="space-y-4" onSubmit={handleNewTicket}>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={newTicket.subject}
                      onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                      required
                      placeholder="Enter ticket subject"
                      className="border-2 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={v => setNewTicket({ ...newTicket, priority: v })}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowNewTicket(false)} className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md">
                      Create Ticket
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <StatsCards items={stats} />

          <TicketsTable tickets={tickets} onOpen={t => { setSelectedTicket(t); setActive('ticket'); }} />
        </div>
      )}
      {active === 'ticket' && (
        <TicketDetails 
          ticketId={selectedTicket?.id} 
          onBack={() => setActive('dashboard')}
          onNavigate={setActive}
        />
      )}
      {active === 'templates' && <ResponseTemplates />}
      {active === 'comm' && <CommunicationTools />}
      {active === 'customer' && <CustomerProfile />}
      {active === 'settings' && <Settings />}
    </AgentLayout>
  );
};
