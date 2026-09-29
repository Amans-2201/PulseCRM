const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Stats & System
  getStats: () => request('/stats'),
  getSystemInfo: () => request('/system/info'),
  resetDatabase: () => request('/system/reset', { method: 'POST' }),
  exportDatabaseUrl: `${API_BASE}/system/export`,

  // Contacts
  getContacts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.company_id) searchParams.append('company_id', params.company_id);
    const queryString = searchParams.toString();
    return request(`/contacts${queryString ? `?${queryString}` : ''}`);
  },
  getContact: (id) => request(`/contacts/${id}`),
  createContact: (data) => request('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id, data) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),

  // Companies
  getCompanies: () => request('/companies'),
  createCompany: (data) => request('/companies', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (id, data) => request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCompany: (id) => request(`/companies/${id}`, { method: 'DELETE' }),

  // Deals
  getDeals: () => request('/deals'),
  createDeal: (data) => request('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateDealStage: (id, stage) => request(`/deals/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.type && params.type !== 'all') searchParams.append('type', params.type);
    if (params.contact_id) searchParams.append('contact_id', params.contact_id);
    if (params.deal_id) searchParams.append('deal_id', params.deal_id);
    const queryString = searchParams.toString();
    return request(`/activities${queryString ? `?${queryString}` : ''}`);
  },
  createActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id, data) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id) => request(`/activities/${id}`, { method: 'DELETE' }),

  // Notes
  getNotes: (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return request(`/notes${searchParams ? `?${searchParams}` : ''}`);
  },
  createNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};
