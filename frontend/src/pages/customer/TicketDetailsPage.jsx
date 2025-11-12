import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Calendar, Package, MessageSquare, Clock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import apiService from '../../services/api';

export const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const data = await apiService.getTicketDetails(ticketId);
      setTicketData(data);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-lg font-semibold mb-2">Loading...</h3>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-lg font-semibold mb-2">Ticket not found</h3>
              <Button onClick={() => navigate('/customer/tickets')}>Back to Tickets</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await apiService.addTicketMessage(ticketId, newMessage);
      setNewMessage('');
      toast.success('Message sent successfully');
      fetchTicketDetails();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-info text-info-foreground';
      case 'in-progress':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-success text-success-foreground';
      case 'closed':
        return 'bg-muted text-muted-foreground';
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/60 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/20 to-rose-400/25 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-8 relative">
        <Button
          variant="ghost"
          onClick={() => navigate('/customer/tickets')}
          className="mb-6 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Conversation */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-700 bg-clip-text text-transparent mb-3">{ticketData.subject}</CardTitle>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className="px-3 py-1 text-sm font-medium">{ticketData.id}</Badge>
                      <Badge className={`${getStatusColor(ticketData.status)} px-3 py-1 text-sm font-medium`}>
                        {ticketData.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">{ticketData.messages.length} messages</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-6">
                  {/* Messages */}
                  {ticketData.messages.map((message, index) => (
                    <div key={message.id} className={`flex gap-4 animate-slide-in-up ${message.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}>
                      {message.sender_type !== 'customer' && (
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                            {message.sender_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 space-y-2 max-w-[70%] ${message.sender_type === 'customer' ? 'flex flex-col items-end' : ''}`}>
                        <div className={`flex items-center gap-2 ${message.sender_type === 'customer' ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold text-foreground">{message.sender_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={`rounded-2xl p-4 shadow-sm ${message.sender_type === 'customer' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-gradient-to-r from-gray-50 to-slate-100 text-gray-900'}`}>
                          <p className="leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                      {message.sender_type === 'customer' && (
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                            {user?.name?.charAt(0) || 'Y'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reply Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Add Reply
                  </h4>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                      className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => document.getElementById('file-input').click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach File
                      </Button>
                      <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            try {
                              toast.loading('Uploading files...');
                              await apiService.uploadAttachment(ticketId, files);
                              toast.success(`${files.length} file(s) uploaded successfully`);
                              fetchTicketDetails(); // Refresh to show new message
                            } catch (error) {
                              console.error('Upload failed:', error);
                              toast.error('Failed to upload files');
                            }
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(ticketData.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {ticketData.related_order_id && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <Package className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Related Order</p>
                      <p className="text-sm text-gray-600">{ticketData.related_order_id}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50">
                  <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {ticketData.messages.length > 0 ? new Date(ticketData.messages[ticketData.messages.length - 1].timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-2 border-white/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-purple-600" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
                    <Paperclip className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">No attachments yet</p>
                  <p className="text-xs text-gray-500 mt-1">You can attach files when replying</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ChatBot />
    </div>
  );
};
