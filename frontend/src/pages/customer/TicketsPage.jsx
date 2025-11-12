import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Ticket, Plus, Search, Filter, ArrowRight, Eye, MessageSquare, Calendar, User } from 'lucide-react';
import { tickets } from '../../data/dummyData';
import apiService from '../../services/api';

export const TicketsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTickets(filterStatus, searchQuery);
      setTicketsData(data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      setTicketsData(tickets); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = ticketsData;

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50/40 to-pink-50/60 border-b border-indigo-200/50 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent animate-gradient-x mb-2">
                My Support Tickets
              </h1>
              <p className="text-slate-500 mt-2 text-base animate-fade-in-up animation-delay-200 font-medium">Manage and track your support requests with ease</p>
            </div>
            <Button
              onClick={() => navigate('/customer/tickets/new')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
            >
              <Plus className="mr-3 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
              <span className="font-semibold">New Ticket</span>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="relative pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500 group-hover:text-blue-500 transition-colors duration-300" />
                <Input
                  placeholder="Search tickets by subject or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base bg-white/90 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[220px] h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl shadow-sm">
                  <Filter className="mr-3 h-4 w-4 text-slate-400" />
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
        <div className="grid gap-6">
          {filteredTickets.length === 0 ? (
            <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-50/50 to-slate-50/50 border-2 border-gray-200/50 shadow-xl hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative py-16 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Ticket className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search or create a new ticket</p>
                <Button
                  onClick={() => navigate('/customer/tickets/new')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket, index) => (
              <Card
                key={ticket.id}
                className="group relative overflow-hidden bg-gradient-to-br from-white/95 to-blue-50/30 backdrop-blur-sm border-2 border-blue-200/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Ticket className="h-8 w-8 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{ticket.subject}</h3>
                        <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border-gray-300 text-gray-700">{ticket.id}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Order: {ticket.order_id || ticket.orderId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(ticket.created_at || ticket.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{ticket.message_count || 0} messages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <Badge className={`${getStatusColor(ticket.status)} text-sm font-semibold px-3 py-1 rounded-full shadow-sm`}>
                        {ticket.status}
                      </Badge>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/tickets/${ticket.id}`);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      >
                        <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                        <span className="font-semibold">View Details</span>
                      </Button>
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
