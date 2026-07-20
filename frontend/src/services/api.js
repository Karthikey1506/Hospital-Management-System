const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('medpulse_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An API error occurred');
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => apiFetch('/auth/me'),

  // Patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/patients${query ? `?${query}` : ''}`);
  },
  getPatientById: (id) => apiFetch(`/patients/${id}`),
  createPatient: (data) => apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => apiFetch(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id) => apiFetch(`/patients/${id}`, { method: 'DELETE' }),

  // Doctors & Depts
  getDoctors: () => apiFetch('/doctors'),
  getDepartments: () => apiFetch('/departments'),

  // Appointments
  getAppointments: () => apiFetch('/appointments'),
  createAppointment: (data) => apiFetch('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) => apiFetch(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Beds
  getBeds: () => apiFetch('/beds'),
  updateBedStatus: (id, status, patientId = null) => apiFetch(`/beds/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, patientId }) }),

  // Pharmacy & Prescriptions
  getMedicines: () => apiFetch('/medicines'),
  getPrescriptions: () => apiFetch('/prescriptions'),
  createPrescription: (data) => apiFetch('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),

  // Lab Tests
  getLabTests: () => apiFetch('/lab-tests'),
  createLabTest: (data) => apiFetch('/lab-tests', { method: 'POST', body: JSON.stringify(data) }),
  updateLabTest: (id, data) => apiFetch(`/lab-tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Billing
  getBilling: () => apiFetch('/billing'),
  createBill: (data) => apiFetch('/billing', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => apiFetch('/analytics')
};
