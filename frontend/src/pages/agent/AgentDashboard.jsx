import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Users, BarChart3, AlertCircle, LayoutDashboard } from 'lucide-react';
import { AgentLayout } from './AgentLayout';
import { StatsCards } from './components/StatsCards';
import { TicketsTable } from './components/TicketsTable';
import { AllTicketsView } from './components/AllTicketsView';
import agentApi from '../../services/agentApi';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';

export const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const active = location.pathname === '/agent/ticket' ? 'ticket' : 'dashboard';

  useEffect(() => {
    fetchDashboardData();
    fetchTickets();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await agentApi.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getTickets(null, null, true); // Get only assigned tickets for dashboard
      setTickets(data.slice(0, 5)); // Show only 5 recent tickets on dashboard
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData ? [
    { title: 'Available Tickets', value: dashboardData.stats.available_tickets, icon: MessageSquare, tone: 'text-blue-600' },
    { title: 'Assigned to me', value: dashboardData.stats.assigned_to_me, icon: Users, tone: 'text-emerald-600' },
    { title: 'High Priority', value: dashboardData.stats.high_priority, icon: BarChart3, tone: 'text-violet-600' },
    { title: 'Overdue', value: dashboardData.stats.overdue, icon: AlertCircle, tone: 'text-red-600' }
  ] : [];

  

  

  return (
    <AgentLayout>
      {active === 'dashboard' && (
        <div className="space-y-8 animate-slide-in-up">
          {/* Header */}
          <div className="relative overflow-hidden rounded-xl p-1 shadow-lg" style={{background: 'white'}}>
            <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome {user?.name || 'Agent'}!</h1>
                  <p className="text-sm text-muted-foreground mt-1">Manage and track support tickets efficiently</p>
                </div>
              </div>
              
            </div>
          </div>

          

          <StatsCards items={stats} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">My Recent Tickets</h2>
              <Button 
                variant="outline" 
                onClick={() => navigate('/agent/ticket')}
                className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
              >
                View Available Tickets
              </Button>
            </div>
            <TicketsTable tickets={tickets} onOpen={t => navigate(`/agent/tickets/${t.id}`)} />
          </div>
        </div>
      )}
      {active === 'ticket' && (
        <div className="space-y-6 animate-slide-in-up">
          <div className="relative overflow-hidden rounded-xl p-1 shadow-lg" style={{background: 'white'}}>
            <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Tickets</h1>
                  <p className="text-sm text-muted-foreground mt-1">Manage available support tickets</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/agent/dashboard')} className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
                Back to Dashboard
              </Button>
            </div>
          </div>
          <AllTicketsView onOpen={t => navigate(`/agent/tickets/${t.id}`)} />
        </div>
      )}
    </AgentLayout>
  );
};
