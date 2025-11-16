const API_BASE_URL = 'http://localhost:8000/api/vendor';

class VendorApiService {
  getToken() {
    return localStorage.getItem('intellica_token_vendor');
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
        localStorage.removeItem('intellica_token_vendor');
        localStorage.removeItem('intellica_user_vendor');
        window.location.href = '/login';
        return;
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Analytics
  async getAnalytics(dateRange = '30') {
    return this.request(`/analytics?date_range=${dateRange}`);
  }

  // Product Complaints
  async getComplaints() {
    return this.request('/complaints');
  }

  // Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(profileData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }
}

export default new VendorApiService();