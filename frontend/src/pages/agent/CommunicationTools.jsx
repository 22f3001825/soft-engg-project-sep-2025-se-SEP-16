import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { storage } from './utils';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Mail, MessageCircle, Send, Save, Copy, Clock, Activity, Link2, Zap, CheckCircle2, User } from 'lucide-react';
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

export const CommunicationTools = ({ ticketId, onBack }) => {
  const navigate = useNavigate();
  // Email
  const [email, setEmail] = useState({ to: 'jamie.rivera@example.com', subject: 'Refund Approved', body: '' });
  // Ticket Chat
  const [ticketChat, setTicketChat] = useState({ messages: [], newMessage: '', loading: false });
  const [selectedTicket, setSelectedTicket] = useState(null);
  // Compose textareas
  const emailBodyRef = useRef();
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

  const insertEmailCanned = text => {
    const processedText = substituteVariables(text);
    setEmail(e => ({ ...e, body: e.body ? e.body + '\n' + processedText : processedText }));
    setTimeout(() => emailBodyRef.current && emailBodyRef.current.focus(), 50);
  };
  const insertChatCanned = text => {
    const processedText = substituteVariables(text);
    setTicketChat(c => ({ ...c, newMessage: c.newMessage ? c.newMessage + '\n' + processedText : processedText }));
    setTimeout(() => chatBodyRef.current && chatBodyRef.current.focus(), 50);
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
          {onBack && (
            <Button variant="outline" onClick={onBack} className="ml-auto hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EMAIL CARD */}
        <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Mail className="h-5 w-5" />
              Email Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 items-center gap-2 mb-2">
              <label className="col-span-1 font-semibold text-sm text-muted-foreground">To</label>
              <Input className="col-span-4" value={email.to} onChange={e => setEmail(v => ({ ...v, to: e.target.value }))} />
            </div>
            <div className="grid grid-cols-5 items-center gap-2 mb-2">
              <label className="col-span-1 font-semibold text-sm text-muted-foreground">Subject</label>
              <Input className="col-span-4" value={email.subject} onChange={e => setEmail(v => ({ ...v, subject: e.target.value }))} />
            </div>
            <div className="grid grid-cols-5 items-center gap-2 mb-2">
              <label className="col-span-1 font-semibold text-sm text-muted-foreground">Message</label>
              <div className="col-span-4 flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap mb-1">
                  {cannedTemplates.map(t => (
                    <Button 
                      size="xs" 
                      key={t.label} 
                      variant="secondary" 
                      onClick={() => insertEmailCanned(t.text)}
                      className={`${t.hasVariables ? 'bg-accent/20 hover:bg-accent/30 text-accent border-accent/30' : 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20'} hover:border-primary/40`}
                      title={t.hasVariables ? 'Contains variables that will be auto-filled' : 'Static template'}
                    >
                      {t.hasVariables ? <Link2 className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                      {t.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  ref={emailBodyRef}
                  rows={5}
                  className="resize-none"
                  value={email.body}
                  onChange={e => setEmail(v => ({ ...v, body: e.target.value }))}
                  placeholder="Type or insert a canned response..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="outline" onClick={() => setEmail({ ...email, body: '' })} className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive">
                Clear
              </Button>
              <Button 
                onClick={() => { 
                  setEmail({ ...email, body: '' });
                  toast.success('Email sent successfully!');
                }}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                Send & track
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* TICKET CHAT CARD */}
        <Card className="shadow-lg border-2 border-success/20 bg-gradient-to-br from-background to-success/5 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-success/10 to-success/5 border-b">
            <CardTitle className="flex items-center gap-2 text-success">
              <MessageCircle className="h-5 w-5" />
              Ticket Chat
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
                
                <div className="border rounded-lg h-64 flex flex-col">
                  <ScrollArea className="flex-1 p-3">
                    {ticketChat.loading ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                        <p className="text-sm">Loading messages...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ticketChat.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender_type === 'agent'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    {cannedTemplates.map(t => (
                      <Button 
                        size="xs" 
                        key={t.label} 
                        variant="secondary" 
                        onClick={() => insertChatCanned(t.text)}
                        className={`${t.hasVariables ? 'bg-accent/20 hover:bg-accent/30 text-accent border-accent/30' : 'bg-success/10 hover:bg-success/20 text-success border-success/20'} hover:border-success/40`}
                        title={t.hasVariables ? 'Contains variables that will be auto-filled' : 'Static template'}
                      >
                        {t.hasVariables ? <Link2 className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
                        {t.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      ref={chatBodyRef}
                      rows={2}
                      className="resize-none flex-1"
                      value={ticketChat.newMessage}
                      onChange={e => setTicketChat(prev => ({ ...prev, newMessage: e.target.value }))}
                      placeholder="Type your message to the customer..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendChatMessage}
                      disabled={!ticketChat.newMessage.trim()}
                      className="bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white shadow-md"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};


