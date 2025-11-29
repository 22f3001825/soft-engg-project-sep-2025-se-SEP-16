const API_BASE_URL = 'http://localhost:8000/api/v1';

class SupervisorApiService {
  getToken() {
    return localStorage.getItem('intellica_token_supervisor');
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
        localStorage.removeItem('intellica_token_supervisor');
        localStorage.removeItem('intellica_user_supervisor');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Dashboard
  async getDashboard() {
    return this.request('/supervisor/dashboard');
  }

  async getAnalytics(timeRange = '24h') {
    return this.request(`/supervisor/analytics?time_range=${timeRange}`);
  }

  // Tickets
  async getTickets(status = null, priority = null, search = null) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (priority && priority !== 'all') params.append('priority', priority);
    if (search) params.append('search', search);
    
    return this.request(`/supervisor/tickets?${params}`);
  }

  async reassignTicket(ticketId, agentId) {
    return this.request(`/supervisor/tickets/${ticketId}/reassign`, {
      method: 'PUT',
      body: JSON.stringify({ agent_id: agentId })
    });
  }

  async resolveTicket(ticketId) {
    return this.request(`/supervisor/tickets/${ticketId}/resolve`, {
      method: 'PUT'
    });
  }

  async closeTicket(ticketId) {
    return this.request(`/supervisor/tickets/${ticketId}/close`, {
      method: 'PUT'
    });
  }

  // Agents
  async getAgents(search = null, statusFilter = null) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status_filter', statusFilter);
    
    return this.request(`/supervisor/agents?${params}`);
  }

  async updateAgentStatus(agentId, isActive) {
    return this.request(`/supervisor/agents/${agentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    });
  }

  // Customers
  async getCustomers(search = null, statusFilter = null) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter && statusFilter !== 'All Customers') params.append('status_filter', statusFilter);
    
    return this.request(`/supervisor/customers?${params}`);
  }

  async updateCustomerStatus(customerId, isActive) {
    return this.request(`/supervisor/customers/${customerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive })
    });
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    const params = unreadOnly ? '?unread_only=true' : '';
    return this.request(`/supervisor/notifications${params}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/supervisor/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/supervisor/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }
}

export default new SupervisorApiService();