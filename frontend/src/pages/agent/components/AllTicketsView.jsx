import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { TicketsTable } from './TicketsTable';
import agentApi from '../../../services/agentApi';
import { Search, Filter, RefreshCw, RotateCcw } from 'lucide-react';

export const AllTicketsView = ({ onOpen }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedOnly, setAssignedOnly] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, assignedOnly]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getTickets(
        statusFilter === 'all' ? null : statusFilter,
        priorityFilter === 'all' ? null : priorityFilter,
        assignedOnly
      );
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await agentApi.resolveTicket(ticketId);
      // Update ticket status locally
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'RESOLVED' }
          : ticket
      ));
    } catch (error) {
      console.error('Failed to resolve ticket:', error);
      alert('Failed to resolve ticket. Please try again.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssignedOnly(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.id.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.customer_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white/90 border-gray-300 focus:border-blue-500"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-white/90 border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-12 bg-white/90 border-gray-300">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={assignedOnly ? "default" : "outline"}
                onClick={() => setAssignedOnly(!assignedOnly)}
                className="flex-1 h-12"
              >
                {assignedOnly ? "My Tickets" : "All Tickets"}
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-12 px-3"
                title="Reset all filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tickets ({filteredTickets.length})</span>
            {searchQuery && (
              <span className="text-sm text-muted-foreground">
                Filtered by: "{searchQuery}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading tickets...</span>
            </div>
          ) : (
            <TicketsTable tickets={filteredTickets} onOpen={onOpen} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};