import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Ticket, Plus, Search, Filter, ArrowRight, Eye } from 'lucide-react';
import { tickets } from '../../data/dummyData';

export const TicketsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-info text-info-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Support Tickets</h1>
            <p className="text-muted-foreground">Manage and track your support requests. Click on any ticket to view details.</p>
          </div>
          <Button onClick={() => navigate('/customer/tickets/new')} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="grid gap-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No tickets found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or create a new ticket</p>
                <Button onClick={() => navigate('/customer/tickets/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1" onClick={() => navigate(`/customer/tickets/${ticket.id}`)}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Ticket className="h-6 w-6 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-700 transition-colors duration-300">{ticket.subject}</h3>
                        <Badge variant="outline" className="text-xs">{ticket.id}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>Order: {ticket.orderId}</span>
                        <span>•</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{ticket.messages.length} messages</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <ChatBot />
    </div>
  );
};
