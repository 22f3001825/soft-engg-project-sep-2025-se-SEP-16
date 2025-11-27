import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  TrendingUp,
  Info,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import agentApi from '../../../services/agentApi';

export const FraudExplanation = ({ refundId, orderId }) => {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [actualRefundId, setActualRefundId] = useState(refundId);

  useEffect(() => {
    if (refundId) {
      setActualRefundId(refundId);
      fetchExplanation(refundId);
    } else if (orderId) {
      // Try to get refund by order ID
      fetchRefundByOrder(orderId);
    }
  }, [refundId, orderId]);

  const fetchRefundByOrder = async (orderIdParam) => {
    try {
      // This would need a backend endpoint to get refund by order_id
      // For now, we'll just show a message that refund analysis is not available
      setError('Refund analysis available only for tickets with active refund requests');
    } catch (err) {
      console.error('Failed to fetch refund:', err);
      setError('Unable to find refund request');
    }
  };

  const fetchExplanation = async (refundIdParam) => {
    setLoading(true);
    setError(null);

    try {
      const data = await agentApi.getRefundExplanation(refundIdParam);
      setExplanation(data);
    } catch (err) {
      console.error('Failed to fetch refund explanation:', err);
      setError('Unable to load refund explanation');
      toast.error('Failed to load explanation');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'NEEDS_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDecisionIcon = (decision) => {
    switch (decision?.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5" />;
      case 'NEEDS_REVIEW':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (!refundId && !orderId) {
    return (
      <Card className="shadow-lg border-2 border-orange-500/20">
        <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Shield className="h-5 w-5" />
            Refund Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No refund request associated with this ticket</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-orange-500/20 bg-gradient-to-br from-background via-orange-500/5 to-accent/5">
      <CardHeader className="bg-gradient-to-r from-orange-500/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Shield className="h-5 w-5" />
            Refund Analysis
          </CardTitle>
          {explanation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomerView(!showCustomerView)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              {showCustomerView ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-xs">Agent View</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  <span className="text-xs">Customer View</span>
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing refund request...</p>
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Analysis Unavailable</p>
              <p className="text-xs mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchExplanation}
                className="mt-2 text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : !explanation ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No analysis available</p>
          </div>
        ) : (
          <>
            {/* Decision Badge */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={`${getDecisionColor(explanation.decision)} flex items-center gap-2 text-base px-4 py-2`}
              >
                {getDecisionIcon(explanation.decision)}
                {explanation.decision}
              </Badge>
              
              {explanation.confidence_score && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  <span className={getConfidenceColor(explanation.confidence_score)}>
                    {Math.round(explanation.confidence_score * 100)}% Confidence
                  </span>
                </Badge>
              )}
            </div>

            {/* Explanation Text */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-50/30 rounded-lg p-4 border border-orange-200/50">
              <div className="flex items-start gap-2 mb-2">
                <FileText className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-orange-700">
                  {showCustomerView ? 'Customer Explanation' : 'Agent Explanation'}
                </h4>
              </div>
              <p className="text-sm leading-relaxed text-gray-800">
                {showCustomerView 
                  ? explanation.customer_explanation 
                  : explanation.agent_explanation}
              </p>
            </div>

            {/* Reasoning Points */}
            {!showCustomerView && explanation.reasoning_points && explanation.reasoning_points.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Reasoning Points
                </h4>
                <div className="space-y-2">
                  {explanation.reasoning_points.map((point, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 bg-white rounded-lg p-3 border border-orange-200/50"
                    >
                      <ChevronRight className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy References */}
            {!showCustomerView && explanation.policy_sections && explanation.policy_sections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Policy References
                </h4>
                <div className="flex flex-wrap gap-2">
                  {explanation.policy_sections.map((policy, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-orange-50 text-orange-700 border-orange-300"
                    >
                      {policy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {explanation.next_steps && explanation.next_steps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {showCustomerView ? 'What to Expect' : 'Next Steps'}
                </h4>
                <div className="space-y-1.5">
                  {explanation.next_steps.map((step, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-orange-600 font-bold mt-0.5">{index + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cached Indicator */}
            {explanation.cached && (
              <div className="pt-3 border-t text-xs text-muted-foreground text-center">
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                  Cached Analysis
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
