const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiService {
  getToken() {
    const roles = ['customer', 'agent', 'supervisor', 'vendor'];
    for (const role of roles) {
      const token = localStorage.getItem(`intellica_token_${role}`);
      if (token) return token;
    }
    return null;
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
        const roles = ['customer', 'agent', 'supervisor', 'vendor'];
        roles.forEach(role => {
          localStorage.removeItem(`intellica_token_${role}`);
          localStorage.removeItem(`intellica_user_${role}`);
        });
        window.location.href = '/login';
        return;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Dashboard
  async getDashboard() {
    return this.request('/customer/dashboard');
  }

  // Orders
  async getOrders(status = null, search = null) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    
    return this.request(`/customer/orders?${params}`);
  }

  async getOrderDetails(orderId) {
    return this.request(`/customer/orders/${orderId}`);
  }

  async trackOrder(orderId) {
    return this.request(`/customer/orders/track/${orderId}`);
  }

  async requestReturn(returnData) {
    return this.request('/customer/orders/return', {
      method: 'POST',
      body: JSON.stringify(returnData)
    });
  }

  // Tickets
  async getTickets(status = null, search = null) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    
    return this.request(`/customer/tickets?${params}`);
  }

  async createTicket(ticketData) {
    return this.request('/customer/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async getTicketDetails(ticketId) {
    return this.request(`/customer/tickets/${ticketId}`);
  }

  async addTicketMessage(ticketId, content) {
    return this.request(`/customer/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async deleteTicketMessage(ticketId, messageId) {
    return this.request(`/customer/tickets/${ticketId}/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // Profile
  async getProfile() {
    return this.request('/customer/profile');
  }

  async updateProfile(profileData) {
    return this.request('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/customer/profile/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        const roles = ['customer', 'agent', 'supervisor', 'vendor'];
        roles.forEach(role => {
          localStorage.removeItem(`intellica_token_${role}`);
          localStorage.removeItem(`intellica_user_${role}`);
        });
        window.location.href = '/login';
        return;
      }
      throw new Error(`Avatar upload failed: ${response.status}`);
    }
    
    return response.json();
  }

  // Settings
  async getSettings() {
    return this.request('/customer/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/customer/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData)
    });
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    const roles = ['customer', 'agent', 'supervisor', 'vendor'];
    let user = {};
    for (const role of roles) {
      const userData = localStorage.getItem(`intellica_user_${role}`);
      if (userData) {
        user = JSON.parse(userData);
        break;
      }
    }
    if (user.role === 'vendor') {
      const url = `http://localhost:8000/api/vendor/notifications?unread_only=${unreadOnly}`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const roles = ['customer', 'agent', 'supervisor', 'vendor'];
          roles.forEach(role => {
            localStorage.removeItem(`intellica_token_${role}`);
            localStorage.removeItem(`intellica_user_${role}`);
          });
          window.location.href = '/login';
          return [];
        }
        console.error(`Vendor notifications API error: ${response.status}`);
        return [];
      }
      return response.json();
    }
    return this.request(`/customer/notifications?unread_only=${unreadOnly}`);
  }

  async markNotificationRead(notificationId) {
    const roles = ['customer', 'agent', 'supervisor', 'vendor'];
    let user = {};
    for (const role of roles) {
      const userData = localStorage.getItem(`intellica_user_${role}`);
      if (userData) {
        user = JSON.parse(userData);
        break;
      }
    }
    if (user.role === 'vendor') {
      const url = `http://localhost:8000/api/vendor/notifications/${notificationId}/read`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const roles = ['customer', 'agent', 'supervisor', 'vendor'];
          roles.forEach(role => {
            localStorage.removeItem(`intellica_token_${role}`);
            localStorage.removeItem(`intellica_user_${role}`);
          });
          window.location.href = '/login';
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    }
    return this.request(`/customer/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId) {
    const roles = ['customer', 'agent', 'supervisor', 'vendor'];
    let user = {};
    for (const role of roles) {
      const userData = localStorage.getItem(`intellica_user_${role}`);
      if (userData) {
        user = JSON.parse(userData);
        break;
      }
    }
    if (user.role === 'vendor') {
      const url = `http://localhost:8000/api/vendor/notifications/${notificationId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const roles = ['customer', 'agent', 'supervisor', 'vendor'];
          roles.forEach(role => {
            localStorage.removeItem(`intellica_token_${role}`);
            localStorage.removeItem(`intellica_user_${role}`);
          });
          window.location.href = '/login';
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }
      return response.json();
    }
    return this.request(`/customer/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  async uploadAttachment(ticketId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/customer/tickets/${ticketId}/attachments`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        const roles = ['customer', 'agent', 'supervisor', 'vendor'];
        roles.forEach(role => {
          localStorage.removeItem(`intellica_token_${role}`);
          localStorage.removeItem(`intellica_user_${role}`);
        });
        window.location.href = '/login';
        return;
      }
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return response.json();
  }
}

export default new ApiService();