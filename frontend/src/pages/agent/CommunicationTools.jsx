import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { storage } from './utils';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Mail, MessageCircle, Send, Save, Copy, Clock, Activity, Link2, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const KEY = 'agent.activity';
const cannedTemplates = [
  { label: 'Refund approved', text: 'Hello, your refund for order {{order_id}} has been approved. The amount will be processed within 3-5 business days.' },
  { label: 'Order delay', text: 'Hello, your order is delayed but will arrive soon. Thanks for your patience.' },
  { label: 'Request info', text: 'Could you provide more information or a screenshot so we can assist you faster?' },
  { label: 'Replacement offer', text: 'We can offer a replacement for your order. Please reply if you accept.' },
  { label: 'Polite closing', text: 'Let us know if there is anything else we can help you with!' },
];

export const CommunicationTools = () => {
  const [activity, setActivity] = useState(() => storage.get(KEY, []));
  // Email
  const [email, setEmail] = useState({ to: 'jamie.rivera@example.com', subject: 'Refund Approved — Order ORD-10492', body: '' });
  // WhatsApp 
  const [whatsapp, setWhatsapp] = useState({ to: '+1 415 555 0198', body: '' });
  // Compose textareas
  const emailBodyRef = useRef();
  const waBodyRef = useRef();

  const log = (entry) => {
    const e = { id: Date.now(), ts: new Date().toISOString(), ...entry };
    const updated = [e, ...activity].slice(0, 50);
    setActivity(updated);
    storage.set(KEY, updated);
  };


  const insertEmailCanned = text => {
    setEmail(e => ({ ...e, body: e.body ? e.body + '\n' + text : text }));
    setTimeout(() => emailBodyRef.current && emailBodyRef.current.focus(), 50);
  };
  const insertWACanned = text => {
    setWhatsapp(w => ({ ...w, body: w.body ? w.body + '\n' + text : text }));
    setTimeout(() => waBodyRef.current && waBodyRef.current.focus(), 50);
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
              <p className="text-xs text-muted-foreground">Email & WhatsApp integration</p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20">
            <Clock className="h-3 w-3 mr-1" />
            Ticket #4031
          </Badge>
          <div className="flex-1"></div>
          <Button size="sm" variant="outline" className="ml-2 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all">
            <Link2 className="h-3 w-3 mr-1" />
            Link to ticket
          </Button>
          <Button size="sm" className="ml-1 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-white shadow-md">
            <Activity className="h-3 w-3 mr-1" />
            Activity
          </Button>
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
                      className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 hover:border-primary/40"
                    >
                      <Zap className="h-3 w-3 mr-1" />
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
                  log({ type: 'email', to: email.to, subject: email.subject, body: email.body }); 
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
        {/* WHATSAPP CARD */}
        <Card className="shadow-lg border-2 border-success/20 bg-gradient-to-br from-background to-success/5 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-success/10 to-success/5 border-b">
            <CardTitle className="flex items-center gap-2 text-success">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 items-center gap-2 mb-2">
              <label className="col-span-1 font-semibold text-sm text-muted-foreground">To</label>
              <Input className="col-span-4" value={whatsapp.to} onChange={e => setWhatsapp(w => ({ ...w, to: e.target.value }))} />
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
                      onClick={() => insertWACanned(t.text)}
                      className="bg-success/10 hover:bg-success/20 text-success border-success/20 hover:border-success/40"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {t.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  ref={waBodyRef}
                  rows={5}
                  className="resize-none"
                  value={whatsapp.body}
                  onChange={e => setWhatsapp(w => ({ ...w, body: e.target.value }))}
                  placeholder="Type or insert a canned response..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="outline" onClick={() => setWhatsapp({ ...whatsapp, body: '' })} className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive">
                Clear
              </Button>
              <Button 
                onClick={() => { 
                  log({ type: 'whatsapp', to: whatsapp.to, body: whatsapp.body }); 
                  setWhatsapp({ ...whatsapp, body: '' });
                  toast.success('WhatsApp message sent!');
                }}
                className="bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white shadow-md"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* RECENT ACTIVITY CARD */}
      <Card className="shadow-lg border-2 border-accent/10 bg-gradient-to-br from-background to-accent/5">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-2 text-accent">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ScrollArea className="h-48 md:h-60">
            <div className="space-y-3 pr-2">
              {activity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet.</p>
                </div>
              ) : (
                activity.map(a => (
                  <div key={a.id} className="rounded-lg border-2 border-primary/10 p-4 text-sm bg-gradient-to-r from-card to-primary/5 hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center gap-2 font-medium capitalize mb-2">
                      {a.type === 'email' ? (
                        <Mail className="h-4 w-4 text-primary" />
                      ) : (
                        <MessageCircle className="h-4 w-4 text-success" />
                      )}
                      <span className="text-primary">{a.type}</span>
                      <span className="text-muted-foreground">to</span>
                      <span className="font-semibold">{a.to}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      {new Date(a.ts).toLocaleString()}
                    </div>
                    {a.subject ? (
                      <div className="text-xs mb-1 p-2 bg-primary/10 rounded border border-primary/20">
                        <b>Subject:</b> {a.subject}
                      </div>
                    ) : null}
                    {a.body ? (
                      <div className="whitespace-pre-line text-xs text-card-foreground p-2 bg-muted/50 rounded border mt-2">
                        {a.body}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};


