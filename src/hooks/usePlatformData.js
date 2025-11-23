import { useState, useEffect, useCallback, useMemo } from 'react';
import { platformAPI } from '../config/api';

// Custom hook for platform statistics
export const usePlatformStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch platform stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Custom hook for platform users
export const usePlatformUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getUsers(currentFilters);
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateUser = useCallback(async (userData) => {
    try {
      setError(null);
      await platformAPI.updateUser(userData);
      // Refetch users to get updated data
      await fetchUsers();
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Failed to update user:', err);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    pagination, 
    loading, 
    error, 
    refetch: fetchUsers, 
    updateUser 
  };
};

// Custom hook for platform hospitals
export const usePlatformHospitals = (filters = {}) => {
  const [hospitals, setHospitals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHospitals = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getHospitals(currentFilters);
      setHospitals(data.hospitals || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch hospitals:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateHospital = useCallback(async (hospitalData) => {
    try {
      setError(null);
      await platformAPI.updateHospital(hospitalData);
      // Refetch hospitals to get updated data
      await fetchHospitals();
      return { success: true };
    } catch (err) {
      setError(err.message);
      console.error('Failed to update hospital:', err);
      return { success: false, error: err.message };
    }
  }, [fetchHospitals]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return { 
    hospitals, 
    pagination, 
    loading, 
    error, 
    refetch: fetchHospitals, 
    updateHospital 
  };
};

// Custom hook for payment analytics
export const usePlatformPayments = (filters = {}) => {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getPayments(currentFilters);
      setPayments(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refetch: fetchPayments };
};

// Custom hook for platform analytics
export const usePlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

// Custom hook for hospital admin contacts
export const useHospitalAdminContacts = (filters = {}) => {
  const [contacts, setContacts] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await platformAPI.getContacts(memoizedFilters);
      setContacts(data.contacts || null);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch hospital admin contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, summary, loading, error, refetch: fetchContacts };
};

// Combined hook for dashboard data
export const useDashboardData = () => {
  const statsHook = usePlatformStats();
  const analyticsHook = usePlatformAnalytics();

  return {
    stats: statsHook.stats,
    analytics: analyticsHook.analytics,
    loading: statsHook.loading || analyticsHook.loading,
    error: statsHook.error || analyticsHook.error,
    refetch: () => {
      statsHook.refetch();
      analyticsHook.refetch();
    }
  };
};

const platformDataHooks = {
  usePlatformStats,
  usePlatformUsers,
  usePlatformHospitals,
  usePlatformPayments,
  usePlatformAnalytics,
  useHospitalAdminContacts,
  useDashboardData,
};

export default platformDataHooks;