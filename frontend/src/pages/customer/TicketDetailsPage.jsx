import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ChatBot } from '../../components/common/ChatBot';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Calendar, Package } from 'lucide-react';
import { tickets } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [ticketData, setTicketData] = useState(
    tickets.find(t => t.id === ticketId) || null
  );

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: ticketData.messages.length + 1,
      sender: 'customer',
      senderName: user?.name || 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
      attachments: []
    };

    setTicketData({
      ...ticketData,
      messages: [...ticketData.messages, message]
    });
    setNewMessage('');
    toast.success('Message sent successfully');
  };

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
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/customer/tickets')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Conversation */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{ticketData.subject}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{ticketData.id}</Badge>
                      <Badge className={getStatusColor(ticketData.status)}>
                        {ticketData.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticketData.priority)}>
                        {ticketData.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Messages */}
                  {ticketData.messages.map((message) => (
                    <div key={message.id} className="flex gap-4 animate-slide-in-up">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={message.sender === 'customer' ? user?.avatar : undefined} />
                        <AvatarFallback className={message.sender === 'agent' ? 'bg-primary text-primary-foreground' : ''}>
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{message.senderName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-secondary rounded-lg p-4">
                          <p className="text-foreground">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Section */}
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold text-foreground mb-4">Add Reply</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach File
                      </Button>
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticketData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Related Order</p>
                    <p className="text-sm text-muted-foreground">{ticketData.orderId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Paperclip className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No attachments</p>
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
