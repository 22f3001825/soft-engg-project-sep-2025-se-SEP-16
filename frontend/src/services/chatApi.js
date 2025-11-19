const API_BASE_URL = 'http://localhost:8000/api/v1';

class ChatApiService {
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
        const roles = ['customer', 'agent', 'supervisor', 'vendor'];
        roles.forEach(role => {
          localStorage.removeItem(`intellica_token_${role}`);
          localStorage.removeItem(`intellica_user_${role}`);
        });
        window.location.href = '/login';
        return;
      }
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Start a new chat conversation
  async startChat(initialMessage = null) {
    return this.request('/chat/start', {
      method: 'POST',
      body: JSON.stringify({ initial_message: initialMessage })
    });
  }

  // Send a message in an existing conversation
  async sendMessage(conversationId, message, categoryFilter = null) {
    return this.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message,
        category_filter: categoryFilter
      })
    });
  }

  // Get chat history for a conversation
  async getChatHistory(conversationId, limit = 50) {
    return this.request(`/chat/history/${conversationId}?limit=${limit}`);
  }

  // Get all conversations for the user
  async getConversations(limit = 20) {
    return this.request(`/chat/conversations?limit=${limit}`);
  }

  // Escalate conversation to human agent
  async escalateToAgent(conversationId, reason) {
    return this.request('/chat/escalate', {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        reason: reason
      })
    });
  }

  // Submit feedback for an AI response
  async submitFeedback(messageId, rating, feedbackText = null) {
    return this.request('/chat/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message_id: messageId,
        rating: rating,
        feedback_text: feedbackText
      })
    });
  }

  // Check health of chat services
  async checkHealth() {
    return this.request('/chat/health');
  }

  // Check refund eligibility
  async checkRefundEligibility(data) {
    return this.request('/chat/check-refund-eligibility', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Get return window for category
  async getReturnWindow(category) {
    return this.request(`/chat/return-window/${category}`);
  }
}

export default new ChatApiService();
