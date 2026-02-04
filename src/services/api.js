const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  // Visitors endpoints
  async getVisitors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/visitors${queryString ? `?${queryString}` : ''}`);
  }

  async getVisitor(id) {
    return this.request(`/visitors/${id}`);
  }

  async createVisitor(visitorData) {
    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitorData)
    });
  }

  async updateVisitor(id, visitorData) {
    return this.request(`/visitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitorData)
    });
  }

  async deleteVisitor(id) {
    return this.request(`/visitors/${id}`, {
      method: 'DELETE'
    });
  }

  async getVisitorStats() {
    return this.request('/visitors/stats/overview');
  }

  // Visits endpoints
  async getVisits(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/visits${queryString ? `?${queryString}` : ''}`);
  }

  async getVisit(id) {
    return this.request(`/visits/${id}`);
  }

  async createVisit(visitData) {
    return this.request('/visits', {
      method: 'POST',
      body: JSON.stringify(visitData)
    });
  }

  async updateVisit(id, visitData) {
    return this.request(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitData)
    });
  }

  async deleteVisit(id) {
    return this.request(`/visits/${id}`, {
      method: 'DELETE'
    });
  }

  async getVisitStats() {
    return this.request('/visits/stats/overview');
  }

  // Appointments endpoints
  async getAppointments(params = {}) {
    // Filter out undefined values to avoid URLSearchParams converting them to "undefined" string
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(filteredParams).toString();
    return this.request(`/appointments${queryString ? `?${queryString}` : ''}`);
  }

  async getAppointment(id) {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  }

  async deleteAppointment(id) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE'
    });
  }

  async getAppointmentStats() {
    return this.request('/appointments/stats/overview');
  }

  // Customers endpoints
  async getCustomers(params = {}) {
    // Filter out undefined values to avoid URLSearchParams converting them to "undefined" string
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(filteredParams).toString();
    return this.request(`/customers${queryString ? `?${queryString}` : ''}`);
  }

  async getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async updateCustomer(id, customerData) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE'
    });
  }

  // Applications endpoints
  async getApplications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/applications${queryString ? `?${queryString}` : ''}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async updateApplication(id, applicationData) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData)
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE'
    });
  }

  async getApplicationStats() {
    return this.request('/applications/stats/overview');
  }

  // Staff endpoints
  async getStaff(params = {}) {
    // Filter out undefined values to avoid URLSearchParams converting them to "undefined" string
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(filteredParams).toString();
    return this.request(`/staff${queryString ? `?${queryString}` : ''}`);
  }

  async getStaffMember(id) {
    return this.request(`/staff/${id}`);
  }

  async createStaffMember(staffData) {
    return this.request('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  }

  async updateStaffMember(id, staffData) {
    return this.request(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData)
    });
  }

  async deleteStaffMember(id) {
    return this.request(`/staff/${id}`, {
      method: 'DELETE'
    });
  }

  async getStaffStats() {
    return this.request('/staff/stats/overview');
  }

  async getStaffApplications(staffId, limit = 10) {
    return this.request(`/staff/${staffId}/applications?limit=${limit}`);
  }

  // Services endpoints
  async getServices(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/services${queryString ? `?${queryString}` : ''}`);
  }

  async getService(id) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(id, serviceData) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    });
  }

  async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  async getServiceStats() {
    return this.request('/services/stats/overview');
  }

  // Service Categories endpoints
  async getServiceCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/service-categories${queryString ? `?${queryString}` : ''}`);
  }

  async getServiceCategory(id) {
    return this.request(`/service-categories/${id}`);
  }

  async createServiceCategory(categoryData) {
    return this.request('/service-categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateServiceCategory(id, categoryData) {
    return this.request(`/service-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteServiceCategory(id) {
    return this.request(`/service-categories/${id}`, {
      method: 'DELETE'
    });
  }

  async getServiceCategoryStats() {
    return this.request('/service-categories/stats/overview');
  }

  // Reports endpoints
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports${queryString ? `?${queryString}` : ''}`);
  }

  async getReport(id) {
    return this.request(`/reports/${id}`);
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  }

  async updateReport(id, reportData) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    });
  }

  async deleteReport(id) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE'
    });
  }

  async getDashboardStats() {
    return this.request('/reports/stats/dashboard');
  }

  async getOverviewStats(period = '30days') {
    return this.request(`/reports/stats/overview?period=${period}`);
  }

  async getApplicationStats(period = '30days') {
    return this.request(`/reports/stats/applications?period=${period}`);
  }

  async getStaffStats() {
    return this.request('/reports/stats/staff');
  }

  async getRevenueStats(period = '30days') {
    return this.request(`/reports/stats/revenue?period=${period}`);
  }

  async getCustomerStats() {
    return this.request('/reports/stats/customers');
  }

  // Documents API
  async getDocuments(params = {}) {
    const queryString = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
    ).toString();
    return this.request(`/documents${queryString ? `?${queryString}` : ''}`);
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  async uploadDocument(formData) {
    const token = localStorage.getItem('token');
    const url = `${this.baseURL}/documents`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateDocument(id, documentData) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE'
    });
  }

  async viewDocument(id) {
    const token = localStorage.getItem('token');
    const url = `${this.baseURL}/documents/${id}/view`;
    
    // Fetch the document and open in new tab
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to view document');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        window.URL.revokeObjectURL(blobUrl);
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      // Clean up the blob URL after the window is closed or after a delay
      setTimeout(() => {
        try {
          window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }, 1000);
    } catch (error) {
      throw error;
    }
  }

  async downloadDocument(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'document';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getDocumentCategories() {
    return this.request('/documents/meta/categories');
  }

  async createDocumentCategory(categoryData) {
    return this.request('/documents/meta/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateDocumentCategory(id, categoryData) {
    return this.request(`/documents/meta/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteDocumentCategory(id) {
    return this.request(`/documents/meta/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Users endpoints
  async getUsers(params = {}) {
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(filteredParams).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  async getUserStats() {
    return this.request('/users/stats/overview');
  }

  // Agents (users with role=agent) – list with application stats
  async getAgents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/agents${qs ? `?${qs}` : ''}`);
  }

  async getAgent(id) {
    return this.request(`/agents/${id}`);
  }

  // User avatar upload (multipart/form-data)
  async uploadUserAvatar(userId, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseURL}/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Content-Type omitted so browser sets correct multipart boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Staff avatar upload (multipart/form-data)
  async uploadStaffAvatar(staffId, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.baseURL}/staff/${staffId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Permissions endpoints
  async getPermissions(params = {}) {
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(filteredParams).toString();
    return this.request(`/permissions${queryString ? `?${queryString}` : ''}`);
  }

  async getPermission(id) {
    return this.request(`/permissions/${id}`);
  }

  async createPermission(permissionData) {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData)
    });
  }

  async updatePermission(id, permissionData) {
    return this.request(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData)
    });
  }

  async deletePermission(id) {
    return this.request(`/permissions/${id}`, {
      method: 'DELETE'
    });
  }

  async getUserPermissions(userId) {
    return this.request(`/permissions/user/${userId}`);
  }

  async setUserPermissions(userId, permissions) {
    return this.request(`/permissions/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ permissions })
    });
  }

  async getRolePermissions(role) {
    return this.request(`/permissions/role/${role}`);
  }

  async setRolePermissions(role, permissions) {
    return this.request(`/permissions/role/${role}`, {
      method: 'POST',
      body: JSON.stringify({ permissions })
    });
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  /** Public settings (no auth) – for login/register page logo */
  async getPublicSettings() {
    const url = `${this.baseURL}/settings/public`;
    const response = await fetch(url);
    if (!response.ok) return { siteLogo: '' };
    return response.json();
  }

  async uploadSiteLogo(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', file);
    const response = await fetch(`${this.baseURL}/settings/logo`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload logo');
    }
    return response.json();
  }

  async getSetting(key) {
    return this.request(`/settings/${key}`);
  }

  async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings })
    });
  }

  async updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  // Public website (corporate site) – no auth for GET
  async getWebsitePages() {
    const url = `${this.baseURL}/website/pages`;
    const response = await fetch(url);
    if (!response.ok) return { pages: [] };
    return response.json();
  }

  async getWebsitePage(slug) {
    const url = `${this.baseURL}/website/pages/${slug}`;
    const response = await fetch(url);
    if (!response.ok) return { page: null };
    return response.json();
  }

  async updateWebsitePage(slug, data) {
    return this.request(`/website/pages/${encodeURIComponent(slug)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Website image upload (admin)
  async uploadWebsiteImage(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseURL}/website/upload`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return response.json();
  }

  // Slider (public + admin)
  async getWebsiteSlides(page = 'home') {
    const res = await fetch(`${this.baseURL}/website/slides?page=${encodeURIComponent(page)}`);
    if (!res.ok) return { slides: [] };
    return res.json();
  }
  async getWebsiteSlidesAll() {
    return this.request('/website/slides/all');
  }
  async createWebsiteSlide(data) {
    return this.request('/website/slides', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateWebsiteSlide(id, data) {
    return this.request(`/website/slides/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteWebsiteSlide(id) {
    return this.request(`/website/slides/${id}`, { method: 'DELETE' });
  }

  // Blog (public + admin)
  async getBlogPosts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseURL}/website/blog${qs ? `?${qs}` : ''}`);
    if (!res.ok) return { posts: [], pagination: {} };
    return res.json();
  }
  async getBlogPostsAll() {
    return this.request('/website/blog/all');
  }
  async getBlogPost(slug) {
    return this.request(`/website/blog/${encodeURIComponent(slug)}`);
  }
  async createBlogPost(data) {
    return this.request('/website/blog', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateBlogPost(id, data) {
    return this.request(`/website/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteBlogPost(id) {
    return this.request(`/website/blog/${id}`, { method: 'DELETE' });
  }

  // Jobs (public + admin)
  async getJobPosts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseURL}/website/jobs${qs ? `?${qs}` : ''}`);
    if (!res.ok) return { jobs: [], pagination: {} };
    return res.json();
  }
  async getJobPostsAll() {
    return this.request('/website/jobs/all');
  }
  async getJobPost(slug) {
    return this.request(`/website/jobs/${encodeURIComponent(slug)}`);
  }
  async createJobPost(data) {
    return this.request('/website/jobs', { method: 'POST', body: JSON.stringify(data) });
  }
  async updateJobPost(id, data) {
    return this.request(`/website/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  async deleteJobPost(id) {
    return this.request(`/website/jobs/${id}`, { method: 'DELETE' });
  }

  // Job applications (public submit; admin list/view/update)
  async submitJobApplication(jobId, { applicant_name, applicant_email, applicant_phone, cover_letter }, resumeFile = null) {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('applicant_name', applicant_name);
    formData.append('applicant_email', applicant_email);
    if (applicant_phone) formData.append('applicant_phone', applicant_phone);
    if (cover_letter) formData.append('cover_letter', cover_letter);
    if (resumeFile) formData.append('resume', resumeFile);
    const url = `${this.baseURL}/website/jobs/apply`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Application failed');
    }
    return response.json();
  }

  async getJobApplications(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/website/job-applications${qs ? `?${qs}` : ''}`);
  }

  async getJobApplication(id) {
    return this.request(`/website/job-applications/${id}`);
  }

  async updateJobApplication(id, data) {
    return this.request(`/website/job-applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Agent applications (admin: list, approve, reject)
  async getAgentApplications(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/agent-applications${qs ? `?${qs}` : ''}`);
  }

  async getAgentApplicationsCount(status = 'pending') {
    const res = await this.request(`/agent-applications/count?status=${encodeURIComponent(status)}`);
    return res.count ?? 0;
  }

  async approveAgentApplication(id) {
    return this.request(`/agent-applications/${id}/approve`, { method: 'POST' });
  }

  async rejectAgentApplication(id, message) {
    return this.request(`/agent-applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;


