// API helper — uses VITE_API_URL, auto-attaches JWT, handles JSON & errors.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const TOKEN_KEY = 'attendai_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Core request helper.
 * @param {string} path - e.g. '/auth/login'
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} parsed JSON body
 * @throws {Error} with `.message` from server or network
 */
export const request = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return null;
  }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP error ${res.status}`);
  }

  return data;
};

// Convenience wrappers
export const get = (path) => request(path, { method: 'GET' });
export const post = (path, body) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) =>
  request(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => request(path, { method: 'DELETE' });

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  me: async () => {
    const res = await get('/auth/me');
    return res?.user || res;
  },
};

// ── Classrooms ────────────────────────────────────────────────────────
export const classroomApi = {
  create: async (data) => {
    const res = await post('/classrooms', data);
    return res?.classroom || res;
  },
  getTeacherClassrooms: async () => {
    const res = await get('/classrooms/teacher');
    return res?.classrooms || (Array.isArray(res) ? res : []);
  },
  getStudentClassrooms: async () => {
    const res = await get('/classrooms/student');
    return res?.classrooms || (Array.isArray(res) ? res : []);
  },
  getById: async (id) => {
    const res = await get(`/classrooms/${id}`);
    return res?.classroom || res;
  },
  join: (id) => post(`/classrooms/${id}/join`, {}),
  removeStudent: (classroomId, studentId) =>
    del(`/classrooms/${classroomId}/students/${studentId}`),
};

// ── Attendance ────────────────────────────────────────────────────────
export const attendanceApi = {
  mark: (data) => post('/attendance', data),
  getClassroomAttendance: async (classroomId, date) => {
    const url = date
      ? `/attendance/classroom/${classroomId}?date=${date}`
      : `/attendance/classroom/${classroomId}`;
    const res = await get(url);
    return res?.attendance || (Array.isArray(res) ? res : []);
  },
  getStudentAttendance: async () => {
    const res = await get('/attendance/student');
    return res?.attendance || (Array.isArray(res) ? res : []);
  },
  getStudentAttendanceForClassroom: async (classroomId) => {
    const res = await get(`/attendance/student/${classroomId}`);
    return res?.attendance || (Array.isArray(res) ? res : []);
  },
  getStudentSummary: async () => {
    const res = await get('/attendance/student/summary');
    return res?.summary || (Array.isArray(res) ? res : []);
  },
  update: (attendanceId, data) => put(`/attendance/${attendanceId}`, data),
  delete: (attendanceId) => del(`/attendance/${attendanceId}`),
};

// ── AI / Face Recognition ──────────────────────────────────────────────────
export const aiApi = {
  /** Check if Python AI service is reachable */
  health: () => get('/ai/health'),

  /** Get student's current face registration status */
  getFaceStatus: () => get('/ai/face-status'),

  /**
   * Register a face photo for the logged-in student.
   * @param {File} photoFile - A File or Blob object
   */
  registerFace: async (photoFile) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('photo', photoFile);

    const res = await fetch(`${BASE_URL}/ai/register-face`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    let data;
    try { data = await res.json(); } catch { throw new Error(`HTTP ${res.status}`); }
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  },

  /** Clear all stored face encodings for the student */
  clearFaceEncodings: () => request('/ai/face-encodings', { method: 'DELETE' }),

  /**
   * Upload classroom group photo for real AI face recognition.
   * @param {string} classroomId
   * @param {File} photoFile - The classroom group image
   */
  recognizeClassroom: async (classroomId, photoFile) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('classroomId', classroomId);
    formData.append('photo', photoFile);

    const res = await fetch(`${BASE_URL}/ai/recognize-classroom`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    let data;
    try { data = await res.json(); } catch { throw new Error(`HTTP ${res.status}`); }
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  },
};

