import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AgentLayout } from './AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { storage } from './utils';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Mail, MessageCircle, Send, Save, Copy, Clock, Activity, Link2, Zap, CheckCircle2, User, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import agentApi from '../../services/agentApi';

const KEY = 'agent.activity';
const cannedTemplates = [
  { label: 'Refund approved', text: 'Hello {{customer_name}}, your refund for order {{order_id}} has been approved. The amount will be processed within 3-5 business days.', hasVariables: true },
  { label: 'Order delay', text: 'Hello {{customer_name}}, your order {{order_id}} is delayed but will arrive soon. Thanks for your patience.', hasVariables: true },
  { label: 'Request info', text: 'Could you provide more information or a screenshot so we can assist you faster?', hasVariables: false },
  { label: 'Replacement offer', text: 'We can offer a replacement for your order {{order_id}}. Please reply if you accept.', hasVariables: true },
  { label: 'Polite closing', text: 'Let us know if there is anything else we can help you with!', hasVariables: false },
];

export const CommunicationTools = () => {
  const navigate = useNavigate();
  const { ticket_id } = useParams();
  const ticketId = ticket_id;
  // Ticket Chat
  const [ticketChat, setTicketChat] = useState({ messages: [], newMessage: '', loading: false });
  const [selectedTicket, setSelectedTicket] = useState(null);
  // Compose textarea
  const chatBodyRef = useRef();
  const messagesEndRef = useRef();




  const substituteVariables = (text) => {
    if (!selectedTicket) return text;
    
    let substituted = text;
    
    // Replace {{order_id}} with related order ID
    if (selectedTicket.related_order?.id) {
      substituted = substituted.replace(/{{order_id}}/g, selectedTicket.related_order.id);
    }
    
    // Replace {{customer_name}} with customer name
    if (selectedTicket.customer?.name) {
      substituted = substituted.replace(/{{customer_name}}/g, selectedTicket.customer.name);
    }
    
    // Replace {{ticket_id}} with current ticket ID
    substituted = substituted.replace(/{{ticket_id}}/g, ticketId || selectedTicket.id);
    
    return substituted;
  };

  const insertChatCanned = text => {
    const processedText = substituteVariables(text);
    setTicketChat(c => ({ ...c, newMessage: c.newMessage ? c.newMessage + '\n' + processedText : processedText }));
    setTimeout(() => chatBodyRef.current && chatBodyRef.current.focus(), 50);
  };

  const openEmailClient = (template = '', useGmail = false) => {
    if (!selectedTicket?.customer?.email) {
      toast.error('Customer email not available');
      return;
    }
    
    const subject = `Re: ${selectedTicket.subject} - Ticket #${ticketId}`;
    const body = template ? substituteVariables(template) : '';
    
    if (useGmail) {
      // Open Gmail compose directly
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedTicket.customer.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    } else {
      // Try default email client first
      const mailtoUrl = `mailto:${selectedTicket.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_blank');
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(ticketId);
    }
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticketChat.messages]);

  useEffect(() => {
    // Auto-scroll when new message is sent
    if (ticketChat.messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [ticketChat.messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetails = async (id) => {
    try {
      setTicketChat(prev => ({ ...prev, loading: true }));
      const ticket = await agentApi.getTicketDetails(id);
      setSelectedTicket(ticket);
      setTicketChat(prev => ({ ...prev, messages: ticket.messages || [], loading: false }));
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      setTicketChat(prev => ({ ...prev, loading: false }));
      toast.error('Failed to load ticket chat');
    }
  };

  const sendChatMessage = async () => {
    if (!ticketChat.newMessage.trim() || !ticketId) return;

    try {
      await agentApi.addTicketMessage(ticketId, {
        content: ticketChat.newMessage,
        is_internal: false
      });
      
      // Refresh messages
      await fetchTicketDetails(ticketId);
      setTicketChat(prev => ({ ...prev, newMessage: '' }));
      
      toast.success('Message sent to customer!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <AgentLayout>
      <div className="flex flex-col gap-8 animate-slide-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-lg">
        <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Communication Tools</h1>
              <p className="text-xs text-muted-foreground">Email & Ticket Chat integration</p>
            </div>
          </div>
          {ticketId && (
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
              <Clock className="h-3 w-3 mr-1" />
              Ticket #{ticketId}
            </Badge>
          )}
          <div className="flex-1"></div>
          <Button variant="outline" onClick={() => navigate('/agent/dashboard')} className="ml-auto hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
      {/* FULL WIDTH TICKET CHAT */}
      <Card className="shadow-lg border-2 border-success/20 bg-gradient-to-br from-background to-success/5 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-success/10 to-success/5 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-success">
                <MessageCircle className="h-5 w-5" />
                Ticket Chat
              </div>
              {selectedTicket?.customer && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{selectedTicket.customer.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs">{selectedTicket.customer.email}</span>
                      <button 
                        onClick={() => openEmailClient('', true)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        title="Open Gmail to email customer"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Gmail
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!ticketId ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a ticket to start chatting with the customer</p>
              </div>
            ) : (
              <>
                {selectedTicket && (
                  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">{selectedTicket.customer?.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTicket.subject}</p>
                  </div>
                )}
                
                <div className="border rounded-xl h-96 flex flex-col bg-gradient-to-b from-gray-50/50 to-white">
                  <ScrollArea className="flex-1 p-4">
                    {ticketChat.loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-3 animate-spin text-primary" />
                        <p className="text-sm font-medium">Loading conversation...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ticketChat.messages.map((msg, index) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'} group`}>
                            {msg.sender_type !== 'agent' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                {selectedTicket?.customer?.name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div className={`flex flex-col ${msg.sender_type === 'agent' ? 'items-end' : 'items-start'} max-w-[75%] relative`}>
                              <div className={`rounded-2xl px-4 py-3 shadow-sm border ${
                                msg.sender_type === 'agent'
                                  ? 'bg-gradient-to-r from-primary to-primary/90 text-white border-primary/20'
                                  : 'bg-white text-gray-900 border-gray-200 shadow-md'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                {/* Display image attachments */}
                                {(msg.content.includes('.jpg') || msg.content.includes('.jpeg') || msg.content.includes('.png') || msg.content.includes('.webp')) ? (
                                  <div className="mt-3">
                                    {msg.content.split(', ').filter(filename => filename.match(/\.(jpg|jpeg|png|webp)$/i)).map((filename, idx) => (
                                      <img 
                                        key={idx}
                                        src={`http://localhost:8000/uploads/tickets/${ticketId}/${encodeURIComponent(filename)}`}
                                        alt={filename}
                                        className="max-w-xs rounded-lg border shadow-sm mt-2 cursor-pointer hover:shadow-lg transition-shadow"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                        onClick={() => window.open(`http://localhost:8000/uploads/tickets/${ticketId}/${encodeURIComponent(filename)}`, '_blank')}
                                      />
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              <div className={`flex items-center gap-2 mt-1 px-1 ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {msg.sender_type === 'agent' && (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('Delete this message?')) {
                                        try {
                                          await agentApi.deleteTicketMessage(ticketId, msg.id);
                                          await fetchTicketDetails(ticketId);
                                          toast.success('Message deleted');
                                        } catch (error) {
                                          toast.error('Failed to delete message');
                                        }
                                      }
                                    }}
                                    className="w-5 h-5 bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                                    title="Delete message"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {msg.sender_type === 'agent' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                A
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <div className="border-t bg-white p-4 rounded-b-xl">
                  {/* Quick Templates */}
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {cannedTemplates.map(t => (
                      <Button 
                        size="sm" 
                        key={t.label} 
                        variant="secondary" 
                        onClick={() => insertChatCanned(t.text)}
                        className={`whitespace-nowrap text-xs px-3 py-1 h-7 ${
                          t.hasVariables 
                            ? 'bg-accent/20 hover:bg-accent/30 text-accent border-accent/30' 
                            : 'bg-success/10 hover:bg-success/20 text-success border-success/20'
                        } hover:border-success/40`}
                        title={t.hasVariables ? 'Contains variables that will be auto-filled' : 'Static template'}
                      >
                        {t.hasVariables ? <Link2 className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                        {t.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Textarea
                        ref={chatBodyRef}
                        rows={3}
                        className="resize-none border-gray-300 focus:border-primary focus:ring-primary/20 rounded-xl"
                        value={ticketChat.newMessage}
                        onChange={e => setTicketChat(prev => ({ ...prev, newMessage: e.target.value }))}
                        placeholder="Type your message to the customer... (Press Enter to send, Shift+Enter for new line)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      onClick={sendChatMessage}
                      disabled={!ticketChat.newMessage.trim()}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </AgentLayout>
  );
};


