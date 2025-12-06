import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Brain, Sparkles, AlertTriangle, TrendingUp, FileText, Copy } from 'lucide-react';

const AICopilot = () => {
  const [activeTab, setActiveTab] = useState('summarize');
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTicketList, setShowTicketList] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);
  const [showAgentList, setShowAgentList] = useState(false);
  const [recentAgents, setRecentAgents] = useState([]);

  // Fetch recent tickets and agents when component mounts
  React.useEffect(() => {
    const fetchRecentTickets = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/supervisor/tickets', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
        });
        if (response.ok) {
          const tickets = await response.json();
          setRecentTickets(tickets.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      }
    };
    
    const fetchRecentAgents = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/supervisor/agents', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
        });
        if (response.ok) {
          const agents = await response.json();
          setRecentAgents(agents);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    
    fetchRecentTickets();
    fetchRecentAgents();
  }, []);

  // Safe render function for any data type
  const safeRender = (item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return String(item);
    if (typeof item === 'object' && item !== null) {
      // Handle common object structures
      if (item.text && item.rating) return `${item.text} (Rating: ${item.rating})`;
      if (item.text) return item.text;
      if (item.name && item.reason) return `${item.name}: ${item.reason}`;
      if (item.name) return item.name;
      if (item.message) return item.message;
      if (item.reason) return item.reason;
      // For complex objects, extract meaningful text
      const keys = Object.keys(item);
      if (keys.length === 1) return String(item[keys[0]]);
      // Fallback to first string value found
      for (const key of keys) {
        if (typeof item[key] === 'string') return item[key];
      }
      return JSON.stringify(item);
    }
    return String(item || '');
  };

  const handleSummarize = async () => {
    if (!ticketId.trim()) {
      setResult({ error: 'Please enter a ticket ID' });
      return;
    }
    setLoading(true);
    try {
      // Use AI-powered ticket summary endpoint
      const response = await fetch(`http://127.0.0.1:8000/api/v1/copilot/tickets/${ticketId}/summary`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error('Failed to generate AI summary');
      }
    } catch (error) {
      setResult({ error: 'Failed to generate summary', details: error.message });
    }
    setLoading(false);
  };

  const handleFraudAnalysis = async () => {
    if (!ticketId.trim()) {
      setResult({ error: 'Please enter an agent ID' });
      return;
    }
    setLoading(true);
    try {
      // First get agents to find the correct agent ID
      const agentsResponse = await fetch('http://127.0.0.1:8000/api/v1/supervisor/agents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
      });
      
      if (agentsResponse.ok) {
        const agents = await agentsResponse.json();
        const agent = agents.find(a => 
          a.id.toString() === ticketId.trim() || 
          a.name.toLowerCase() === ticketId.trim().toLowerCase() ||
          a.name.toLowerCase().includes(ticketId.trim().toLowerCase())
        );
        
        if (agent) {
          // Use the real copilot API for AI analysis
          const response = await fetch(`http://127.0.0.1:8000/api/v1/copilot/supervisor/agent-performance/${agent.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setResult(data);
          } else {
            throw new Error('Failed to get AI analysis');
          }
        } else {
          const availableAgents = agents.map(a => `${a.name} (ID: ${a.id})`).join(', ');
          setResult({ 
            error: `Agent '${ticketId}' not found`, 
            details: `Available agents: ${availableAgents}` 
          });
        }
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (error) {
      setResult({ error: 'Failed to analyze performance', details: error.message });
    }
    setLoading(false);
  };

  const handleTeamSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/copilot/supervisor/team-insights', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('intellica_token_supervisor')}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch team insights');
      }
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to generate team summary', details: error.message });
    }
    setLoading(false);
  };



  return (
    <Card className="bg-gradient-to-br from-white/90 to-indigo-50/80 backdrop-blur-md border border-indigo-200 rounded-2xl shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-2xl border-b border-indigo-100">
        <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          AI Copilot Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={activeTab === 'summarize' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('summarize')}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Summarize
          </Button>
          <Button
            variant={activeTab === 'fraud' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('fraud')}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-4 w-4" />
            Agent Analysis
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('team')}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            Team Summary
          </Button>

        </div>

        {activeTab !== 'team' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {activeTab === 'summarize' ? 'Ticket ID' : 'Agent ID or Name'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder={activeTab === 'summarize' ? 'Enter ticket ID' : 'Enter agent ID or name (e.g., 11 or Emma Wilson)'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (activeTab === 'summarize') {
                    setShowTicketList(!showTicketList);
                    setShowAgentList(false);
                  } else {
                    setShowAgentList(!showAgentList);
                    setShowTicketList(false);
                  }
                }}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {activeTab === 'summarize' && showTicketList && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                <div className="text-xs font-medium text-gray-600 mb-2">Recent Tickets (Click to select):</div>
                <div className="space-y-1">
                  {recentTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => {
                        setTicketId(ticket.id);
                        setShowTicketList(false);
                      }}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-white rounded border text-gray-700 hover:text-indigo-600"
                    >
                      #{ticket.id} - {ticket.subject?.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'fraud' && showAgentList && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                <div className="text-xs font-medium text-gray-600 mb-2">Available Agents (Click to select):</div>
                <div className="space-y-1">
                  {recentAgents.length > 0 ? recentAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setTicketId(agent.id.toString());
                        setShowAgentList(false);
                      }}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-white rounded border text-gray-700 hover:text-indigo-600"
                    >
{agent.name} (ID: {agent.id})
                    </button>
                  )) : (
                    <div className="text-xs text-gray-500 p-2">No agents found. Loading...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={activeTab === 'summarize' ? handleSummarize : 
                   activeTab === 'fraud' ? handleFraudAnalysis : 
                   handleTeamSummary}
          disabled={loading || (activeTab !== 'team' && !ticketId)}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {activeTab === 'summarize' ? 'Generate Summary' : 
               activeTab === 'fraud' ? 'Analyze Agent Performance' : 
               'Generate Team Report'}
            </div>
          )}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Analysis Results
            </h4>
            
            {result.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <div className="font-medium">Error:</div>
                <div>{result.error}</div>
                {result.details && <div className="text-xs mt-1">Details: {result.details}</div>}
              </div>
            )}
            
            {activeTab === 'summarize' && !result.error && (
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">Summary</Badge>
                  <p className="text-sm text-gray-700">{safeRender(result.summary)}</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Key Points</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.key_points?.map((point, idx) => (
                      <li key={idx}>{safeRender(point)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Customer Sentiment</Badge>
                  <p className="text-sm text-gray-700">{safeRender(result.customer_sentiment) || 'Not analyzed'}</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Urgency Level</Badge>
                  <p className="text-sm text-gray-700">{safeRender(result.urgency_level) || 'Not determined'}</p>
                </div>
              </div>
            )}

            {activeTab === 'fraud' && !result.error && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={result.ai_analysis?.performance_trend === 'IMPROVING' ? 'default' : result.ai_analysis?.performance_trend === 'DECLINING' ? 'destructive' : 'secondary'}>
                    {result.ai_analysis?.performance_trend || 'STABLE'}
                  </Badge>
                  <span className="text-sm text-gray-600">Agent Performance Analysis</span>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Performance Summary</Badge>
                  <p className="text-sm text-gray-700">{safeRender(result.ai_analysis?.performance_summary)}</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Strengths</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_analysis?.strengths?.map((strength, idx) => (
                      <li key={idx}>{safeRender(strength)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Improvement Areas</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_analysis?.improvement_areas?.map((area, idx) => (
                      <li key={idx}>{safeRender(area)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Recommendations</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_analysis?.coaching_recommendations?.map((rec, idx) => (
                      <li key={idx}>{safeRender(rec)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Training Suggestions</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_analysis?.training_suggestions?.map((suggestion, idx) => (
                      <li key={idx}>{safeRender(suggestion)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'team' && !result.error && (
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">Team Assessment</Badge>
                  <p className="text-sm text-gray-700">{safeRender(result.ai_insights?.overall_assessment)}</p>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Top Performers</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_insights?.top_performers?.map((performer, idx) => (
                      <li key={idx}>{safeRender(performer)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Recommendations</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_insights?.recommendations?.map((rec, idx) => (
                      <li key={idx}>{safeRender(rec)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Areas for Improvement</Badge>
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {result.ai_insights?.areas_for_improvement?.map((area, idx) => (
                      <li key={idx}>{safeRender(area)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}


          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AICopilot;