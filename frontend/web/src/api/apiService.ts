import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // This would be your actual API base URL in production
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("securityUser");
    if (user) {
      const token = JSON.parse(user).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration or unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // In a real app, you would refresh the token here
        // For now, we'll just log out the user
        localStorage.removeItem("securityUser");
        window.location.href = "/login";
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Define types to ensure correct type checking
export type ScanStatus = "pending" | "completed" | "failed" | "in-progress";
export type SeverityLevel = "high" | "medium" | "low" | "info";
export type UserStatus = "active" | "blocked";

// Authentication service
export const authApi = {
  login: async (email: string, password: string) => {
    const user = (await api.post("/auth/login", { email, password })) as {
      data: {
        token: string;
      };
    };
    console.log(user);
    if (!user?.data?.token) {
      localStorage.set("securityUser", user?.data?.token);
      return { data: { message: "Login successful" } };
    } else {
      // return { data: { message: 'Login failed' } };
      throw new Error("Login failed");
    }
    // In a real app, this would be an actual API call
    // For the demo, we're using mocked data in AuthContext
  },
  register: async (name: string, email: string, password: string) => {
    // In a real app, this would be an actual API call
    return { data: { message: "Registration successful" } };
  },
  logout: async () => {
    // In a real app, this would be an actual API call
    return { data: { message: "Logout successful" } };
  },
};

// Scan service
export const scanApi = {
  submitScan: async (scanData: any) => {
    const response = await api.post("/user/submit-scan", scanData);
    return response.data;
  },
  getScanStatus: async (scanId: string) => {
    const response = await api.get(`/user/status/${scanId}`);
    return response.data;
  },
  getScanHistory: async () => {
    // return {
    //   data: [
    //     {
    //       id: '1',
    //       url: 'https://example.com',
    //       type: 'Full',
    //       status: 'completed' as ScanStatus,
    //       date: '2023-05-08T10:30:00Z',
    //       vulnerabilities: 3,
    //     },
    //     {
    //       id: '2',
    //       url: 'https://test-site.com',
    //       type: 'Basic',
    //       status: 'completed' as ScanStatus,
    //       date: '2023-05-07T14:20:00Z',
    //       vulnerabilities: 0,
    //     },
    //     {
    //       id: '3',
    //       url: 'https://demo.org',
    //       type: 'Custom',
    //       status: 'pending' as ScanStatus,
    //       date: '2023-05-09T09:45:00Z',
    //       vulnerabilities: null,
    //     },
    //     {
    //       id: '4',
    //       url: 'https://broken-site.net',
    //       type: 'Full',
    //       status: 'failed' as ScanStatus,
    //       date: '2023-05-06T16:10:00Z',
    //       vulnerabilities: null,
    //     },
    //   ]
    // };
    const response = await api.get("/user/scan-history");
    const scans = response.data.data.map((scan: any) => ({
      id: scan.scan_id || scan._id,
      url: scan.url,
      type: scan.scan_type
        ? scan.scan_type.charAt(0).toUpperCase() + scan.scan_type.slice(1)
        : "",
      status: scan.status || "completed",
      date: scan.createdAt,
      vulnerabilities: Array.isArray(scan.response?.vulnerabilities)
        ? scan.response.vulnerabilities.length
        : 0,
    }));
    return { data: scans };
  },
  // getScanResult: async (scanId: string) => {
  //   // In a real app, this would be an actual API call
  //   // For the demo, return mock data based on ID with proper typing
  //   return {
  //     data: {
  //       id: scanId,
  //       url: scanId === '1' ? 'https://example.com' : 'https://test-site.com',
  //       type: scanId === '1' ? 'Full' : 'Basic',
  //       status: 'completed' as ScanStatus,
  //       date: new Date().toISOString(),
  //       duration: '1m 45s',
  //       summary: {
  //         high: scanId === '1' ? 2 : 0,
  //         medium: scanId === '1' ? 1 : 0,
  //         low: scanId === '1' ? 3 : 1,
  //         info: scanId === '1' ? 5 : 2,
  //       },
  //       findings: scanId === '1' ? [
  //         {
  //           id: 'CVE-2023-1234',
  //           severity: 'high' as SeverityLevel,
  //           title: 'SQL Injection Vulnerability',
  //           description: 'The application is vulnerable to SQL injection attacks which could lead to unauthorized data access.',
  //           location: '/search?q=',
  //           remediation: 'Use parameterized queries or prepared statements.',
  //         },
  //         {
  //           id: 'CVE-2023-5678',
  //           severity: 'high' as SeverityLevel,
  //           title: 'Cross-Site Scripting (XSS)',
  //           description: 'The application does not properly sanitize user input, allowing injection of malicious scripts.',
  //           location: '/comment',
  //           remediation: 'Implement proper input validation and output encoding.',
  //         },
  //         {
  //           id: 'WEAK-TLS',
  //           severity: 'medium' as SeverityLevel,
  //           title: 'Weak TLS Configuration',
  //           description: 'The server is using outdated TLS protocols that have known vulnerabilities.',
  //           location: 'Server Configuration',
  //           remediation: 'Update server configuration to use only TLS 1.2 or higher.',
  //         },
  //         {
  //           id: 'COOKIE-FLAGS',
  //           severity: 'low' as SeverityLevel,
  //           title: 'Missing Secure Flag on Cookies',
  //           description: 'Cookies are being sent without the secure flag, which could expose them to interception.',
  //           location: 'Cookie Headers',
  //           remediation: 'Add the Secure flag to all cookies that contain sensitive information.',
  //         },
  //       ] : [
  //         {
  //           id: 'COOKIE-FLAGS',
  //           severity: 'low' as SeverityLevel,
  //           title: 'Missing Secure Flag on Cookies',
  //           description: 'Cookies are being sent without the secure flag, which could expose them to interception.',
  //           location: 'Cookie Headers',
  //           remediation: 'Add the Secure flag to all cookies that contain sensitive information.',
  //         }
  //       ],
  //     }
  //   };
  // }
  getScanResult: async (scanId: string) => {
    // Call your backend endpoint
    const response = await api.get(`/user/scan/${scanId}`);
    const scan = response.data.data;

    // Defensive: handle missing fields
    const vulnerabilities = Array.isArray(scan.response?.vulnerabilities)
      ? scan.response.vulnerabilities
      : [];

    // Map backend data to frontend structure
    return {
      data: {
        id: scan.scan_id || scan._id,
        url: scan.url,
        type: scan.scan_type
          ? scan.scan_type.charAt(0).toUpperCase() + scan.scan_type.slice(1)
          : "",
        status: scan.status || "completed",
        date: scan.createdAt,
        duration: scan.duration || "", // If you store duration, else leave blank or calculate
        summary: {
          high: vulnerabilities.filter(
            (v: any) =>
              v.risk?.toLowerCase() === "critical" ||
              v.risk?.toLowerCase() === "high"
          ).length,
          medium: vulnerabilities.filter(
            (v: any) => v.risk?.toLowerCase() === "medium"
          ).length,
          low: vulnerabilities.filter(
            (v: any) => v.risk?.toLowerCase() === "low"
          ).length,
          info: vulnerabilities.filter(
            (v: any) => v.risk?.toLowerCase() === "info"
          ).length,
        },
        findings: vulnerabilities.map((v: any, idx: number) => ({
          id: v.id || `finding-${idx}`,
          severity:
            v.risk?.toLowerCase() === "critical"
              ? "high"
              : v.risk?.toLowerCase() === "high"
              ? "high"
              : v.risk?.toLowerCase() === "medium"
              ? "medium"
              : v.risk?.toLowerCase() === "low"
              ? "low"
              : "info",
          title: v.title || "No title",
          description: v.description || "",
          location: v.evidence || "",
          remediation: v.remediation || "",
        })),
      },
    };
  },
};

// User service
export const userApi = {
  getAllUsers: async () => {
    // return {
    //   data: [
    //     {
    //       id: '1',
    //       name: 'Admin User',
    //       email: 'admin@example.com',
    //       isAdmin: true,
    //       lastLogin: '2023-05-09T10:30:00Z',
    //       status: 'active' as UserStatus,
    //     },
    //     {
    //       id: '2',
    //       name: 'Regular User',
    //       email: 'user@example.com',
    //       isAdmin: false,
    //       lastLogin: '2023-05-08T14:45:00Z',
    //       status: 'active' as UserStatus,
    //     },
    //     {
    //       id: '3',
    //       name: 'Test User',
    //       email: 'test@example.com',
    //       isAdmin: false,
    //       lastLogin: '2023-05-05T09:20:00Z',
    //       status: 'blocked' as UserStatus,
    //     },
    //   ]
    // };
    const response = await api.get("/user/");
    const users = response.data.users.map((u: any) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      isAdmin: u.role === "admin",
      lastLogin: u.updatedAt,
      status: u.isActive ? "active" : "blocked",
    }));
    return { data: users };
  },
  getUserProfile: async () => {
    // In a real app, this would be an actual API call
    const user = localStorage.getItem("securityUser");
    if (user) {
      return {
        data: JSON.parse(user),
      };
    }
    throw new Error("User not found");
  },
  updateUserProfile: async (userId: string, profileData: any) => {
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    const response = await api.patch(`/user/update/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/user/${id}`);
    return { data: response.data.user };
  },

  updateUserPassword: async (
    userId: string,
    passwords: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ) => {
    const response = await api.post(`/user/pass-update/${userId}`, passwords);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/user/delete/${userId}`);
    return response.data;
  },
  toggleUserStatus: async (userId: string, status: string) => {
    // In a real app, this would be an actual API call
    return { data: { message: `User status changed to ${status}` } };
  },
  blockUser: async (userId: string) => {
    return api.patch(`/admin/block/${userId}`);
  },
  activateUser: async (userId: string) => {
    return api.patch(`/admin/activate/${userId}`);
  },
};

export default api;
