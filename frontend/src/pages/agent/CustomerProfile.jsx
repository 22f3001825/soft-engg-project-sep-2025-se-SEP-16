import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import agentApi from '../../services/agentApi';
import { User, Mail, Phone, ShoppingBag, MessageSquare, FileText, TrendingUp, Calendar, AlertCircle, CheckCircle2, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';



export const CustomerProfile = ({ onBack }) => {
  const [note, setNote] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerDetails();
    }
  }, [selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getCustomers();
      setCustomers(data);
      if (data.length > 0) {
        setSelectedCustomerId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async () => {
    try {
      const data = await agentApi.getCustomerDetails(selectedCustomerId);
      setCustomerDetails(data);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      setCustomerDetails(null);
    }
  };

  const customer = customerDetails;
  const mainEmail = customer?.email || '';

  // Dummy Communication History
  const commHistory = [
    {
      type: 'Email',
      ts: '2h ago',
      content: 'Refund approved message sent for ORD-10492. Tracking enabled (opens, clicks).'
    },
    {
      type: 'Support Chat',
      ts: '4h ago',
      content: 'Live chat session completed. Issue resolved regarding order status inquiry.'
    },
    {
      type: 'Email',
      ts: '1d ago',
      content: 'Order confirmation and tracking details sent for ORD-10491.'
    }
  ];

  const totalLTV = customer?.orders?.reduce((sum, o) => sum + o.total, 0) || 0;

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-lg">
        <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Customer Profiles</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage customer information</p>
            </div>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="ml-auto hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {customers.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCustomerId(c.id)}
            className={`group relative w-full text-left rounded-xl border-2 transition-all btn-transition overflow-hidden ${
              c.id === selectedCustomerId
                ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 border-indigo-300 shadow-lg'
                : 'bg-white/90 border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5" />
            <div className="relative p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className={`h-10 w-10 ring-2 ${c.id === selectedCustomerId ? 'ring-white' : 'ring-indigo-100'} shadow flex-shrink-0` }>
                  <AvatarImage src={c.avatar} alt={c.name} />
                  <AvatarFallback className={`${c.id === selectedCustomerId ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'} font-semibold`}>
                    {c.name?.split(' ').map(w=>w[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className={`truncate font-semibold ${c.id === selectedCustomerId ? 'text-white' : 'text-slate-900'}`}>{c.name}</div>
                  <div className={`text-xs truncate ${c.id === selectedCustomerId ? 'text-white/80' : 'text-slate-500'}`}>{c.email}</div>
                </div>
              </div>
              <div className="flex justify-end">
                {c.id === selectedCustomerId ? (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">Selected</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2 py-1">Choose</Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {customer && (
      <>
      {/* Header */}
      <Card className="relative overflow-hidden border-2 border-primary/20 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"></div>
        <div className="relative p-6 flex flex-col gap-4 md:flex-row items-start md:items-center">
          <div className="relative">
            <Avatar className="h-20 w-20 mr-4 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={customer.avatar} alt={customer.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                {customer.name.split(' ').map(w=>w[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success border-2 border-background flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-success-foreground" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{customer.name}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Mail className="h-3 w-3 mr-1" />
                {mainEmail}
              </Badge>
              <Badge variant="outline" className="border-primary/30">
                <Calendar className="h-3 w-3 mr-1" />
                Member since {new Date(customer.member_since).toLocaleDateString()}
              </Badge>
            </div>
            <div className="flex gap-6 mt-3">
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3" />
                  Total orders
                </span>
                <span className="font-bold text-xl text-primary">{customer?.total_orders || 0}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Lifetime value
                </span>
                <span className="font-bold text-xl text-accent">${totalLTV.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-44">
            <div className="rounded-lg border-2 border-primary/20 px-4 py-3 bg-gradient-to-br from-card to-primary/5 shadow-sm">
              <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Preferred Contact
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Badge>
                  <span className="text-xs truncate">{mainEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-success/10 border-success/30">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Support Chat
                  </Badge>
                  <span className="text-xs">Available</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded border border-muted">
              <Sparkles className="h-3 w-3 inline mr-1" />
              Primary contact via email and support chat system.
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order History */}
        <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <ShoppingBag className="h-5 w-5" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-6">
            {(customer?.orders || []).map((o, i) => (
              <div key={o.id} className="flex gap-4 items-center p-4 border-2 border-primary/10 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 hover:shadow-md btn-transition cursor-pointer group">
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary font-semibold">
                  {o.id}
                </Badge>
                <span className="flex-1 truncate font-medium">{o.items?.join(', ') || 'N/A'}</span>
                <span className="text-sm font-bold text-accent">${o.total}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Communication History & Notes */}
        <div className="space-y-6">
          <Card className="shadow-lg border-2 border-accent/10 bg-gradient-to-br from-background to-accent/5">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-accent">
                <MessageSquare className="h-5 w-5" />
                Communication History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {commHistory.map((item,i)=>(
                <div key={i} className="flex items-start gap-3 p-4 border-2 rounded-lg bg-gradient-to-r from-card to-primary/5 hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 transition-all shadow-sm">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'Email' ? 'bg-primary/10' : 'bg-success/10'}`}>
                    {item.type === 'Email' ? (
                      <Mail className={`h-4 w-4 ${item.type === 'Email' ? 'text-primary' : 'text-success'}`} />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{item.type}</span>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.ts}</span>
                    </div>
                    <span className="text-sm text-foreground">{item.content}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-lg border-2 border-warning/10 bg-gradient-to-br from-background to-warning/5">
            <CardHeader className="bg-gradient-to-r from-warning/10 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-warning">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Textarea 
                rows={3} 
                placeholder="Internal notes about preferences, tone, and past resolutions. Keep concise and actionable." 
                value={note} 
                onChange={e => setNote(e.target.value)}
                className="border-2 focus:border-warning transition-colors"
              />
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (note.trim()) {
                      toast.success('Note saved', { description: 'Your note has been saved successfully.' });
                    } else {
                      toast.error('Please enter a note');
                    }
                  }}
                  className="hover:bg-warning/10 hover:border-warning/50 hover:text-warning"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Support Tickets */}
        <Card className="shadow-lg border-2 border-info/10 bg-gradient-to-br from-background to-info/5">
          <CardHeader className="bg-gradient-to-r from-info/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-info">
              <AlertCircle className="h-5 w-5" />
              Previous Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-6">
            {(customer?.tickets || []).map((t,i)=>(
              <div key={t.id} className="flex gap-4 items-center p-4 border-2 border-info/10 rounded-lg bg-gradient-to-r from-card to-info/5 hover:from-info/5 hover:to-primary/5 hover:border-info/30 hover:shadow-md transition-all group">
                <Badge variant="outline" className="capitalize bg-info/10 border-info/30 text-info font-semibold">
                  {t.id}
                </Badge>
                <span className="flex-1 truncate font-medium">{t.subject}</span>
                <Badge 
                  variant="secondary" 
                  className={`capitalize ${
                    t.status === 'resolved' ? 'bg-success/20 text-success border-success/30' :
                    t.status === 'open' ? 'bg-info/20 text-info border-info/30' :
                    'bg-warning/20 text-warning border-warning/30'
                  }`}
                >
                  {t.status}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* AI customer insight summary */}
        <Card className="shadow-lg border-2 border-purple-500/20 bg-gradient-to-br from-background via-purple-500/5 to-accent/5">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
              AI Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-6">
            <div className="border-2 border-purple-500/20 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-5 text-sm leading-relaxed shadow-inner">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                <b className="text-purple-700 dark:text-purple-300">Summary:</b>
              </div>
              <p className="text-foreground">
                High-value customer with consistent quarterly purchases. Most sensitive to delivery delays; responds well to proactive status updates and small goodwill credits.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
};


