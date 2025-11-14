const API_BASE_URL = 'http://localhost:8000/api/v1';

class AgentApiService {
  getToken() {
    return localStorage.getItem('intellica_token');
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('intellica_token');
        localStorage.removeItem('intellica_user');
        window.location.href = '/login';
        return;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Dashboard
  async getDashboard() {
    return this.request('/agent/dashboard');
  }

  // Tickets
  async getTickets(status = null, priority = null, assignedOnly = false) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (priority && priority !== 'all') params.append('priority', priority);
    if (assignedOnly) params.append('assigned_only', 'true');
    
    return this.request(`/agent/tickets?${params}`);
  }

  async getTicketDetails(ticketId) {
    return this.request(`/agent/tickets/${ticketId}`);
  }

  async assignTicket(ticketId, agentId = null) {
    return this.request(`/agent/tickets/${ticketId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agent_id: agentId })
    });
  }

  async updateTicketStatus(ticketId, status) {
    return this.request(`/agent/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async addTicketMessage(ticketId, messageData) {
    return this.request(`/agent/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  // Customers
  async getCustomers(search = null) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    return this.request(`/agent/customers?${params}`);
  }

  async getCustomerDetails(customerId) {
    return this.request(`/agent/customers/${customerId}`);
  }

  // Settings
  async getSettings() {
    return this.request('/agent/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/agent/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  async resolveTicket(ticketId) {
    return this.request(`/agent/tickets/${ticketId}/resolve`, {
      method: 'PUT'
    });
  }

  // Refund Management
  async approveRefund(ticketId, refundData = {}) {
    return this.request(`/agent/tickets/${ticketId}/refund/approve`, {
      method: 'POST',
      body: JSON.stringify(refundData)
    });
  }

  async rejectRefund(ticketId, rejectionReason = '') {
    return this.request(`/agent/tickets/${ticketId}/refund/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectionReason })
    });
  }
}

export default new AgentApiService();