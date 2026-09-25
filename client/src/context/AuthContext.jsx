import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_USERS = {
  student: {
    id: "s1",
    name: "Ankush Raj",
    email: "ankush.raj@college.edu",
    role: "student",
    rollNo: "24105129015",
    department: "Computer Science & Engineering",
    semester: "4th Semester",
    section: "A",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
  },
  teacher: {
    id: "t1",
    name: "Prof. Dr. Rajesh Sharma",
    email: "rajesh.sharma@college.edu",
    role: "teacher",
    empId: "EMP-CS-101",
    department: "Computer Science & Engineering",
    designation: "Associate Professor & HOD",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  admin: {
    id: "a1",
    name: "Dr. Vikram Sen",
    email: "admin@college.edu",
    role: "admin",
    empId: "ADM-HQ-001",
    department: "Academic Administration",
    designation: "Dean of Academics & System Admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('attendai_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USERS.student;
    } catch {
      return DEFAULT_USERS.student;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('attendai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('attendai_user');
    }
  }, [user]);

  const login = (role, customInfo = {}) => {
    const baseUser = DEFAULT_USERS[role] || DEFAULT_USERS.student;
    const finalUser = { ...baseUser, ...customInfo, role };
    setUser(finalUser);
    return finalUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendai_user');
  };

  const switchRole = (newRole) => {
    if (DEFAULT_USERS[newRole]) {
      setUser(DEFAULT_USERS[newRole]);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
