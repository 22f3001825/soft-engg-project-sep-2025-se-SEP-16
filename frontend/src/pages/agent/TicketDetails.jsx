import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { tickets as seedTickets, orders } from '../../data/dummyData';
import { storage, withDelay } from './utils';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MessageSquare, Package, Info, CheckCircle2, XCircle, Ticket, Clock, User, Sparkles, Zap } from 'lucide-react';

export const TicketDetails = ({ ticketId = seedTickets[0]?.id, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [ticket, setTicket] = React.useState(null);

  React.useEffect(() => {
    const all = storage.get('agent.tickets', seedTickets);
    const t = all.find(x => x.id === ticketId) || all[0];
    withDelay(t).then(setTicket);
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="space-y-4 animate-slide-in-up">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const order = orders.find(o => o.id === ticket.orderId);

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

  const handleApproveRefund = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ticket) return;
    
    toast.success('Refund Initiated', {
      description: `Refund for ticket ${ticket.id} has been initiated successfully.`
    });
  };

  const handleReject = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ticket) return;
    
    toast.error('Refund Rejected', {
      description: `Refund request for ticket ${ticket.id} has been rejected.`
    });
  };

  const handleRequestInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast.success('Information Requested', {
      description: 'A request for more information has been sent to the customer.'
    });
  };

  const handleOpenCommunicationTools = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onNavigate) {
      onNavigate('comm');
    }
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-1 shadow-lg">
        <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Ticket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{ticket.subject}</h1>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">{ticket.id}</Badge>
              </div>
            </div>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                Original Issue Description
              </h4>
              <div className="rounded-lg border-2 border-primary/20 p-4 text-sm bg-gradient-to-br from-muted/50 to-muted/30 shadow-inner">
                {ticket.messages[0]?.message || 'No description available'}
              </div>
            </div>
            
            <Separator className="bg-primary/20" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border-2 border-primary/10 p-4 bg-gradient-to-br from-card to-primary/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  Ticket #
                </div>
                <div className="font-bold text-lg text-primary">{ticket.id}</div>
              </div>
              <div className="rounded-lg border-2 border-warning/10 p-4 bg-gradient-to-br from-card to-warning/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Priority
                </div>
                <div className="font-bold text-lg capitalize text-warning">{ticket.priority}</div>
              </div>
              <div className="rounded-lg border-2 border-info/10 p-4 bg-gradient-to-br from-card to-info/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Status
                </div>
                <div className="font-bold text-lg capitalize text-info">{ticket.status}</div>
              </div>
            </div>
            
            {order ? (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  Order Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border-2 border-primary/10 p-4 bg-gradient-to-br from-card to-primary/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground mb-1">Order ID</div>
                    <div className="font-bold text-primary">{order.id}</div>
                  </div>
                  <div className="rounded-lg border-2 border-accent/10 p-4 bg-gradient-to-br from-card to-accent/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground mb-1">Items</div>
                    <div className="font-semibold">{order.items[0]}</div>
                  </div>
                  <div className="rounded-lg border-2 border-success/10 p-4 bg-gradient-to-br from-card to-success/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground mb-1">Amount</div>
                    <div className="font-bold text-success">${order.total}</div>
                  </div>
                  <div className="rounded-lg border-2 border-info/10 p-4 bg-gradient-to-br from-card to-info/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created
                    </div>
                    <div className="font-semibold">{order.date}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-lg border-2 border-purple-500/20 bg-gradient-to-br from-background via-purple-500/5 to-accent/5">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Sparkles className="h-5 w-5" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border-2 border-purple-500/20 p-4 text-sm leading-relaxed shadow-inner">
                Customer report indicates issue related to order {ticket.orderId || 'N/A'}. Recommended next steps: verify payment, confirm shipment status, and follow up with the customer.
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleApproveRefund} 
                  className="flex-1 flex items-center gap-2 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white shadow-md"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Refund
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject} 
                  className="flex-1 flex items-center gap-2 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive shadow-md"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-6">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all" 
                onClick={handleRequestInfo}
              >
                <Info className="h-4 w-4 mr-2" />
                Request More Info
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-accent/10 hover:border-accent/50 hover:text-accent transition-all" 
                onClick={handleOpenCommunicationTools}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Communication Tools
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


