import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '../config/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

      // Set role and permissions for RBAC
      if (userData.registry_role) {
        setRole(userData.registry_role);
        setPermissions(userData.registry_role.permissions || []);
      } else if (userData.is_superuser) {
        // Superuser has all permissions
        setRole({ name: 'Superuser', role_type: 'platform_admin' });
        setPermissions([
          'view_applications', 'review_applications', 'verify_documents',
          'approve_applications', 'reject_applications', 'suspend_licenses',
          'revoke_licenses', 'reactivate_licenses', 'manage_users',
          'view_analytics', 'manage_settings', 'view_audit_logs',
          'view_practice_pages', 'verify_practice_pages', 'flag_practice_pages', 'suspend_practice_pages'
        ]);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token might be expired, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      // Store tokens
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      
      // Get user data
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

      // Set role and permissions for RBAC
      if (userData.registry_role) {
        setRole(userData.registry_role);
        setPermissions(userData.registry_role.permissions || []);
      } else if (userData.is_superuser) {
        // Superuser has all permissions
        setRole({ name: 'Superuser', role_type: 'platform_admin' });
        setPermissions([
          'view_applications', 'review_applications', 'verify_documents',
          'approve_applications', 'reject_applications', 'suspend_licenses',
          'revoke_licenses', 'reactivate_licenses', 'manage_users',
          'view_analytics', 'manage_settings', 'view_audit_logs',
          'view_practice_pages', 'verify_practice_pages', 'flag_practice_pages', 'suspend_practice_pages'
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setRole(null);
    setPermissions([]);
    setIsAuthenticated(false);
  };

  // Permission checking helpers
  const hasPermission = (permission) => {
    if (!isAuthenticated) return false;
    if (user?.is_superuser) return true;
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (!isAuthenticated) return false;
    if (user?.is_superuser) return true;
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!isAuthenticated) return false;
    if (user?.is_superuser) return true;
    return permissionList.every(permission => permissions.includes(permission));
  };

  const isPlatformAdmin = () => {
    if (!isAuthenticated) return false;
    if (user?.is_superuser) return true;
    return role?.role_type === 'platform_admin';
  };

  const value = {
    user,
    role,
    permissions,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isPlatformAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protecting routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return null;
    }
    
    return <Component {...props} />;
  };
};

export default useAuth;