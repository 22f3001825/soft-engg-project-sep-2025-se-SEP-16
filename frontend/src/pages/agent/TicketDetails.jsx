import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AgentLayout } from './AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import agentApi from '../../services/agentApi';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MessageSquare, Package, Info, CheckCircle2, XCircle, Ticket, Clock, User, Sparkles, Zap, RefreshCw, Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KnowledgeBaseSearch } from './components/KnowledgeBaseSearch';
import { FraudExplanation } from './components/FraudExplanation';

export const TicketDetails = () => {
  const { user } = useAuth();
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = React.useState(null);
  const [currentTicketId, setCurrentTicketId] = React.useState(ticket_id || '');
  const [findId, setFindId] = React.useState('');
  const [confirmDialog, setConfirmDialog] = React.useState({ isOpen: false, type: '', data: null });
  
  // AI Summary state
  const [aiSummary, setAiSummary] = React.useState(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [summaryError, setSummaryError] = React.useState(null);

  React.useEffect(() => {
    if (!currentTicketId) {
      setTicket(null);
      return;
    }
    fetchTicketDetails();
  }, [currentTicketId]);

  const fetchTicketDetails = async () => {
    try {
      const data = await agentApi.getTicketDetails(currentTicketId);
      setTicket(data);
      // Fetch AI summary after ticket is loaded
      fetchAISummary(false);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      setTicket(null);
      toast.error('Failed to load ticket details');
    }
  };

  const fetchAISummary = async (regenerate = false) => {
    setSummaryLoading(true);
    setSummaryError(null);
    
    try {
      const summary = await agentApi.getTicketSummary(currentTicketId, regenerate);
      setAiSummary(summary);
      
      if (regenerate) {
        toast.success('Summary regenerated successfully');
      }
    } catch (error) {
      console.error('Failed to fetch AI summary:', error);
      setSummaryError('Unable to load AI summary');
      
      // Set fallback summary
      setAiSummary({
        summary: ticket?.related_order 
          ? `Customer report indicates issue related to order ${ticket.related_order.id}. Recommended next steps: verify payment, confirm shipment status, and follow up with the customer.`
          : 'Customer report indicates general support inquiry. Recommended next steps: gather more information, understand the issue, and provide appropriate assistance.',
        key_points: ['Review ticket details', 'Contact customer if needed'],
        customer_sentiment: 'neutral',
        urgency_level: 'medium',
        confidence_score: 0.5,
        cached: false
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRegenerateSummary = () => {
    fetchAISummary(true);
  };

  

  const order = ticket?.related_order || null;

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

  const renderSearchOnly = (
    <div className="flex min-h-[340px] w-full items-center justify-center">
      <div className="max-w-sm w-full">
        <div className="bg-card rounded-xl shadow-2xl border-2 border-primary/20 px-8 py-10 flex flex-col items-center gap-4 animate-fade-in">
          <Ticket className="h-10 w-10 text-primary mb-3 drop-shadow" />
          <h2 className="text-xl font-bold text-foreground mb-2">Find a Ticket</h2>
          <p className="text-muted-foreground mb-3 text-center leading-relaxed">Enter a ticket ID to view ticket information. Only valid IDs will show results. Search your tickets fast and easy!</p>
          <Input
            placeholder="Enter Ticket ID"
            value={findId}
            onChange={e => setFindId(e.target.value)}
            className="w-full border-2 focus:border-primary shadow-none"
          />
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (findId.trim()) {
                setCurrentTicketId(findId.trim());
              }
            }}
            className="w-full mt-2"
          >
            Find Ticket
          </Button>
        </div>
      </div>
    </div>
  );

  const handleApproveRefund = async () => {
    if (!ticket) return;
    
    try {
      await agentApi.approveRefund(ticket.id, {
        order_id: ticket.related_order?.id,
        amount: ticket.related_order?.total,
        reason: 'Agent approved refund request'
      });
      
      // Update ticket status locally
      setTicket(prev => ({ ...prev, status: 'RESOLVED' }));
      
      toast.success('Refund Approved', {
        description: `Refund for ticket ${ticket.id} has been approved and processed.`
      });
    } catch (error) {
      console.error('Failed to approve refund:', error);
      toast.error('Failed to approve refund', {
        description: 'Please try again or contact system administrator.'
      });
    }
  };

  const handleReject = async () => {
    if (!ticket) return;
    
    try {
      await agentApi.rejectRefund(ticket.id, 'Refund request does not meet policy requirements');
      
      // Update ticket status locally
      setTicket(prev => ({ ...prev, status: 'RESOLVED' }));
      
      toast.error('Refund Rejected', {
        description: `Refund request for ticket ${ticket.id} has been rejected.`
      });
    } catch (error) {
      console.error('Failed to reject refund:', error);
      toast.error('Failed to reject refund', {
        description: 'Please try again or contact system administrator.'
      });
    }
  };

  const handleRequestInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast.success('Information Requested', {
      description: 'A request for more information has been sent to the customer.'
    });
  };



  return (
    <AgentLayout>
      <div className="space-y-6 animate-slide-in-up">
      {!ticket && renderSearchOnly}
      {ticket && (
      <>
        <div className="relative overflow-hidden rounded-xl p-1 shadow-lg" style={{background: 'white'}}>
          <div className="rounded-lg bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">Ticket Details</h1>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/20">{ticket.id}</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/agent/dashboard')} className="ml-auto hover:bg-primary/10 hover:border-primary/50 hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
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
                  {ticket.messages?.[0]?.content || 'No description available'}
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
                      <div className="font-semibold">{order.items?.[0]?.product_name || order.items?.[0] || 'N/A'}</div>
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
                      <div className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="shadow-lg border-2 border-purple-500/20 bg-gradient-to-br from-background via-purple-500/5 to-accent/5">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-5 w-5" />
                    AI Summary
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateSummary}
                    disabled={summaryLoading}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                  >
                    {summaryLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1 text-xs">Regenerate</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {summaryLoading && !aiSummary ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <span className="ml-2 text-sm text-muted-foreground">Generating AI summary...</span>
                  </div>
                ) : summaryError && !aiSummary ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">AI Summary Unavailable</p>
                      <p className="text-xs mt-1">{summaryError}</p>
                    </div>
                  </div>
                ) : aiSummary ? (
                  <>
                    {/* Main Summary */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border-2 border-purple-500/20 p-4 text-sm leading-relaxed shadow-inner">
                      {aiSummary.summary}
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap gap-2">
                      {/* Sentiment Badge */}
                      {aiSummary.customer_sentiment && (
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 ${
                            aiSummary.customer_sentiment === 'POSITIVE' ? 'bg-green-50 text-green-700 border-green-300' :
                            aiSummary.customer_sentiment === 'NEGATIVE' ? 'bg-red-50 text-red-700 border-red-300' :
                            'bg-gray-50 text-gray-700 border-gray-300'
                          }`}
                        >
                          {aiSummary.customer_sentiment === 'POSITIVE' && <TrendingUp className="h-3 w-3" />}
                          {aiSummary.customer_sentiment === 'NEGATIVE' && <TrendingDown className="h-3 w-3" />}
                          {aiSummary.customer_sentiment === 'NEUTRAL' && <Minus className="h-3 w-3" />}
                          {aiSummary.customer_sentiment}
                        </Badge>
                      )}

                      {/* Urgency Badge */}
                      {aiSummary.urgency_level && (
                        <Badge 
                          variant="outline"
                          className={`${
                            aiSummary.urgency_level === 'CRITICAL' || aiSummary.urgency_level === 'HIGH' ? 'bg-red-50 text-red-700 border-red-300' :
                            aiSummary.urgency_level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                            'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          {aiSummary.urgency_level} URGENCY
                        </Badge>
                      )}

                      {/* Category Badge */}
                      {aiSummary.detected_category && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          {aiSummary.detected_category}
                        </Badge>
                      )}

                      {/* Confidence Score */}
                      {aiSummary.confidence_score && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {Math.round(aiSummary.confidence_score * 100)}% Confidence
                        </Badge>
                      )}

                      {/* Cached Indicator */}
                      {aiSummary.cached && (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300 text-xs">
                          Cached
                        </Badge>
                      )}
                    </div>

                    {/* Key Points */}
                    {aiSummary.key_points && aiSummary.key_points.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Key Points:</h4>
                        <ul className="space-y-1.5">
                          {aiSummary.key_points.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span className="text-foreground">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : null}

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      type: 'approve',
                      data: {
                        title: 'Approve Refund',
                        message: `Are you sure you want to approve the refund of $${ticket.related_order?.total || '0.00'} for ticket ${ticket.id}? The customer will be notified of this decision.`,
                        action: handleApproveRefund
                      }
                    })}
                    className="flex-1 flex items-center gap-2 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Refund
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      type: 'reject',
                      data: {
                        title: 'Reject Refund Request',
                        message: `Are you sure you want to reject the refund request for ticket ${ticket.id}? The customer will be notified of this decision.`,
                        action: handleReject
                      }
                    })}
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
                {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                  <Button 
                    className="w-full justify-center bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-base py-6 text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      type: 'resolve',
                      data: {
                        title: 'Mark Ticket as Resolved',
                        message: `Are you sure you want to mark ticket ${ticket.id} as resolved? This will close the ticket and notify the customer.`,
                        action: async () => {
                          try {
                            await agentApi.resolveTicket(ticket.id);
                            setTicket(prev => ({ ...prev, status: 'RESOLVED' }));
                            toast.success('Ticket resolved successfully');
                          } catch (error) {
                            toast.error('Failed to resolve ticket');
                          }
                        }
                      }
                    })}
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <Button 
                    variant="outline"
                    className="w-full justify-center border-orange-300 text-orange-600 hover:bg-orange-50 font-bold text-base py-6 text-lg shadow-lg transition-all"
                    onClick={async () => {
                      try {
                        await agentApi.updateTicketStatus(ticket.id, 'IN_PROGRESS');
                        setTicket(prev => ({ ...prev, status: 'IN_PROGRESS' }));
                        toast.success('Ticket reopened successfully');
                      } catch (error) {
                        toast.error('Failed to reopen ticket');
                      }
                    }}
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Undo Resolve
                  </Button>
                )}
                <Button 
                  className="w-full justify-center bg-gradient-to-r from-primary to-accent text-white font-bold text-base py-6 text-lg shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all"
                  onClick={() => navigate(`/agent/ticket/${ticket.id}/communication`)}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Open Communication Tools
                </Button>
              </CardContent>
            </Card>

            {/* Refund Analysis - Only show if ticket has related order */}
            {ticket.related_order && (
              <FraudExplanation orderId={ticket.related_order.id} />
            )}

            {/* Knowledge Base Search */}
            <KnowledgeBaseSearch isCollapsible={true} defaultExpanded={false} />
          </div>
        </div>
      </>
      )}
      
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: '', data: null })}
        onConfirm={() => {
          confirmDialog.data?.action();
          setConfirmDialog({ isOpen: false, type: '', data: null });
        }}
        title={confirmDialog.data?.title || ''}
        message={confirmDialog.data?.message || ''}
        confirmText={
          confirmDialog.type === 'approve' ? 'Approve Refund' : 
          confirmDialog.type === 'reject' ? 'Reject Request' : 
          'Mark as Resolved'
        }
        cancelText="Cancel"
        type={
          confirmDialog.type === 'approve' || confirmDialog.type === 'resolve' ? 'success' : 'danger'
        }
      />
      </div>
    </AgentLayout>
  );
};


