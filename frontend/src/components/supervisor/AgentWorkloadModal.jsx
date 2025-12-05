import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, AlertCircle } from 'lucide-react';
import supervisorApi from '../../services/supervisorApi';

const AgentWorkloadModal = ({ isOpen, onClose }) => {
  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      fetchAgentWorkload();
    }
  }, [isOpen]);

  const fetchAgentWorkload = async () => {
    try {
      setLoading(true);
      const data = await supervisorApi.getAgentWorkload();
      setWorkloadData(data);
    } catch (error) {
      console.error('Failed to fetch agent workload:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'FREE': return 'bg-green-100 text-green-800';
      case 'LIGHT_LOAD': return 'bg-blue-100 text-blue-800';
      case 'MODERATE_LOAD': return 'bg-yellow-100 text-yellow-800';
      case 'HEAVY_LOAD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="mr-2" size={20} />
            Agent Workload Summary
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-600 mb-3">Filter by Load:</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedFilter('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilter === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    onClick={() => setSelectedFilter('FREE')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilter === 'FREE' ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    FREE
                  </button>
                  <button
                    onClick={() => setSelectedFilter('LIGHT_LOAD')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilter === 'LIGHT_LOAD' ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    LIGHT LOAD
                  </button>
                  <button
                    onClick={() => setSelectedFilter('MODERATE_LOAD')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilter === 'MODERATE_LOAD' ? 'bg-yellow-800 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    MODERATE LOAD
                  </button>
                  <button
                    onClick={() => setSelectedFilter('HEAVY_LOAD')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilter === 'HEAVY_LOAD' ? 'bg-red-800 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    HEAVY LOAD
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {workloadData?.agents?.filter(agent => 
                  selectedFilter === 'ALL' || agent.availability === selectedFilter
                ).map((agent) => (
                  <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{agent.agent_name}</span>

                      </div>
                      <div className="text-sm text-gray-600">
                        Active: {agent.active_tickets} | Solved: {agent.resolved_count} | Rate: {agent.resolution_rate}%
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(agent.availability)}`}>
                        {agent.availability.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                
                {(!workloadData?.agents || workloadData.agents.length === 0) && (
                  <div className="text-gray-500 text-center py-8">
                    No agents available
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentWorkloadModal;