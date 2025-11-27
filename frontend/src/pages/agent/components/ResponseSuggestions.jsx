import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Sparkles, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import agentApi from '../../../services/agentApi';

export const ResponseSuggestions = ({ ticketId, onUseSuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  useEffect(() => {
    if (ticketId) {
      fetchSuggestions();
    }
  }, [ticketId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await agentApi.getResponseSuggestions(ticketId);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setError('Unable to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    if (onUseSuggestion) {
      onUseSuggestion(suggestion.response_text);
      toast.success('Suggestion copied to message input');
    }
  };

  const handleFeedback = async (suggestionId, feedbackType) => {
    const currentFeedback = feedbackState[suggestionId] || {};
    
    setFeedbackState(prev => ({
      ...prev,
      [suggestionId]: {
        ...currentFeedback,
        type: feedbackType,
        showForm: feedbackType !== null
      }
    }));
  };

  const submitFeedback = async (suggestionId) => {
    const feedback = feedbackState[suggestionId];
    
    if (!feedback || feedback.type === null) {
      toast.error('Please select thumbs up or down');
      return;
    }

    try {
      await agentApi.useSuggestion(suggestionId, {
        modified: false,
        rating: feedback.rating || (feedback.type === 'up' ? 5 : 1),
        comment: feedback.comment || ''
      });

      toast.success('Feedback submitted successfully');
      
      setFeedbackState(prev => ({
        ...prev,
        [suggestionId]: {
          ...prev[suggestionId],
          submitted: true
        }
      }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error('Failed to submit feedback');
    }
  };

  const getResponseTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'SOLUTION':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'INFORMATION':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'CLARIFICATION':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'EMPATHY':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (!ticketId) {
    return (
      <Card className="shadow-lg border-2 border-purple-500/20">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Sparkles className="h-5 w-5" />
            AI Response Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a ticket to view AI-generated response suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-purple-500/20 bg-gradient-to-br from-background via-purple-500/5 to-accent/5">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-transparent border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Sparkles className="h-5 w-5" />
            AI Response Suggestions
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 text-xs">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading && suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm text-muted-foreground">Generating AI suggestions...</p>
          </div>
        ) : error && suggestions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Unable to Load Suggestions</p>
              <p className="text-xs mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSuggestions}
                className="mt-2 text-xs"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No suggestions available for this ticket</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => {
                const feedback = feedbackState[suggestion.id] || {};
                
                return (
                  <div
                    key={suggestion.id}
                    className="border-2 border-purple-200/50 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={getResponseTypeColor(suggestion.response_type)}>
                          {suggestion.response_type}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          <span className={getConfidenceColor(suggestion.confidence_score)}>
                            {Math.round(suggestion.confidence_score * 100)}% Confidence
                          </span>
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    </div>

                    {/* Response Text */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-50/30 rounded-lg p-3 mb-3 border border-purple-200/50">
                      <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                        {suggestion.response_text}
                      </p>
                    </div>

                    {/* Reasoning */}
                    {suggestion.reasoning && (
                      <div className="mb-3">
                        <button
                          onClick={() => setExpandedSuggestion(
                            expandedSuggestion === suggestion.id ? null : suggestion.id
                          )}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <Lightbulb className="h-3 w-3" />
                          {expandedSuggestion === suggestion.id ? 'Hide' : 'Show'} AI Reasoning
                        </button>
                        {expandedSuggestion === suggestion.id && (
                          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 rounded p-2 border">
                            {suggestion.reasoning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Knowledge Base Articles */}
                    {suggestion.based_on_kb_articles && suggestion.based_on_kb_articles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Based on KB articles:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.based_on_kb_articles.map((article, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                              {article}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleUseSuggestion(suggestion)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Use This
                      </Button>

                      {!feedback.submitted ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeedback(suggestion.id, 'up')}
                            className={`${
                              feedback.type === 'up'
                                ? 'bg-green-100 border-green-300 text-green-700'
                                : 'hover:bg-green-50'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeedback(suggestion.id, 'down')}
                            className={`${
                              feedback.type === 'down'
                                ? 'bg-red-100 border-red-300 text-red-700'
                                : 'hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Feedback Submitted
                        </Badge>
                      )}
                    </div>

                    {/* Feedback Form */}
                    {feedback.showForm && !feedback.submitted && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Rating (optional)
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFeedbackState(prev => ({
                                  ...prev,
                                  [suggestion.id]: {
                                    ...prev[suggestion.id],
                                    rating: star
                                  }
                                }))}
                                className={`${
                                  (feedback.rating || 0) >= star
                                    ? 'text-yellow-500'
                                    : 'text-gray-300'
                                } hover:text-yellow-400 transition-colors`}
                              >
                                <Star className="h-4 w-4 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Comment (optional)
                          </label>
                          <Textarea
                            rows={2}
                            placeholder="Share your thoughts on this suggestion..."
                            value={feedback.comment || ''}
                            onChange={(e) => setFeedbackState(prev => ({
                              ...prev,
                              [suggestion.id]: {
                                ...prev[suggestion.id],
                                comment: e.target.value
                              }
                            }))}
                            className="text-xs"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => submitFeedback(suggestion.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Submit Feedback
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFeedbackState(prev => ({
                              ...prev,
                              [suggestion.id]: { type: null, showForm: false }
                            }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
